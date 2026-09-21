"""Copy the trained model into the website.

    python ml/export_web.py

Writes public/models/device-embed.onnx and public/models/prototypes.json
(one averaged embedding per model: the offline fallback when Supabase is
not configured).
"""
import json
import os
import shutil

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
RUNS = os.path.join(HERE, "runs")
DEST = os.path.join(os.path.dirname(HERE), "public", "models")


def main():
    os.makedirs(DEST, exist_ok=True)
    shutil.copyfile(os.path.join(RUNS, "embed.onnx"), os.path.join(DEST, "device-embed.onnx"))

    classes = json.load(open(os.path.join(RUNS, "classes.json")))
    images = json.load(open(os.path.join(RUNS, "images.json")))
    emb = np.load(os.path.join(RUNS, "embeddings.npy"))
    labels = np.array([m["class_id"] for m in images])
    vectors = []
    for c in classes:
        v = emb[labels == c["id"]].mean(0)
        vectors.append([round(float(x), 5) for x in v / np.linalg.norm(v)])
    keep = ("id", "category", "brand_id", "brand", "model")
    with open(os.path.join(DEST, "prototypes.json"), "w") as f:
        json.dump({"classes": [{k: c[k] for k in keep} | {"base_price": None} for c in classes], "vectors": vectors}, f)

    for f in ("device-embed.onnx", "prototypes.json"):
        print(f, f"{os.path.getsize(os.path.join(DEST, f)) / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
