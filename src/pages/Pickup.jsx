import { useEffect, useMemo, useRef, useState } from 'react'
import { rpc } from '../lib/supabase.js'

/*
 * Pickup matching. Recycler data lives in Supabase and is private: the
 * database functions below return recycler NAMES only, never contact details.
 *   recycler_names(n)                -> names for the shuffle reel
 *   nearest_recycler(lat, lon, skip) -> name of the nearest eligible recycler
 */
const ITEM_H = 76 // px, keep in sync with .reel__item height
const SPIN_MS = 2800
const LOCATE_TIMEOUT_MS = 8000
const MUMBAI = { lat: 19.076, lon: 72.8777 } // used when location isn't shared

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function tomorrowSlot() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}, 10 AM – 1 PM`
}

const initials = (name) =>
  name.replace(/^M\/s\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

/* The slot-machine reel: spins through shuffled names and lands on `target`. */
function Reel({ names, target, onDone }) {
  const [go, setGo] = useState(false)
  const done = useRef(false)

  const items = useMemo(() => {
    const others = names.filter((n) => n !== target)
    const pool = others.length ? others : [target]
    const seq = []
    while (seq.length < 36) seq.push(...shuffle(pool))
    return [...seq.slice(0, 36), target, shuffle(pool)[0]]
  }, [names, target])
  const landAt = items.length - 2

  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 40)
    const safety = setTimeout(finish, SPIN_MS + 400) // e.g. background tab
    return () => {
      clearTimeout(t)
      clearTimeout(safety)
    }
  }, [])

  return (
    <div className="reel" aria-hidden="true">
      <div
        className={`reel__list ${go ? 'is-going' : ''}`}
        style={{ transform: `translate3d(0, ${go ? -(landAt - 1) * ITEM_H : 0}px, 0)`, '--spin': `${SPIN_MS}ms` }}
        onTransitionEnd={finish}
      >
        {items.map((name, i) => (
          <div key={i} className="reel__item">
            <span className="reel__avatar">{initials(name)}</span>
            <strong>{name}</strong>
          </div>
        ))}
      </div>
      <span className="reel__window" />
    </div>
  )
}

export default function Pickup({ summary, payout, onPhase, onBack }) {
  const [phase, setPhase] = useState('locating') // locating | spinning | matched | error
  const [origin, setOrigin] = useState(null)
  const [names, setNames] = useState([])
  const [match, setMatch] = useState(null)
  const [skip, setSkip] = useState(0)
  const [spinKey, setSpinKey] = useState(0)

  useEffect(() => onPhase(phase === 'error' ? 'locating' : phase, match ? { name: match } : null), [phase, match])

  // 1. Where is the visitor? Fall back to central Mumbai.
  useEffect(() => {
    let settled = false
    const settle = (o) => {
      if (!settled) {
        settled = true
        setOrigin(o)
      }
    }
    const timer = setTimeout(() => settle(MUMBAI), LOCATE_TIMEOUT_MS)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => settle({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => settle(MUMBAI),
        { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS - 500, maximumAge: 600000 },
      )
    } else settle(MUMBAI)
    return () => {
      settled = true
      clearTimeout(timer)
    }
  }, [])

  // 2. Ask the backend for the shuffle names and the nearest recycler's name.
  useEffect(() => {
    if (!origin) return
    let live = true
    Promise.all([
      names.length ? names : rpc('recycler_names', { n: 40 }),
      rpc('nearest_recycler', { lat: origin.lat, lon: origin.lon, skip }),
    ])
      .then(([list, nearest]) => {
        if (!live) return
        if (!nearest) throw new Error('No recycler available')
        setNames(list)
        setMatch(nearest)
        setSpinKey((k) => k + 1)
        setPhase('spinning')
      })
      .catch((err) => {
        console.error(err)
        if (live) setPhase('error')
      })
    return () => {
      live = false
    }
  }, [origin, skip])

  const shuffleAgain = () => {
    setMatch(null)
    setPhase('locating')
    setSkip((s) => s + 1)
  }

  return (
    <div className="pickup">
      {phase === 'locating' && (
        <div className="pickup__locating">
          <span className="radar" aria-hidden="true"><i /><i /><i /><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></svg></span>
          <h3>Finding recyclers near you</h3>
          <p>Allow location access for the closest match, or skip to use central Mumbai.</p>
          <button type="button" className="pickup__skip" onClick={() => setOrigin((o) => o ?? MUMBAI)}>
            Skip, use Mumbai
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="pickup__locating">
          <h3>Couldn’t reach our recyclers</h3>
          <p>Please check your connection and try again.</p>
          <div className="result__actions">
            <button type="button" className="btn btn--primary" onClick={() => { setPhase('locating'); setOrigin((o) => (o ? { ...o } : MUMBAI)) }}>Try again</button>
            <button type="button" className="btn btn--ghost" onClick={onBack}>Back to price</button>
          </div>
        </div>
      )}

      {phase === 'spinning' && match && (
        <div className="pickup__spinning">
          <p className="pickup__eyebrow">Shuffling authorised recyclers…</p>
          <Reel key={spinKey} names={names} target={match} onDone={() => setPhase('matched')} />
        </div>
      )}

      {phase === 'matched' && match && (
        <div className="pickup__matched">
          <p className="pickup__eyebrow">{skip === 0 ? 'Your nearest recycler' : 'Another recycler near you'}</p>
          <div className="match">
            <span className="burst" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
            </span>
            <span className="match__avatar">{initials(match)}</span>
            <h3>{match}</h3>
            <dl className="match__details">
              <div><dt>Pickup slot</dt><dd>{tomorrowSlot()}</dd></div>
              <div><dt>Device</dt><dd>{summary}</dd></div>
              <div><dt>You receive</dt><dd className="match__pay">{payout}</dd></div>
            </dl>
          </div>
          <div className="result__actions">
            <button type="button" className="btn btn--ghost" onClick={shuffleAgain}>Shuffle again</button>
            <button type="button" className="btn btn--ghost" onClick={onBack}>Back to price</button>
          </div>
        </div>
      )}
    </div>
  )
}
