"""Load catalogue, embeddings and recyclers through the temporary _ecobin_seed()
database function (used when there is no direct database connection).

    python ml/seed_via_rpc.py --excel "/path/Recyclers.xlsx" --token <one-time token>

The function is created just before and dropped right after seeding.
"""
import argparse
import datetime as dt
import json
import os
import urllib.error
import urllib.request

import numpy as np

from seed_supabase import RUNS, env, load_recyclers


def call(url, key, token, kind, payload):
    body = json.dumps({"token": token, "kind": kind, "payload": payload}, default=str).encode()
    req = urllib.request.Request(
        f"{url}/rest/v1/rpc/_ecobin_seed",
        data=body,
        headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            return json.loads(res.read() or "0")
    except urllib.error.HTTPError as err:
        raise SystemExit(f"{kind}: HTTP {err.code} {err.read().decode()[:500]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--excel", required=True)
    ap.add_argument("--token", required=True)
    args = ap.parse_args()
    e = env()
    url, key = e["VITE_SUPABASE_URL"], e["VITE_SUPABASE_ANON_KEY"]

    classes = json.load(open(os.path.join(RUNS, "classes.json")))
    print("models", call(url, key, args.token, "models", classes))

    images = json.load(open(os.path.join(RUNS, "images.json")))
    emb = np.load(os.path.join(RUNS, "embeddings.npy"))
    call(url, key, args.token, "reset_embeddings", [])
    rows = [{"m": m["class_id"], "p": m["path"], "e": "[" + ",".join(f"{x:.6f}" for x in v) + "]"} for m, v in zip(images, emb)]
    done = 0
    for i in range(0, len(rows), 300):
        done += call(url, key, args.token, "embeddings", rows[i:i + 300])
        print(f"embeddings {done}/{len(rows)}", flush=True)

    recs = load_recyclers(args.excel)
    for r in recs:
        for k, v in r.items():
            if isinstance(v, (dt.date, dt.datetime)):
                r[k] = v.isoformat()
    print("recyclers", call(url, key, args.token, "recyclers", recs))


if __name__ == "__main__":
    main()
