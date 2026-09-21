# EcoBin backend: device recognition + recyclers

## How it works

1. **Recognition model**: `train.py` fine-tunes MobileNetV3 on the dataset
   (`category/brand/model/*.jpg`) and exports `embed.onnx`, which turns a photo
   into a 256-number fingerprint. The website runs it in the browser (the photo
   never leaves the device).
2. **Supabase**: every dataset photo's fingerprint is stored in
   `device_embeddings` (pgvector). `identify_device()` finds the closest
   dataset photos and votes on the exact model.
3. **Recyclers**: the spreadsheet goes into the private `recyclers` table.
   The website can't read it. It can only call `recycler_names()` and
   `nearest_recycler()`, which return **names only**. Expired authorisations
   are excluded.

## One-time setup

```bash
cd ml
python3 -m venv .venv && . .venv/bin/activate
pip install torch torchvision onnx onnxruntime onnxscript pillow numpy openpyxl "psycopg[binary]"
```

Fill in `.env.local` at the project root (`VITE_SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`).

## Re-train and re-seed

```bash
# honest accuracy check: holds out whole photo groups (augmented copies stay together)
python train.py --data "/path/to/dataset"
# final model, trained on every photo
python train.py --data "/path/to/dataset" --final
# copy the model into the website
python export_web.py
# create tables/functions and load catalogue, fingerprints and recyclers
python seed_supabase.py --excel "/path/to/SIH_2026_EWaste_Recycler_Dataset.xlsx"
```

No database password? That's how it was first seeded (2026-09-22): run `supabase/schema.sql`
in the SQL editor, create a temporary token-guarded `_ecobin_seed()` function, run
`python seed_via_rpc.py --excel ... --token ...`, then `drop function public._ecobin_seed(text, text, jsonb);`.

Adding a new device model: add a folder of photos, add its display name to
`catalog.py`, then run the three commands above.

## Accuracy

`runs/report_validation.json`: on photos from groups the model never saw in
training (76 models): **~44% exact model, ~69% brand**. Photos that are in the
dataset match themselves in the database and are identified exactly. More
distinct photos per model is the single biggest lever for accuracy on new
photos. The dataset has about 10 distinct photos per model; the rest are
augmented copies.
