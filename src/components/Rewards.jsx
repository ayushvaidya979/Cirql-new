import { useEffect, useRef, useState } from 'react'
import { Section } from './Sections.jsx'
import { DotGrid, Icons, Sparkle } from './Doodles.jsx'
import './Rewards.css'

/*
 * Rewards + referrals. The balance, claimed bonus and redemptions are a
 * per-device demo kept in localStorage; real points will come from completed
 * pickups once accounts exist.
 */
const WELCOME_BONUS = 250
const REFERRAL_POINTS = 100
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`cirql:${key}`)
      return v == null ? fallback : JSON.parse(v)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`cirql:${key}`, JSON.stringify(value))
    } catch {
      /* storage blocked: keep it in memory */
    }
  },
}

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const makeCode = (n = 4) => Array.from({ length: n }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

/* ---------------- animated doodles ---------------- */
export function CoinJar() {
  return (
    <svg className="rw-jar" viewBox="0 0 200 200" aria-hidden="true">
      <ellipse cx="100" cy="186" rx="62" ry="7" fill="#c6ebb2" />
      {[0, 1, 2].map((i) => (
        <g key={i} className="rw-drop" style={{ '--i': i }}>
          <circle cx={84 + i * 16} cy="30" r="11" fill="#f6b92b" />
          <circle cx={84 + i * 16} cy="30" r="6.5" fill="none" stroke="#fff" strokeWidth="2" />
        </g>
      ))}
      <path d="M56 72h88v10c10 6 14 18 14 34v42a24 24 0 0 1-24 24H66a24 24 0 0 1-24-24v-42c0-16 4-28 14-34Z" fill="#e8f7ef" stroke="#1e9e57" strokeWidth="4" />
      <rect x="50" y="62" width="100" height="14" rx="7" fill="#1e9e57" />
      <g className="rw-pile">
        {[[76, 164], [98, 166], [120, 164], [86, 150], [110, 150], [98, 136]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="14" ry="6" fill={i % 2 ? '#e3a21a' : '#f6b92b'} />
        ))}
      </g>
      <path d="M70 100v40" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}

export function GiftDoodle() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <rect x="16" y="36" width="48" height="34" rx="5" fill="#1e9e57" />
      <rect x="36" y="36" width="8" height="34" fill="#f6b92b" />
      <g className="rw-lid">
        <rect x="12" y="26" width="56" height="12" rx="4" fill="#26b565" />
        <rect x="36" y="26" width="8" height="12" fill="#f6b92b" />
        <path d="M40 26c-6-10-18-12-18-4s12 6 18 4Zm0 0c6-10 18-12 18-4s-12 6-18 4Z" fill="#f6b92b" />
      </g>
      <path className="rw-twinkle" d="M64 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#6fcf4e" />
    </svg>
  )
}

export function RechargeDoodle() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <rect x="26" y="14" width="28" height="54" rx="7" fill="#2f3b34" />
      <rect x="29" y="20" width="22" height="40" rx="4" fill="#eef8e8" />
      <path d="m42 28-7 12h6l-3 10 9-13h-6l3-9Z" fill="#f6b92b" />
      {[0, 1, 2].map((i) => (
        <path key={i} className="rw-wave" style={{ '--i': i }} d={`M${60 + i * 5} ${30 - i * 3}a${10 + i * 5} ${10 + i * 5} 0 0 1 0 ${20 + i * 6}`} fill="none" stroke="#1fb3a0" strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

export function TreeDoodle() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <ellipse cx="40" cy="70" rx="22" ry="4" fill="#c6ebb2" />
      <path d="M28 58h24l-3 12H31Z" fill="#e0823d" />
      <g className="rw-sway">
        <path d="M40 58V32" stroke="#147a41" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 40c-14 0-20-10-18-20 12 0 20 8 18 20Z" fill="#6fcf4e" />
        <path d="M40 34c10-2 16-12 14-22-12 2-16 12-14 22Z" fill="#1e9e57" />
      </g>
    </svg>
  )
}

export function VanDoodle() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <g className="rw-road"><path d="M0 66h80" stroke="#c6ebb2" strokeWidth="3" strokeDasharray="10 8" /></g>
      <g className="rw-bounce">
        <path d="M8 30a6 6 0 0 1 6-6h34v32H8Z" fill="#fff" stroke="#1e9e57" strokeWidth="2.5" />
        <path d="M48 34h12l10 12v10H48Z" fill="#1e9e57" />
        <path d="M52 37h7l6 8H52Z" fill="#cfeff0" />
        <path d="M22 34a8 8 0 0 1 13-1M34 46a8 8 0 0 1-13 1" stroke="#1e9e57" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="58" r="6" fill="#2f3b34" /><circle cx="58" cy="58" r="6" fill="#2f3b34" />
      </g>
      <g stroke="#6fcf4e" strokeWidth="2.5" strokeLinecap="round" className="rw-speed"><path d="M2 38h6M0 46h8" /></g>
    </svg>
  )
}

export function ReferralDoodle() {
  const arc = 'M70 150C110 40 290 40 330 150'
  return (
    <svg className="rf-art" viewBox="0 0 400 240" aria-hidden="true">
      <path d="M40 120c10-70 110-100 180-90s150 40 150 110-70 90-170 90S30 190 40 120Z" fill="#e2f4d8" />
      <path d={arc} fill="none" stroke="#5cbf45" strokeWidth="3" strokeDasharray="6 9" strokeLinecap="round" className="rf-dash" />
      {/* you */}
      <g transform="translate(40 128)">
        <rect width="60" height="96" rx="12" fill="#2f3b34" />
        <rect x="5" y="8" width="50" height="80" rx="8" fill="#eef8e8" />
        <circle cx="30" cy="36" r="12" fill="#f0c4a0" /><path d="M18 34c0-10 8-14 14-13 7 1 11 7 10 14-5-4-10-5-14-5-4 0-7 2-10 4Z" fill="#2b2320" />
        <rect x="14" y="56" width="32" height="8" rx="4" fill="#1e9e57" />
        <rect x="18" y="68" width="24" height="5" rx="2.5" fill="#a6dc95" />
      </g>
      {/* friend */}
      <g transform="translate(300 128)">
        <rect width="60" height="96" rx="12" fill="#2f3b34" />
        <rect x="5" y="8" width="50" height="80" rx="8" fill="#eef8e8" />
        <circle cx="30" cy="36" r="12" fill="#d9a27c" /><path d="M17 36c-1-12 8-16 14-15 8 1 12 8 11 15-3-6-8-8-13-8-5 0-9 3-12 8Z" fill="#2b2320" />
        <rect x="14" y="56" width="32" height="8" rx="4" fill="#f6b92b" />
        <rect x="18" y="68" width="24" height="5" rx="2.5" fill="#fbe3a5" />
      </g>
      {/* paper plane flying along the arc, there and back */}
      <g>
        <path d="M0 0 26 10 0 20l6-10Z" fill="#1e9e57" transform="translate(-13 -10)" />
        <path d="M6 0 26 10" stroke="#fff" strokeWidth="1.5" transform="translate(-13 -10)" />
        <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" path={arc} />
      </g>
      {/* hearts & coins popping at each end */}
      <g className="rf-pop rf-pop--a"><path d="M330 108c-6-8-18-2-12 8l12 10 12-10c6-10-6-16-12-8Z" fill="#ef8354" /></g>
      <g className="rf-pop rf-pop--b">
        <circle cx="70" cy="110" r="11" fill="#f6b92b" /><circle cx="70" cy="110" r="6.5" fill="none" stroke="#fff" strokeWidth="2" />
      </g>
      <path className="rw-twinkle" d="M200 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#f6b92b" />
    </svg>
  )
}

const REWARDS = [
  { id: 'voucher', Art: GiftDoodle, title: '₹100 shopping voucher', cost: 500 },
  { id: 'recharge', Art: RechargeDoodle, title: '₹50 mobile recharge', cost: 300 },
  { id: 'tree', Art: TreeDoodle, title: 'Plant a tree in your name', cost: 200 },
  { id: 'priority', Art: VanDoodle, title: 'Priority doorstep pickup', cost: 150 },
]

function useCount(value) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 900)
      setShown(Math.round(a + (value - a) * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    const safety = setTimeout(() => {
      setShown(value)
      from.current = value
    }, 1100)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
    }
  }, [value])
  return shown
}

export default function Rewards() {
  const [points, setPoints] = useState(() => store.get('points', 0))
  const [claimed, setClaimed] = useState(() => store.get('welcomeClaimed', false))
  const [redeemed, setRedeemed] = useState(() => store.get('redeemed', {}))
  const [burst, setBurst] = useState(0)
  const [code] = useState(() => {
    const saved = store.get('refCode', null)
    if (saved) return saved
    const c = `CIRQL-${makeCode()}`
    store.set('refCode', c)
    return c
  })
  const [copied, setCopied] = useState(false)
  const shown = useCount(points)

  const next = REWARDS.filter((r) => !redeemed[r.id]).sort((a, b) => a.cost - b.cost).find((r) => r.cost > points)
  const progress = next ? Math.min(1, points / next.cost) : 1

  const claim = () => {
    if (claimed) return
    const p = points + WELCOME_BONUS
    setPoints(p)
    setClaimed(true)
    setBurst((b) => b + 1)
    store.set('points', p)
    store.set('welcomeClaimed', true)
  }

  const redeem = (r) => {
    if (points < r.cost || redeemed[r.id]) return
    const p = points - r.cost
    const nextRedeemed = { ...redeemed, [r.id]: `${r.id.slice(0, 3).toUpperCase()}-${makeCode(6)}` }
    setPoints(p)
    setRedeemed(nextRedeemed)
    store.set('points', p)
    store.set('redeemed', nextRedeemed)
  }

  const link = `${window.location.origin}/?ref=${code}`
  const message = `I recycle my old gadgets with Cirql and get paid for them. Use my code ${code} and we both get ${REFERRAL_POINTS} EcoPoints: ${link}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard blocked: the code is still visible to copy by hand */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cirql', text: message, url: link })
        return
      } catch {
        /* cancelled */
      }
    }
    copy()
  }

  return (
    <Section className="section section--cream rewards" id="rewards">
      <DotGrid className="deco deco--tr" />
      <Sparkle className="deco rewards__spark" color="#f6b92b" />
      <div className="container">
        <div className="heading heading--center" data-reveal>
          <h2>
            <span className="heading__a">Recycle more,</span> <span className="heading__b">earn more rewards</span>
          </h2>
          <p>Every device you recycle earns EcoPoints. Claim bonuses and redeem them for vouchers, recharges and green gifts.</p>
        </div>

        <div className="rewards__grid">
          {/* wallet */}
          <div className="wallet" data-reveal>
            <CoinJar />
            <p className="wallet__label">Your EcoPoints</p>
            <p className="wallet__points" aria-live="polite">
              {shown.toLocaleString('en-IN')}
              <span key={burst} className={`wallet__burst ${burst ? 'is-on' : ''}`} aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
              </span>
            </p>
            <div className="wallet__progress">
              <span className="wallet__bar"><i style={{ '--w': progress }} /></span>
              <em>{next ? `${(next.cost - points).toLocaleString('en-IN')} points to ${next.title.toLowerCase()}` : 'You can redeem any reward!'}</em>
            </div>
            <button type="button" className="btn btn--primary wallet__claim" onClick={claim} disabled={claimed}>
              {claimed ? <><Icons.check width="18" height="18" /> Welcome bonus claimed</> : <>Claim {WELCOME_BONUS} welcome points</>}
            </button>
            <p className="wallet__note">Earn 100+ points on every completed pickup.</p>
          </div>

          {/* catalogue */}
          <div className="catalog">
            {REWARDS.map((r, i) => {
              const code_ = redeemed[r.id]
              const short = r.cost - points
              return (
                <article key={r.id} className={`reward ${code_ ? 'is-redeemed' : ''}`} data-reveal style={{ '--d': `${i * 90}ms` }}>
                  <span className="reward__art"><r.Art /></span>
                  <h3>{r.title}</h3>
                  <p className="reward__cost"><Icons.leaf width="15" height="15" /> {r.cost} points</p>
                  {code_ ? (
                    <p className="reward__code">
                      <span>Reserved</span>
                      <strong>{code_}</strong>
                    </p>
                  ) : (
                    <button type="button" className="reward__btn" disabled={short > 0} onClick={() => redeem(r)}>
                      {short > 0 ? `Need ${short} more` : 'Redeem'}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </div>

        {/* referral */}
        <div className="refer" id="refer" data-reveal>
          <ReferralDoodle />
          <div className="refer__body">
            <p className="refer__eyebrow">Refer &amp; earn</p>
            <h3>Invite friends, you both get {REFERRAL_POINTS} points</h3>
            <ol className="refer__steps">
              <li><span>1</span> Share your code</li>
              <li><span>2</span> Your friend books a pickup</li>
              <li><span>3</span> You both earn {REFERRAL_POINTS} EcoPoints</li>
            </ol>
            <div className="refer__code">
              <strong>{code}</strong>
              <button type="button" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <div className="refer__share">
              <a className="btn btn--primary" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
                Share on WhatsApp
              </a>
              <button type="button" className="btn btn--ghost" onClick={share}>
                <Icons.send width="18" height="18" /> More ways to share
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
