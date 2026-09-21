"""Create the Supabase schema and load the catalogue, embeddings and recyclers.

    python ml/seed_supabase.py --excel "/path/SIH_2026_EWaste_Recycler_Dataset.xlsx"

Reads SUPABASE_DB_URL from .env.local (never used by the website itself).
Re-running is safe: catalogue and recyclers are upserted, embeddings replaced.
"""
import argparse
import datetime as dt
import json
import os

import numpy as np
import openpyxl
import psycopg

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RUNS = os.path.join(HERE, "runs")

# The sheet has no coordinates. Approximate town-level locations so the
# "nearest recycler" match works; flagged via location_is_approximate.
APPROX_COORDS = {
    "R0001": (21.3236, 74.5670),  # Dondaicha, Dhule
    "R0002": (19.3350, 73.0350),  # Borpada, Bhiwandi
    "R0003": (19.3350, 73.0350),
    "R0004": (20.1040, 73.8450),  # Dhakambe, Nashik
    "R0005": (18.5400, 73.2200),  # Hedavli, Raigad
    "R0006": (19.4210, 72.8750),  # Gokhiware, Vasai
    "R0007": (19.4000, 73.1300),  # Pali, Thane
    "R0008": (19.6000, 73.1000),  # Kelthan, Wada
    "R0009": (19.4420, 72.8700),  # Wakanpada Dhaniv, Vasai
    "R0010": (18.7700, 74.2400),  # MIDC Ranjangaon, Pune
    "R0011": (19.1350, 73.0600),  # Dahisar, Thane
    "R0012": (18.3180, 73.8780),  # Velu, Pune
    "R0013": (18.3180, 73.8780),
    "R0014": (18.6060, 73.7300),  # Marunji, Pune
    "R0015": (18.6060, 73.7300),
    "R0016": (18.8200, 73.2700),  # Dhekhu, Raigad
    "R0017": (18.4580, 73.9680),  # Uruli Devachi, Pune
    "R0018": (19.2967, 73.0631),  # Bhiwandi
    "R0019": (19.0620, 73.1250),  # Adiwali, Raigad
    "R0020": (16.7050, 74.2433),  # Kolhapur
    "R0021": (19.1830, 77.0280),  # Purna, Parbhani
    "R0022": (18.7550, 73.8250),  # Khalumbre, Pune
    "R0023": (22.4700, 88.1000),  # Maheshrekha, Howrah
    "R0024": (23.0500, 88.2500),  # Jarua, Hooghly
    "R0025": (22.6100, 88.4800),  # Khamar, North 24 Parganas
    "R0026": (17.6990, 83.2000),  # Mindi, Visakhapatnam
    "R0027": (26.9124, 75.7873),  # Jaipur
    "R0028": (18.3200, 83.9000),  # Kusalapuram, Srikakulam
    "R0029": (28.4089, 77.3178),  # Faridabad
}

COLUMNS = {
    "Recycler_ID": "id", "Recycler_Name": "name", "Facility_Type": "facility_type", "State": "state",
    "City": "city", "Regional_Office": "regional_office", "Pincode": "pincode", "Address": "address",
    "Phone": "phone", "Email": "email", "Capacity_MT_Per_Year": "capacity_mt_per_year",
    "Accepted_Items": "accepted_items", "Latitude": "latitude", "Longitude": "longitude",
    "Authorization_Status": "authorization_status", "Authorization_Number": "authorization_number",
    "Authorization_Date": "authorization_date", "Authorization_Valid_Until": "authorization_valid_until",
    "Consent_Number": "consent_number", "Consent_Date": "consent_date", "Source": "source",
    "Source_URL": "source_url", "Last_Verification": "last_verification", "Remarks": "remarks",
}
TEXT = {"pincode", "phone", "address", "authorization_number", "consent_number", "name", "facility_type"}


def env():
    vals = {}
    with open(os.path.join(ROOT, ".env.local")) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                vals[k.strip()] = v.strip().strip('"')
    return vals


DATES = {"authorization_date", "authorization_valid_until", "consent_date", "last_verification"}


def parse_date(v):
    """Excel dates arrive as datetimes, but some cells are typed text like 27/10/2021."""
    if isinstance(v, dt.datetime):
        return v.date()
    if isinstance(v, dt.date):
        return v
    text = str(v).strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%Y-%m-%d", "%d/%m/%y"):
        try:
            return dt.datetime.strptime(text, fmt).date()
        except ValueError:
            pass
    return None


def clean(col, v):
    if v is None or (isinstance(v, str) and not v.strip()):
        return None
    if col in DATES:
        return parse_date(v)
    if isinstance(v, dt.datetime):
        return v.date()
    if col in TEXT:
        return str(int(v)) if isinstance(v, float) and v.is_integer() else str(v).strip()
    if isinstance(v, str):
        return v.strip()
    return v


def load_recyclers(path):
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    header = [COLUMNS.get(str(h).strip()) for h in rows[0]]
    out = []
    for r in rows[1:]:
        rec = {col: clean(col, v) for col, v in zip(header, r) if col}
        if not rec.get("id") or not rec.get("name"):
            continue
        approx = rec.get("latitude") is None
        if approx and rec["id"] in APPROX_COORDS:
            rec["latitude"], rec["longitude"] = APPROX_COORDS[rec["id"]]
        rec["location_is_approximate"] = approx
        out.append(rec)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--excel", required=True)
    args = ap.parse_args()

    db_url = env().get("SUPABASE_DB_URL")
    if not db_url:
        raise SystemExit("Set SUPABASE_DB_URL in .env.local first.")

    classes = json.load(open(os.path.join(RUNS, "classes.json")))
    images = json.load(open(os.path.join(RUNS, "images.json")))
    emb = np.load(os.path.join(RUNS, "embeddings.npy"))
    recyclers = load_recyclers(args.excel)

    with psycopg.connect(db_url, autocommit=False) as conn, conn.cursor() as cur:
        cur.execute(open(os.path.join(ROOT, "supabase", "schema.sql")).read())

        cur.executemany(
            """insert into device_models (id, category, brand_id, brand, model, folder)
               values (%(id)s, %(category)s, %(brand_id)s, %(brand)s, %(model)s, %(folder)s)
               on conflict (id) do update set category = excluded.category, brand_id = excluded.brand_id,
                 brand = excluded.brand, model = excluded.model, folder = excluded.folder""",
            classes,
        )
        cur.execute("delete from device_models where id >= %s", (len(classes),))

        cur.execute("truncate device_embeddings restart identity")
        with cur.copy("copy device_embeddings (model_id, image_path, embedding) from stdin") as copy:
            for meta, vec in zip(images, emb):
                copy.write_row((meta["class_id"], meta["path"], "[" + ",".join(f"{x:.6f}" for x in vec) + "]"))

        cols = list(COLUMNS.values()) + ["location_is_approximate"]
        cur.executemany(
            f"""insert into recyclers ({", ".join(cols)}) values ({", ".join("%(" + c + ")s" for c in cols)})
                on conflict (id) do update set {", ".join(f"{c} = excluded.{c}" for c in cols if c != "id")}""",
            [{c: r.get(c) for c in cols} for r in recyclers],
        )
        conn.commit()

        cur.execute("select count(*) from device_models")
        n_models = cur.fetchone()[0]
        cur.execute("select count(*) from device_embeddings")
        n_emb = cur.fetchone()[0]
        cur.execute("select count(*), count(*) filter (where id in (select id from eligible_recyclers)) from recyclers")
        n_rec, n_ok = cur.fetchone()
    print(f"device_models {n_models}, device_embeddings {n_emb}, recyclers {n_rec} ({n_ok} eligible for matching)")


if __name__ == "__main__":
    main()
