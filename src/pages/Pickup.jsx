import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_ORIGIN, byDistanceFrom, RECYCLERS } from '../data/recyclers.js'
import { Icons } from '../components/Doodles.jsx'

const ITEM_H = 76 // px, keep in sync with .reel__item height
const SPIN_MS = 2800
const LOCATE_TIMEOUT_MS = 8000

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

const initials = (name) => name.split(' ').slice(0, 2).map((w) => w[0]).join('')
const km = (n) => (n < 10 ? n.toFixed(1) : Math.round(n)) + ' km'

/* The slot-machine reel: spins through shuffled recyclers and lands on `target`. */
function Reel({ target, onDone }) {
  const [go, setGo] = useState(false)
  const done = useRef(false)

  // Several shuffled passes, then the winner, then one more card below it.
  const items = useMemo(() => {
    const others = RECYCLERS.filter((r) => r.id !== target.id)
    const seq = [...shuffle(RECYCLERS), ...shuffle(RECYCLERS), ...shuffle(RECYCLERS), ...shuffle(others)]
    return [...seq, target, shuffle(others)[0]]
  }, [target])
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
        {items.map((r, i) => (
          <div key={i} className="reel__item">
            <span className="reel__avatar">{initials(r.name)}</span>
            <span>
              <strong>{r.name}</strong>
              <em>{r.area}</em>
            </span>
          </div>
        ))}
      </div>
      <span className="reel__window" />
    </div>
  )
}

export default function Pickup({ summary, payout, onPhase, onBack }) {
  const [phase, setPhase] = useState('locating')
  const [origin, setOrigin] = useState(null) // { lat, lon, approx, label }
  const [rank, setRank] = useState(0) // 0 = nearest; "Shuffle again" moves down the list
  const [spinKey, setSpinKey] = useState(0)

  const ranked = useMemo(() => (origin ? byDistanceFrom(origin) : []), [origin])
  const match = ranked[rank % Math.max(1, ranked.length)]

  useEffect(() => onPhase(phase, match), [phase, match])

  // 1. Where is the visitor? Fall back to central Mumbai.
  useEffect(() => {
    let settled = false
    const settle = (o) => {
      if (settled) return
      settled = true
      setOrigin(o)
      setPhase('spinning')
    }
    const fallback = () => settle({ ...DEFAULT_ORIGIN, approx: true })
    const timer = setTimeout(fallback, LOCATE_TIMEOUT_MS)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => settle({ lat: p.coords.latitude, lon: p.coords.longitude, approx: false, label: 'you' }),
        fallback,
        { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS - 500, maximumAge: 600000 },
      )
    } else fallback()
    return () => {
      settled = true
      clearTimeout(timer)
    }
  }, [])

  const shuffleAgain = () => {
    setRank((r) => r + 1)
    setSpinKey((k) => k + 1)
    setPhase('spinning')
  }

  return (
    <div className="pickup">
      {phase === 'locating' && (
        <div className="pickup__locating">
          <span className="radar" aria-hidden="true"><i /><i /><i /><Icons.pin /></span>
          <h3>Finding recyclers near you</h3>
          <p>Allow location access for the closest match, or skip to use central Mumbai.</p>
          <button type="button" className="pickup__skip" onClick={() => { setOrigin({ ...DEFAULT_ORIGIN, approx: true }); setPhase('spinning') }}>
            Skip, use Mumbai
          </button>
        </div>
      )}

      {phase === 'spinning' && match && (
        <div className="pickup__spinning">
          <p className="pickup__eyebrow">Shuffling {RECYCLERS.length} authorised recyclers…</p>
          <Reel key={spinKey} target={match} onDone={() => setPhase('matched')} />
        </div>
      )}

      {phase === 'matched' && match && (
        <div className="pickup__matched">
          <p className="pickup__eyebrow">{rank === 0 ? 'Your nearest recycler' : 'Another recycler near you'}</p>
          <div className="match">
            <span className="burst" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
            </span>
            <span className="match__avatar">{initials(match.name)}</span>
            <h3>{match.name}</h3>
            <p className="match__area"><Icons.pin width="16" height="16" /> {match.area}</p>
            <div className="match__chips">
              <span><Icons.pin width="14" height="14" /> {km(match.km)} {origin?.approx ? `from ${origin.label}` : 'away'}</span>
              <span>★ {match.rating.toFixed(1)}</span>
              <span className="is-green"><Icons.shield width="14" height="14" /> CPCB authorised</span>
            </div>
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
