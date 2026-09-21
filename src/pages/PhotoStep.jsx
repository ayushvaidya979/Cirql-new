import { useEffect, useRef, useState } from 'react'
import { identifyDevice, preloadDetector } from '../lib/identify.js'
import { Icons } from '../components/Doodles.jsx'
import CameraScan from '../components/CameraScan.jsx'

/*
 * Photo step: the visitor scans (camera) or uploads a photo, the AI identifies
 * the exact model and we check it against what they picked.
 *   chosen   { category, brand_id, brandName, categoryName }
 *   scanned  a match already found (e.g. from "Scan device" on the home page)
 *   onDone(match | null, { switchTo })  continue to the price
 */
export default function PhotoStep({ chosen, scanned, onDone }) {
  const [state, setState] = useState(scanned ? 'result' : 'idle') // idle | scanning | result | error
  const [match, setMatch] = useState(scanned ?? null)
  const [sure, setSure] = useState(true)
  const [preview, setPreview] = useState(null)
  const [camera, setCamera] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    preloadDetector()
  }, [])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const upload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setState('error')
    setPreview(URL.createObjectURL(file))
    setState('scanning')
    const started = performance.now()
    try {
      const r = await identifyDevice(file)
      await new Promise((ok) => setTimeout(ok, Math.max(0, 1400 - (performance.now() - started))))
      setMatch(r.match)
      setSure(r.sure)
      setState('result')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  const fromCamera = (m) => {
    setCamera(false)
    setPreview(null)
    setMatch(m)
    setSure(true)
    setState('result')
  }

  const reset = () => {
    setState('idle')
    setMatch(null)
    setPreview(null)
  }

  const same = match && match.category === chosen.category && match.brand_id === chosen.brand_id

  return (
    <div className="photo">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = '' }} />
      <CameraScan open={camera} onClose={() => setCamera(false)} onResult={fromCamera} actionLabel="Use this result" />

      {state === 'idle' && (
        <>
          <div className="photo__options">
            <button type="button" className="photo__opt photo__opt--main" onClick={() => setCamera(true)} style={{ '--i': 0 }}>
              <span className="photo__icon"><Icons.scan width="30" height="30" /></span>
              <strong>Scan with camera</strong>
              <em>Point your camera at the device</em>
            </button>
            <button type="button" className="photo__opt" onClick={() => fileRef.current?.click()} style={{ '--i': 1 }}>
              <span className="photo__icon photo__icon--soft"><Icons.layers width="28" height="28" /></span>
              <strong>Upload a photo</strong>
              <em>Choose one from your gallery</em>
            </button>
          </div>
          <button type="button" className="photo__skip" onClick={() => onDone(null)}>
            Skip, I’ll show it at pickup
          </button>
        </>
      )}

      {state === 'scanning' && (
        <div className="scan__card">
          <div className="scan__photo">
            {preview && <img src={preview} alt="Your device" />}
            <span className="scan__beam" />
            <span className="scan__grid" />
          </div>
          <div className="scan__info">
            <p className="scan__eyebrow">Analysing your photo</p>
            <h3>Identifying model…</h3>
            <span className="scan__dots"><i /><i /><i /></span>
          </div>
        </div>
      )}

      {state === 'result' && match && (
        <div className={`photo__result ${same && sure ? 'is-ok' : 'is-warn'}`}>
          <span className="photo__badge">{same && sure ? <Icons.check width="26" height="26" /> : '!'}</span>
          <p className="scan__eyebrow">{same && sure ? 'Device verified' : sure ? 'Looks like a different device' : 'Not fully sure'}</p>
          <h3>{match.model}</h3>
          <p className="scan__meta">
            {match.brand} · {match.category === 'phone' ? 'Smartphone' : 'Laptop'} · {Math.round(match.confidence * 100)}% match
          </p>

          {same && sure && (
            <div className="scan__actions">
              <button type="button" className="btn btn--primary" onClick={() => onDone(match)}>See my price</button>
              <button type="button" className="btn btn--ghost" onClick={reset}>Scan again</button>
            </div>
          )}

          {!same && sure && (
            <>
              <p className="scan__note">
                You chose a {chosen.brandName} {chosen.categoryName.toLowerCase()}, but the photo looks like a {match.model}.
              </p>
              <div className="scan__actions">
                <button type="button" className="btn btn--primary" onClick={() => onDone(match, { switchTo: true })}>
                  Use {match.model}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => onDone(null)}>Keep my choice</button>
              </div>
            </>
          )}

          {!sure && (
            <>
              <p className="scan__note">Try a clearer photo in good light, or continue with your choices.</p>
              <div className="scan__actions">
                <button type="button" className="btn btn--primary" onClick={reset}>Scan again</button>
                <button type="button" className="btn btn--ghost" onClick={() => onDone(null)}>Continue anyway</button>
              </div>
            </>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="photo__result is-warn">
          <span className="photo__badge">!</span>
          <h3>Couldn’t read that photo</h3>
          <p className="scan__note">Try a clear JPG or PNG photo of the device.</p>
          <div className="scan__actions">
            <button type="button" className="btn btn--primary" onClick={reset}>Try again</button>
            <button type="button" className="btn btn--ghost" onClick={() => onDone(null)}>Skip</button>
          </div>
        </div>
      )}
    </div>
  )
}
