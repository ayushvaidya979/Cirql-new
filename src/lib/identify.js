/*
 * Device recognition.
 *  1. In the browser, a small ONNX model (trained on our dataset, ml/train.py)
 *     turns the photo into a 256-number fingerprint. The photo never leaves
 *     the device.
 *  2. Supabase's identify_device() compares that fingerprint with every
 *     dataset photo (pgvector) and votes on the exact model.
 * The runtime and model load lazily, the first time someone scans.
 */
import { hasSupabase, rpc } from './supabase.js'

const MODEL_URL = '/models/device-embed.onnx'
const SIZE = 224
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]

// Below these the photo is probably not one of our devices (tuned on held-out photos).
export const MIN_SIMILARITY = 0.55
export const MIN_CONFIDENCE = 0.5

let loading = null

function loadModel() {
  if (!loading) {
    loading = (async () => {
      // Vite bundles the WASM runtime as a hashed asset next to this chunk.
      const ort = await import('onnxruntime-web/wasm')
      ort.env.wasm.numThreads = 1 // multi-threading needs cross-origin isolation
      const session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
      return { ort, session }
    })().catch((err) => {
      loading = null
      throw err
    })
  }
  return loading
}

/** Start downloading the runtime + model early (e.g. when the upload box is shown). */
export const preloadDetector = () => loadModel().catch(() => {})

/** Resize the short side to 224 and centre-crop, exactly like training (Resize + CenterCrop). */
async function toPixels(file) {
  const full = await createImageBitmap(file)
  const scale = SIZE / Math.min(full.width, full.height)
  const w = Math.max(SIZE, Math.round(full.width * scale))
  const h = Math.max(SIZE, Math.round(full.height * scale))
  const small = await createImageBitmap(full, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' })
  full.close()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(small, -Math.round((w - SIZE) / 2), -Math.round((h - SIZE) / 2))
  small.close()
  return ctx.getImageData(0, 0, SIZE, SIZE).data
}

export async function embedPhoto(file) {
  const [{ ort, session }, rgba] = await Promise.all([loadModel(), toPixels(file)])
  const plane = SIZE * SIZE
  const chw = new Float32Array(3 * plane)
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) chw[c * plane + i] = (rgba[i * 4 + c] / 255 - MEAN[c]) / STD[c]
  }
  const out = await session.run({ image: new ort.Tensor('float32', chw, [1, 3, SIZE, SIZE]) })
  return out.embedding.data
}

/* Offline fallback (no Supabase configured): nearest class prototype. */
let protos = null
async function identifyOffline(emb) {
  protos ??= await fetch('/models/prototypes.json').then((r) => r.json())
  const scores = protos.classes.map((c, i) => {
    const p = protos.vectors[i]
    let s = 0
    for (let k = 0; k < p.length; k++) s += p[k] * emb[k]
    return { c, s }
  })
  scores.sort((a, b) => b.s - a.s)
  const [best, second] = scores
  return {
    match: { ...best.c, confidence: Math.min(1, Math.max(0, (best.s - second.s) * 4 + 0.5)), similarity: best.s },
    alternatives: scores
      .slice(1)
      .filter(({ c, s }) => c.category === best.c.category && s > 0.4)
      .slice(0, 2)
      .map(({ c, s }) => ({ model: c.model, confidence: s })),
    offline: true,
  }
}

/**
 * Identify the device in a photo.
 * Returns { match: { category, brand_id, brand, model, base_price, confidence, similarity }, alternatives, sure }
 */
export async function identifyDevice(file) {
  const emb = await embedPhoto(file)
  const result = hasSupabase
    ? await rpc('identify_device', { query: `[${Array.from(emb, (v) => v.toFixed(6)).join(',')}]`, k: 7 })
    : await identifyOffline(emb)
  const m = result.match
  result.sure = Boolean(m && m.similarity >= MIN_SIMILARITY && m.confidence >= MIN_CONFIDENCE)
  return result
}
