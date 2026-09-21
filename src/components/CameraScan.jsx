import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { identifyDevice, preloadDetector } from '../lib/identify.js'
import { Icons } from './Doodles.jsx'
import './CameraScan.css'

/*
 * Live camera scanner. Opens the rear camera (or webcam), the visitor captures
 * a frame and the AI identifies the exact model. If the camera is blocked or
 * missing, the visitor can upload a photo instead.
 *
 *   <CameraScan open onClose={...} onResult={(match) => ...} actionLabel="Use this device" />
 */
export default function CameraScan({ open, onClose, onResult, actionLabel = 'Use this device' }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef = useRef(null)
  const [state, setState] = useState('starting') // starting | live | nocamera | scanning | found | unsure | error
  const [shot, setShot] = useState(null)
  const [result, setResult] = useState(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startCamera = async () => {
    setShot(null)
    setResult(null)
    setState('starting')
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('nocamera')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      const v = videoRef.current
      if (v) {
        v.srcObject = stream
        await v.play().catch(() => {})
      }
      setState('live')
    } catch (err) {
      console.warn('camera unavailable', err)
      setState('nocamera')
    }
  }

  useEffect(() => {
    if (!open) return
    preloadDetector()
    startCamera()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      stopCamera()
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => () => shot && URL.revokeObjectURL(shot), [shot])

  const identify = async (blob) => {
    setShot(URL.createObjectURL(blob))
    setState('scanning')
    const started = performance.now()
    try {
      const r = await identifyDevice(blob)
      await new Promise((ok) => setTimeout(ok, Math.max(0, 1500 - (performance.now() - started))))
      setResult(r)
      setState(r.sure ? 'found' : 'unsure')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  const capture = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d').drawImage(v, 0, 0)
    stopCamera()
    canvas.toBlob((blob) => blob && identify(blob), 'image/jpeg', 0.92)
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) return setState('error')
    stopCamera()
    identify(f)
  }

  if (!open) return null
  const m = result?.match
  const live = state === 'live' || state === 'starting'

  return createPortal(
    <div className="cam" role="dialog" aria-modal="true" aria-label="Scan your device">
      <div className="cam__panel">
        <button type="button" className="cam__close" aria-label="Close" onClick={onClose}>×</button>
        <p className="cam__eyebrow">AI device scan</p>
        <h3 className="cam__title">
          {live && 'Point at your phone or laptop'}
          {state === 'nocamera' && 'Camera not available'}
          {state === 'scanning' && 'Identifying model…'}
          {(state === 'found' || state === 'unsure') && (state === 'found' ? 'We found your device' : 'Best guess')}
          {state === 'error' && 'Couldn’t read that photo'}
        </h3>

        <div className={`cam__view ${state === 'scanning' ? 'is-scanning' : ''}`}>
          <video ref={videoRef} playsInline muted className={live ? '' : 'is-hidden'} />
          {shot && !live && <img src={shot} alt="Captured device" />}
          {state === 'nocamera' && (
            <div className="cam__empty">
              <Icons.scan width="40" height="40" />
              <p>Allow camera access in your browser, or upload a photo instead.</p>
            </div>
          )}
          {(live || state === 'scanning') && (
            <>
              <span className="cam__corner cam__corner--tl" /><span className="cam__corner cam__corner--tr" />
              <span className="cam__corner cam__corner--bl" /><span className="cam__corner cam__corner--br" />
              <span className="cam__beam" />
            </>
          )}
        </div>

        {(state === 'found' || state === 'unsure') && m && (
          <div className="cam__result">
            <strong>{m.model}</strong>
            <span>{m.brand} · {m.category === 'phone' ? 'Smartphone' : 'Laptop'} · {Math.round(m.confidence * 100)}% match</span>
            {state === 'unsure' && <em>Not fully sure. Retake in good light, or continue if this is right.</em>}
          </div>
        )}

        <div className="cam__actions">
          {state === 'live' && (
            <button type="button" className="cam__shutter" aria-label="Capture photo" onClick={capture}><span /></button>
          )}
          {(state === 'found' || state === 'unsure') && m && (
            <button type="button" className="btn btn--primary" onClick={() => onResult(m)}>
              <Icons.check width="18" height="18" /> {actionLabel}
            </button>
          )}
          {['found', 'unsure', 'error'].includes(state) && (
            <button type="button" className="btn btn--ghost" onClick={startCamera}>Retake</button>
          )}
          {state !== 'scanning' && (
            <button type="button" className="cam__upload" onClick={() => fileRef.current?.click()}>
              Upload a photo instead
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
