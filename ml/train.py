"""Train the device-model recogniser and export it for the browser.

    python ml/train.py --data "/path/to/dataset" [--epochs 18]

Outputs (ml/runs/):
  embed.onnx        image -> 256-d L2-normalised embedding (used in the browser)
  classes.json      class id -> category / brand / model
  embeddings.npy    one embedding per dataset image (seeded into Supabase)
  images.json       class id + relative path for each row of embeddings.npy
  report.json       validation accuracy on photo groups the model never saw

The dataset holds many augmented copies (flips, crops, rotations) of the same
photo. To measure accuracy honestly we first group near-duplicates with an
ImageNet backbone and keep each group entirely in train or in validation.
"""
import argparse
import json
import os
import random
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import models
from torchvision import transforms as T

from catalog import build

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "runs")
MEAN, STD = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]
EMB_DIM = 256


class EmbedNet(nn.Module):
    """MobileNetV3-Large backbone -> 256-d normalised embedding."""

    def __init__(self):
        super().__init__()
        base = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
        self.features = base.features
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.proj = nn.Sequential(nn.Linear(960, 512), nn.Hardswish(), nn.Dropout(0.2), nn.Linear(512, EMB_DIM))

    def forward(self, x):
        x = self.pool(self.features(x)).flatten(1)
        return F.normalize(self.proj(x), dim=1)


class CosFace(nn.Module):
    """Cosine classifier with an additive margin: pulls each class into a tight cluster."""

    def __init__(self, n, s=24.0, m=0.25):
        super().__init__()
        self.w = nn.Parameter(torch.randn(n, EMB_DIM) * 0.01)
        self.s, self.m = s, m

    def forward(self, emb, y=None):
        cos = emb @ F.normalize(self.w, dim=1).t()
        if y is not None:
            cos = cos - self.m * F.one_hot(y, cos.shape[1])
        return self.s * cos


class Images(torch.utils.data.Dataset):
    def __init__(self, items, tf):
        self.items, self.tf = items, tf

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        path, y = self.items[i]
        return self.tf(Image.open(path).convert("RGB")), y


def near_duplicate_groups(items, device):
    """Connected components of images whose ImageNet features are near-identical (per class)."""
    base = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
    net = nn.Sequential(base.features, nn.AdaptiveAvgPool2d(1), nn.Flatten()).to(device).eval()
    tf = T.Compose([T.Resize(224), T.CenterCrop(224), T.ToTensor(), T.Normalize(MEAN, STD)])
    feats = []
    loader = torch.utils.data.DataLoader(Images(items, tf), batch_size=64)
    with torch.no_grad():
        for x, _ in loader:
            f = net(x.to(device))
            # flips/rotations are the common augmentations: average with the mirror so they collapse together
            f = f + net(torch.flip(x, dims=[3]).to(device))
            feats.append(F.normalize(f, dim=1).cpu())
    feats = torch.cat(feats)
    labels = np.array([y for _, y in items])
    group = -np.ones(len(items), dtype=int)
    next_id = 0
    for c in np.unique(labels):
        idx = np.where(labels == c)[0]
        sim = (feats[idx] @ feats[idx].t()).numpy()
        parent = list(range(len(idx)))

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a

        for a in range(len(idx)):
            for b in range(a + 1, len(idx)):
                if sim[a, b] > 0.9:
                    parent[find(a)] = find(b)
        roots = {}
        for a in range(len(idx)):
            r = find(a)
            if r not in roots:
                roots[r] = next_id
                next_id += 1
            group[idx[a]] = roots[r]
    return group


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--epochs", type=int, default=18)
    ap.add_argument("--val", type=float, default=0.2)
    ap.add_argument("--final", action="store_true", help="train on everything (after checking --val accuracy)")
    args = ap.parse_args()

    random.seed(0)
    np.random.seed(0)
    torch.manual_seed(0)
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    os.makedirs(OUT, exist_ok=True)

    classes = build(args.data)
    items = []
    for c in classes:
        folder = os.path.join(args.data, c["folder"])
        for f in sorted(os.listdir(folder)):
            if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                items.append((os.path.join(folder, f), c["id"]))
    print(f"{len(classes)} classes, {len(items)} images, device={device}")

    # ---- group-aware split ----
    if args.final:
        train_items, val_items = items, []
    else:
        t = time.time()
        group = near_duplicate_groups(items, device)
        print(f"{group.max() + 1} photo groups (near-duplicates merged) in {time.time() - t:.0f}s")
        val_mask = np.zeros(len(items), bool)
        labels = np.array([y for _, y in items])
        for c in range(len(classes)):
            gs = sorted(set(group[labels == c]))
            random.shuffle(gs)
            k = max(1, round(len(gs) * args.val)) if len(gs) > 1 else 0
            val_mask |= np.isin(group, gs[:k]) & (labels == c)
        train_items = [it for it, v in zip(items, val_mask) if not v]
        val_items = [it for it, v in zip(items, val_mask) if v]
    print(f"train {len(train_items)} / val {len(val_items)}")

    train_tf = T.Compose([
        T.RandomResizedCrop(224, scale=(0.5, 1.0), ratio=(0.7, 1.4)),
        T.RandomHorizontalFlip(),
        T.RandomRotation(15),
        T.ColorJitter(0.35, 0.35, 0.3, 0.04),
        T.RandomGrayscale(0.05),
        T.ToTensor(),
        T.Normalize(MEAN, STD),
        T.RandomErasing(p=0.2, scale=(0.02, 0.12)),
    ])
    eval_tf = T.Compose([T.Resize(224), T.CenterCrop(224), T.ToTensor(), T.Normalize(MEAN, STD)])

    train_dl = torch.utils.data.DataLoader(Images(train_items, train_tf), batch_size=32, shuffle=True, num_workers=0, drop_last=True)

    net, head = EmbedNet().to(device), CosFace(len(classes)).to(device)
    opt = torch.optim.AdamW([
        {"params": net.features.parameters(), "lr": 4e-4},
        {"params": list(net.proj.parameters()) + list(head.parameters()), "lr": 2e-3},
    ], weight_decay=1e-4)
    steps = args.epochs * len(train_dl)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=[4e-4, 2e-3], total_steps=steps, pct_start=0.15)
    crit = nn.CrossEntropyLoss(label_smoothing=0.1)

    def embed(items_):
        net.eval()
        out = []
        dl = torch.utils.data.DataLoader(Images(items_, eval_tf), batch_size=64)
        with torch.no_grad():
            for x, _ in dl:
                out.append(net(x.to(device)).cpu())
        return torch.cat(out) if out else torch.zeros(0, EMB_DIM)

    def evaluate():
        if not val_items:
            return {}
        tr, va = embed(train_items), embed(val_items)
        ytr = torch.tensor([y for _, y in train_items])
        yva = torch.tensor([y for _, y in val_items])
        # the same vote the database runs: top-k neighbours, similarity-weighted
        sim = va @ tr.t()
        top = sim.topk(7, dim=1)
        votes = torch.zeros(len(va), len(classes))
        votes.scatter_add_(1, ytr[top.indices], top.values.clamp(min=0) ** 4)
        knn = (votes.argmax(1) == yva).float().mean().item()
        with torch.no_grad():
            head_acc = (head(va.to(device)).argmax(1).cpu() == yva).float().mean().item()
        brand = lambda i: classes[i]["brand_id"]
        brand_acc = np.mean([brand(p) == brand(t) for p, t in zip(votes.argmax(1).tolist(), yva.tolist())])
        return {"knn_top1": round(knn, 4), "head_top1": round(head_acc, 4), "brand_top1": round(float(brand_acc), 4)}

    best, best_state = -1, None
    for ep in range(args.epochs):
        net.train()
        head.train()
        t, tot, n = time.time(), 0.0, 0
        for x, y in train_dl:
            x, y = x.to(device), y.to(device)
            loss = crit(head(net(x), y), y)
            opt.zero_grad()
            loss.backward()
            opt.step()
            sched.step()
            tot += loss.item() * len(y)
            n += len(y)
        m = evaluate()
        print(f"epoch {ep + 1:2d}/{args.epochs}  loss {tot / n:.3f}  {m}  {time.time() - t:.0f}s", flush=True)
        score = m.get("knn_top1", ep)
        if score >= best:
            best, best_state = score, {k: v.detach().cpu().clone() for k, v in net.state_dict().items()}

    net.load_state_dict(best_state)
    report = {"classes": len(classes), "images": len(items), "train": len(train_items), "val": len(val_items), **evaluate()}
    if args.final:
        report["note"] = "final model trained on all images"
    print("REPORT", report)

    # ---- export ----
    net.eval().cpu()
    dummy = torch.randn(1, 3, 224, 224)
    onnx_path = os.path.join(OUT, "embed.onnx")
    torch.onnx.export(net, dummy, onnx_path, input_names=["image"], output_names=["embedding"],
                      dynamic_axes={"image": {0: "batch"}, "embedding": {0: "batch"}}, opset_version=17, dynamo=False)

    import onnxruntime as ort
    sess = ort.InferenceSession(onnx_path)
    diff = np.abs(sess.run(None, {"image": dummy.numpy()})[0] - net(dummy).detach().numpy()).max()
    print(f"onnx export ok, max diff {diff:.2e}, {os.path.getsize(onnx_path) / 1e6:.1f} MB")

    # ---- embed every dataset image for the database ----
    net.to(device)
    all_emb = embed(items).numpy().astype(np.float32)
    np.save(os.path.join(OUT, "embeddings.npy"), all_emb)
    with open(os.path.join(OUT, "images.json"), "w") as f:
        json.dump([{"class_id": y, "path": os.path.relpath(p, args.data)} for p, y in items], f)
    with open(os.path.join(OUT, "classes.json"), "w") as f:
        json.dump(classes, f, indent=1)
    with open(os.path.join(OUT, "report.json"), "w") as f:
        json.dump(report, f, indent=1)


if __name__ == "__main__":
    main()
