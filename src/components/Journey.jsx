import { useEffect, useRef } from 'react'
import { DotGrid, Sparkle } from './Doodles.jsx'
import { Section } from './Sections.jsx'
import './Journey.css'

/* ---------- palette ---------- */
const INK = '#2f3b34'
const GREEN = '#1e9e57'
const GREEN_DARK = '#147a41'
const LEAF = '#6fcf4e'
const MINT = '#c6ebb2'
const SOFT = '#e2f4d8'
const CREAM = '#fbfaf6'
const GOLD = '#f6b92b'
const COPPER = '#e0823d'
const ALU = '#b8c4cc'
const TEAL = '#1fb3a0'
const SCREEN = '#eef8e8'

const Ground = ({ w = 260, y = 200 }) => <ellipse cx="160" cy={y} rx={w / 2} ry="9" fill={MINT} />
const Blob = () => (
  <path d="M60 60c30-40 120-50 180-20s60 100 30 140-110 40-170 20S30 100 60 60Z" fill={SOFT} />
)
const Star = ({ x, y, r = 8, fill = GOLD, cls = 'j-twinkle' }) => (
  <path className={cls} d={`M${x} ${y - r}c${r * .14} ${r * .72} ${r * .28} ${r * .86} ${r} ${r}c-${r * .72} ${r * .14}-${r * .86} ${r * .28}-${r} ${r}c-${r * .14}-${r * .72}-${r * .28}-${r * .86}-${r}-${r}c${r * .72}-${r * .14} ${r * .86}-${r * .28} ${r}-${r}Z`} fill={fill} />
)

/* 1 — booking on the phone */
function BookScene() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true">
      <Blob /><Ground w={200} y={206} />
      <g transform="translate(112 14)">
        <rect width="96" height="186" rx="16" fill={INK} />
        <rect x="6" y="8" width="84" height="170" rx="11" fill={SCREEN} />
        <rect x="14" y="20" width="68" height="18" rx="6" fill={GREEN} />
        <rect x="22" y="27" width="34" height="4" rx="2" fill="#fff" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={24 + (i % 4) * 16} cy={54 + Math.floor(i / 4) * 16} r="5.5"
            fill={i === 6 ? GREEN : '#d8ecd0'} className={i === 6 ? 'j-pulse' : undefined} />
        ))}
        <rect x="14" y="108" width="68" height="20" rx="10" fill={SOFT} />
        <rect x="24" y="116" width="30" height="4" rx="2" fill={GREEN} />
        <rect x="14" y="140" width="68" height="24" rx="12" fill={GREEN} className="j-pop" />
        <path d="m38 152 5 5 10-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="j-pop" />
      </g>
      {/* clock */}
      <g transform="translate(62 70)">
        <circle r="26" fill="#fff" stroke={GREEN} strokeWidth="4" />
        <path d="M0-14V0l10 7" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" className="j-spin" />
      </g>
      {/* confirmation bubble */}
      <g transform="translate(222 40)"><g className="j-pop j-pop--late">
        <path d="M0 12a12 12 0 0 1 12-12h58a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12H24l-12 10v-10A12 12 0 0 1 0 30Z" fill="#fff" stroke={MINT} strokeWidth="2" />
        <circle cx="18" cy="21" r="7" fill={LEAF} />
        <path d="m15 21 2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="30" y="17" width="38" height="4" rx="2" fill={GREEN} />
        <rect x="30" y="24" width="24" height="3.5" rx="1.75" fill={MINT} />
      </g></g>
      <Star x={250} y={150} r={9} fill={LEAF} />
    </svg>
  )
}

/* 2 — electric van at the door */
function PickupScene() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true">
      <Blob /><Ground w={290} y={206} />
      {/* house */}
      <g transform="translate(18 62)">
        <path d="M12 50 56 14l44 36v4H12Z" fill={CREAM} />
        <rect x="12" y="48" width="88" height="92" fill={CREAM} />
        <path d="M0 52 56 8l56 44" fill="none" stroke={GREEN_DARK} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="56" cy="34" r="7" fill="#bfe9e3" />
        <rect x="42" y="84" width="28" height="56" rx="4" fill={GOLD} />
        <circle cx="64" cy="114" r="2.5" fill={INK} />
        <rect x="20" y="62" width="18" height="16" rx="3" fill="#bfe9e3" />
        <rect x="74" y="62" width="18" height="16" rx="3" fill="#bfe9e3" />
      </g>
      {/* parcel on the step */}
      <g transform="translate(126 168)"><g className="j-pop j-pop--late">
        <rect width="30" height="26" rx="4" fill="#d9a066" />
        <path d="M0 8h30M15 0v8" stroke="#b98348" strokeWidth="2" />
        <path d="M11 17a5 5 0 0 1 8-1M19 20a5 5 0 0 1-8 1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g></g>
      {/* EV van drives in */}
      <g className="j-drive">
        <g transform="translate(168 108)">
          <path d="M0 16a16 16 0 0 1 16-16h78l30 34v44H0Z" fill="#fff" stroke={MINT} strokeWidth="2" />
          <path d="M96 6h-8v30h34Z" fill="#bfe9e3" />
          <rect x="0" y="54" width="124" height="14" fill={GREEN} />
          <path d="M40 18c0-10 8-16 20-16 0 12-8 18-20 16Z" fill={LEAF} />
          <path d="m64 22-8 14h8l-4 12 12-16h-8l4-10Z" fill={GOLD} />
          <circle cx="26" cy="78" r="14" fill={INK} /><circle cx="26" cy="78" r="5" fill="#cfd8d1" />
          <circle cx="98" cy="78" r="14" fill={INK} /><circle cx="98" cy="78" r="5" fill="#cfd8d1" />
        </g>
        <g stroke={MINT} strokeWidth="4" strokeLinecap="round" className="j-speed">
          <path d="M300 128h14M296 146h18" />
        </g>
      </g>
    </svg>
  )
}

/* 3 — certified data wipe */
function WipeScene() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true">
      <Blob /><Ground w={250} y={204} />
      <g transform="translate(60 40)">
        <rect x="14" width="172" height="118" rx="10" fill={INK} />
        <rect x="22" y="8" width="156" height="102" rx="5" fill={SCREEN} />
        <path d="M0 118h200l-10 16H10Z" fill="#3e4c44" />
        {/* shield */}
        <g transform="translate(100 46)"><g className="j-pop">
          <path d="M0-26 22-18v16c0 16-10 26-22 30-12-4-22-14-22-30v-16Z" fill={GREEN} />
          <rect x="-8" y="-4" width="16" height="13" rx="3" fill="#fff" />
          <path d="M-5-4v-4a5 5 0 0 1 10 0v4" stroke="#fff" strokeWidth="3" fill="none" />
        </g></g>
        <rect x="46" y="86" width="108" height="8" rx="4" fill="#d8ecd0" />
        <rect x="46" y="86" width="108" height="8" rx="4" fill={LEAF} className="j-fill" />
      </g>
      {/* bits dissolving */}
      {['1', '0', '1', '1', '0', '0'].map((b, i) => (
        <text key={i} x={8 + (i % 3) * 14} y={150 + Math.floor(i / 3) * 24} className="j-bit" style={{ '--i': i }}
          fontFamily="Oswald, sans-serif" fontSize="16" fontWeight="600" fill={GREEN}>{b}</text>
      ))}
      <Star x={276} y={50} r={10} />
      <Star x={290} y={150} r={7} fill={LEAF} />
    </svg>
  )
}

/* 4 — sorted on the line */
function SortScene() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true">
      <Blob />
      {/* facility roof */}
      <path d="M40 60V30l30 16V30l30 16V30l30 16v14Z" fill={MINT} />
      {/* belt */}
      <rect x="24" y="112" width="272" height="20" rx="10" fill={INK} />
      {[40, 80, 120, 160, 200, 240, 280].map((x) => <circle key={x} cx={x} cy="122" r="5" fill="#56695d" />)}
      <g className="j-belt">
        <rect x="46" y="80" width="18" height="32" rx="4" fill={INK} /><rect x="49" y="84" width="12" height="22" rx="2" fill="#7d8f84" />
        <rect x="100" y="90" width="34" height="22" rx="3" fill={GREEN} /><path d="M106 97h10M106 104h18M122 97v4" stroke={MINT} strokeWidth="2" />
        <rect x="170" y="94" width="30" height="18" rx="3" fill={GOLD} /><rect x="200" y="99" width="4" height="8" rx="1" fill={GOLD} />
        <rect x="232" y="84" width="40" height="28" rx="3" fill="#56695d" /><path d="M228 112h48" stroke="#3e4c44" strokeWidth="4" />
      </g>
      {/* sorting bins */}
      {[[62, GOLD, 'battery'], [150, GREEN, 'boards'], [238, TEAL, 'screens']].map(([x, c], i) => (
        <g key={i} transform={`translate(${x} 150)`}>
          <path d="M-26 0h52l-6 48h-40Z" fill={c} />
          <rect x="-30" y="-6" width="60" height="10" rx="4" fill={c} opacity=".8" />
        </g>
      ))}
      <path d="M150 132v10" stroke={GREEN} strokeWidth="3" strokeDasharray="3 4" className="j-drop" />
    </svg>
  )
}

/* 5 — materials recovered */
function RecoverScene() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true">
      <Blob /><Ground w={270} y={196} />
      {/* gold bars */}
      <g transform="translate(40 130)"><g className="j-pop">
        {[[0, 30], [36, 30], [18, 4]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M6 0h28l6 26H0Z" fill={GOLD} /><path d="M8 4h24" stroke="#fde7a6" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g></g>
      {/* copper coil */}
      <g transform="translate(160 150)"><g className="j-pop j-pop--2">
        <ellipse rx="34" ry="30" fill={COPPER} />
        {[24, 17, 10].map((r) => <ellipse key={r} rx={r} ry={r * .88} fill="none" stroke="#f3b27f" strokeWidth="2.5" />)}
        <circle r="4" fill="#b8612a" />
      </g></g>
      {/* aluminium sheets */}
      <g transform="translate(212 118)"><g className="j-pop j-pop--3">
        {[0, 12, 24].map((y) => <rect key={y} x={y / 2} y={y} width="64" height="10" rx="3" fill={ALU} stroke="#9aa8b1" />)}
      </g></g>
      {/* plastic pellets */}
      <g transform="translate(234 172)"><g className="j-pop j-pop--3">
        {[[0, 0], [10, 3], [20, -1], [5, 9], [15, 10], [26, 8], [34, 2]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill={i % 2 ? LEAF : TEAL} />)}
      </g></g>
      <Star x={100} y={96} r={10} />
      <Star x={200} y={82} r={8} fill={LEAF} cls="j-twinkle j-twinkle--2" />
      <Star x={290} y={100} r={7} cls="j-twinkle j-twinkle--3" />
    </svg>
  )
}

/* 6 — reborn and rewarded */
function RebornScene() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true">
      <Blob /><Ground w={250} y={204} />
      {/* planet */}
      <g transform="translate(120 112)"><g className="j-pop">
        <circle r="62" fill="#bfe9e3" />
        <path d="M-40-30c14-8 30-2 34 10s-6 20-18 22-26 8-30-4 2-22 14-28Zm44 22c10-8 28-10 38 2s4 30-10 34-20-6-26-14-10-14-2-22Zm-30 46c8-4 20-2 22 6s-8 14-16 12-14-12-6-18Z" fill={LEAF} />
        <path d="M-2-62c-6-20 4-36 22-40 4 20-6 34-22 40Z" fill={GREEN} className="j-grow" />
      </g></g>
      {/* new phone */}
      <g transform="translate(206 70) rotate(8)"><g className="j-pop j-pop--2">
        <rect width="60" height="116" rx="12" fill={INK} />
        <rect x="5" y="7" width="50" height="102" rx="8" fill={SCREEN} />
        <rect x="12" y="20" width="36" height="16" rx="5" fill={GREEN} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={12 + (i % 2) * 20} y={44 + Math.floor(i / 2) * 20} width="16" height="16" rx="5" fill={[GOLD, TEAL, LEAF, GREEN][i]} />)}
      </g></g>
      {/* coin */}
      <g transform="translate(60 176)"><g className="j-coin">
        <circle r="16" fill={GOLD} /><circle r="10" fill="none" stroke="#fff" strokeWidth="2.5" />
        <text y="5.5" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="14" fill="#fff">₹</text>
      </g></g>
      <Star x={286} y={60} r={10} />
      <Star x={50} y={60} r={8} fill={LEAF} cls="j-twinkle j-twinkle--2" />
    </svg>
  )
}

const STOPS = [
  { Art: BookScene, title: 'You book a pickup', chip: 'Takes 2 minutes',
    text: 'Choose a slot online and tell us what you’re recycling. We confirm it instantly.' },
  { Art: PickupScene, title: 'We come to your door', chip: 'Verified executive',
    text: 'Our executive arrives in an electric van, checks your device and pays you on the spot.' },
  { Art: WipeScene, title: 'Your data is wiped', chip: 'Certified erasure',
    text: 'Every device goes through certified data erasure first. Your photos and files are gone for good.' },
  { Art: SortScene, title: 'Sorted & dismantled', chip: 'Authorised facility',
    text: 'At an authorised recycling facility, batteries, circuit boards and screens are safely separated.' },
  { Art: RecoverScene, title: 'Materials recovered', chip: 'Metals & plastics',
    text: 'Gold, silver, copper, aluminium and plastics are extracted and refined, ready to be used again.' },
  { Art: RebornScene, title: 'Reborn as something new', chip: 'Tracked on your dashboard',
    text: 'Recovered materials become new products, and your dashboard shows the impact you made.' },
]

/* The road winds between the stop markers; the badge rides it with the scroll. */
export default function Journey() {
  const trackRef = useRef(null)
  const svgRef = useRef(null)
  const baseRef = useRef(null)
  const drawRef = useRef(null)
  const riderRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const svg = svgRef.current
    const base = baseRef.current
    const drawn = drawRef.current
    const rider = riderRef.current
    const stops = [...track.querySelectorAll('.stop')]
    const nodes = stops.map((s) => s.querySelector('.stop__node'))

    let trackTop = 0
    let len = 0
    let endY = 0
    let nodeY = []
    let lastL = -1
    let raf = 0
    let active = true

    const measure = () => {
      const tr = track.getBoundingClientRect()
      trackTop = tr.top + window.scrollY
      const w = tr.width
      const h = tr.height
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      const pts = nodes.map((n) => {
        const r = n.getBoundingClientRect()
        return [r.left + r.width / 2 - tr.left, r.top + r.height / 2 - tr.top]
      })
      nodeY = pts.map((p) => p[1])
      const swing = w > 900 ? 120 : 22
      const x0 = pts[0][0]
      let d = `M${x0} 0 L${x0} ${pts[0][1]}`
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1]
        const [bx, by] = pts[i]
        const s = i % 2 ? 1 : -1
        const dy = by - ay
        d += ` C${ax + s * swing} ${ay + dy * 0.35} ${bx + s * swing} ${by - dy * 0.35} ${bx} ${by}`
      }
      const last = pts[pts.length - 1]
      endY = Math.min(h, last[1] + 60)
      d += ` L${last[0]} ${endY}`
      base.setAttribute('d', d)
      drawn.setAttribute('d', d)
      len = drawn.getTotalLength()
      drawn.style.strokeDasharray = `${len} ${len}`
      lastL = -1
    }

    // Length along the road where the road reaches height y (road only goes down).
    const lengthAtY = (y) => {
      if (y <= 0) return 0
      if (y >= endY) return len
      let lo = 0
      let hi = len
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2
        if (drawn.getPointAtLength(mid).y < y) lo = mid
        else hi = mid
      }
      return lo
    }

    const update = () => {
      raf = 0
      const lineY = window.scrollY + window.innerHeight * 0.6 - trackTop
      const L = Math.round(lengthAtY(lineY))
      if (L === lastL) return
      lastL = L
      drawn.style.strokeDashoffset = String(len - L)
      const p = drawn.getPointAtLength(L)
      rider.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
      rider.style.opacity = L > 0 && L < len ? '1' : '0'
      stops.forEach((s, i) => s.classList.toggle('is-reached', nodeY[i] <= lineY + 1))
    }

    const onScroll = () => {
      if (active && !raf) raf = requestAnimationFrame(update)
    }

    measure()
    update()
    const remeasure = () => {
      measure()
      update()
    }
    // Layout shifts (fonts, images, rotation) move the stops: rebuild the road.
    const ro = new ResizeObserver(remeasure)
    ro.observe(track)
    window.addEventListener('resize', remeasure)
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting
      if (active) onScroll()
    }, { rootMargin: '200px 0px' })
    io.observe(track)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
    }
  }, [])

  return (
    <Section className="section section--tint journey" id="how-we-work">
      <DotGrid className="deco deco--tr" />
      <Sparkle className="deco journey__spark" color="#f6b92b" />
      <div className="container">
        <div className="heading heading--center" data-reveal>
          <h2>
            <span className="heading__a">How we work:</span> <span className="heading__b">your device’s journey</span>
          </h2>
          <p>Follow an old phone from your drawer to a brand-new life. Scroll along the road to see every stop.</p>
        </div>

        <div className="journey__track" ref={trackRef}>
          <svg ref={svgRef} className="journey__road" aria-hidden="true">
            <defs>
              <linearGradient id="road-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6fcf4e" />
                <stop offset="1" stopColor="#1e9e57" />
              </linearGradient>
            </defs>
            <path ref={baseRef} className="journey__base" />
            <path ref={drawRef} className="journey__drawn" />
            <g ref={riderRef} className="journey__rider" style={{ opacity: 0 }}>
              <circle r="26" fill="#fff" stroke="#1e9e57" strokeWidth="3" />
              <g className="journey__rider-icon">
                <path d="M7-6a9 9 0 0 0-15 1M-7 6a9 9 0 0 0 15-1M8-12v6H2M-8 12V6h6" stroke="#1e9e57" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          </svg>

          {STOPS.map(({ Art, title, text, chip }, i) => (
            <article className={`stop ${i % 2 ? 'stop--right' : 'stop--left'}`} key={title}>
              <div className="stop__art"><Art /></div>
              <span className="stop__node">{i + 1}</span>
              <div className="stop__text">
                <span className="stop__tag">Stop {String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="stop__chip">{chip}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}
