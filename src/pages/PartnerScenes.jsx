/* Animated doodle scenes for the partner story (viewBox 0 0 440 400). */

const INK = '#2f3b34'
const GREEN = '#1e9e57'
const DARK = '#147a41'
const LEAF = '#6fcf4e'
const MINT = '#c6ebb2'
const SOFT = '#e2f4d8'
const GOLD = '#f6b92b'
const TEAL = '#1fb3a0'
const SCREEN = '#eef8e8'

const Blob = () => <path d="M70 120c30-80 150-110 250-80s120 110 100 190-60 150-170 150S40 300 40 220c0-40 12-70 30-100Z" fill={SOFT} />
const Star = ({ x, y, r = 9, fill = GOLD, d = 0 }) => (
  <path className="ps-twinkle" style={{ '--d': `${d}s` }}
    d={`M${x} ${y - r}c${r * .14} ${r * .72} ${r * .28} ${r * .86} ${r} ${r}c-${r * .72} ${r * .14}-${r * .86} ${r * .28}-${r} ${r}c-${r * .14}-${r * .72}-${r * .28}-${r * .86}-${r}-${r}c${r * .72}-${r * .14} ${r * .86}-${r * .28} ${r}-${r}Z`} fill={fill} />
)

/* Intro: trucks keep arriving at your facility */
export function IntroScene() {
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <Blob />
      <ellipse cx="220" cy="350" rx="190" ry="12" fill={MINT} />
      <g transform="translate(180 170)">
        <path d="M0 180V70l50 30V70l50 30V70l50 30V20h40v160Z" fill={GREEN} />
        {[20, 70, 120].map((x) => <rect key={x} x={x} y="130" width="22" height="22" rx="4" fill={SCREEN} />)}
        <rect x="150" y="100" width="40" height="80" fill={DARK} />
        <rect x="-10" y="176" width="210" height="8" rx="4" fill={DARK} />
        <g className="ps-smoke">
          <circle cx="170" cy="4" r="10" fill="#fff" /><circle cx="184" cy="-10" r="13" fill="#fff" /><circle cx="198" cy="-26" r="9" fill="#fff" />
        </g>
        <rect x="40" y="36" width="96" height="26" rx="8" fill="#fff" />
        <text x="88" y="54" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="14" letterSpacing="1.5" fill={GREEN}>YOUR PLANT</text>
      </g>
      <g className="ps-road"><path d="M0 356h440" stroke="#fff" strokeWidth="4" strokeDasharray="22 16" /></g>
      {[0, 1].map((i) => (
        <g key={i} className="ps-truck" style={{ '--d': `${i * 2.2}s` }}>
          <g transform="translate(-10 296)">
            <rect width="70" height="44" rx="8" fill="#fff" stroke={MINT} strokeWidth="2.5" />
            <path d="M24 12a10 10 0 0 1 17-2M40 30a10 10 0 0 1-17 2" stroke={GREEN} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M70 14h18l14 16v14H70Z" fill={GREEN} />
            <circle cx="18" cy="48" r="9" fill={INK} /><circle cx="84" cy="48" r="9" fill={INK} />
          </g>
        </g>
      ))}
      <Star x={90} y={120} r={12} />
      <Star x={380} y={110} r={9} fill={LEAF} d={0.6} />
    </svg>
  )
}

/* 1. Get verified: your authorisation is checked and stamped */
export function VerifyScene() {
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <Blob />
      <g transform="translate(110 70) rotate(-4)">
        <rect width="220" height="270" rx="14" fill="#fff" stroke={MINT} strokeWidth="3" />
        <rect x="24" y="26" width="120" height="12" rx="6" fill={GREEN} />
        {[58, 78, 98, 118, 138].map((y, i) => <rect key={y} x="24" y={y} width={i % 2 ? 140 : 172} height="7" rx="3.5" fill="#dfeadb" />)}
        <rect x="24" y="170" width="80" height="7" rx="3.5" fill="#dfeadb" />
        <path d="M24 236c20-14 30 8 50-6s30 4 40 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g className="ps-stamp">
          <g transform="translate(150 200) rotate(-14)">
            <circle r="44" fill="none" stroke={GREEN} strokeWidth="5" />
            <circle r="34" fill="none" stroke={GREEN} strokeWidth="2" />
            <text y="5" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="13" letterSpacing="1.2" fill={GREEN}>VERIFIED</text>
          </g>
        </g>
      </g>
      <g transform="translate(340 250)">
        <g className="ps-pulse">
          <path d="M0-40 32-28v24c0 24-14 40-32 46-18-6-32-22-32-46v-24Z" fill={GREEN} />
          <path d="m-12 0 8 8 18-18" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <Star x={90} y={110} r={12} />
      <Star x={360} y={120} r={9} fill={LEAF} d={0.5} />
    </svg>
  )
}

/* 2. Requests flow in: devices fly into your dashboard */
export function RequestsScene() {
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <Blob />
      <g transform="translate(150 80)">
        <rect width="240" height="250" rx="20" fill={INK} />
        <rect x="10" y="12" width="220" height="226" rx="12" fill={SCREEN} />
        <rect x="24" y="26" width="110" height="12" rx="6" fill={GREEN} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} className="ps-row" style={{ '--d': `${0.3 + i * 0.5}s` }}>
            <rect x="24" y={56 + i * 44} width="192" height="34" rx="10" fill="#fff" />
            <circle cx="42" cy={73 + i * 44} r="9" fill={[GREEN, GOLD, TEAL, LEAF][i]} />
            <rect x="58" y={67 + i * 44} width="90" height="6" rx="3" fill={INK} opacity=".7" />
            <rect x="58" y={77 + i * 44} width="56" height="5" rx="2.5" fill={MINT} />
            <rect x="170" y={66 + i * 44} width="36" height="14" rx="7" fill={SOFT} />
          </g>
        ))}
        <g className="ps-badge">
          <circle cx="232" cy="8" r="18" fill="#ef8354" />
          <text x="232" y="14" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="15" fill="#fff">+4</text>
        </g>
      </g>
      {/* devices flying in */}
      {[
        { d: 0, el: <><rect x="-10" y="-18" width="20" height="36" rx="5" fill={INK} /><rect x="-7" y="-13" width="14" height="24" rx="2" fill="#7d8f84" /></> },
        { d: 0.9, el: <><rect x="-18" y="-12" width="36" height="22" rx="3" fill={INK} /><path d="M-22 10h44l-3 5h-38Z" fill="#3e4c44" /></> },
        { d: 1.8, el: <><rect x="-14" y="-8" width="28" height="16" rx="3" fill={GOLD} /><rect x="14" y="-4" width="4" height="8" rx="1" fill={GOLD} /></> },
      ].map(({ d, el }, i) => (
        <g key={i} className="ps-fly" style={{ '--d': `${d}s` }}>{el}</g>
      ))}
      <Star x={80} y={90} r={11} />
    </svg>
  )
}

/* 3. Pickups routed to you: the van follows the best route */
export function RouteScene() {
  const route = 'M80 300C120 240 160 280 200 220S290 150 350 110'
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <rect x="40" y="50" width="360" height="300" rx="30" fill="#f9fbf5" stroke={MINT} strokeWidth="3" />
      <path d="M40 200c90-20 180 30 360-10M220 50c-20 100 30 180 0 300M40 110h140" stroke="#fff" strokeWidth="16" strokeLinecap="round" fill="none" />
      <circle cx="320" cy="270" r="30" fill={MINT} /><circle cx="110" cy="140" r="22" fill="#bfe9e3" />
      <path d={route} fill="none" stroke={MINT} strokeWidth="6" strokeLinecap="round" />
      <path d={route} fill="none" stroke={GREEN} strokeWidth="6" strokeLinecap="round" strokeDasharray="1 14" className="ps-route" pathLength="1" />
      {[[80, 300], [200, 220], [350, 110]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}><g className="ps-pin" style={{ '--d': `${i * 0.5}s` }}>
          <path d="M0 0s-16-14-16-27a16 16 0 0 1 32 0C16-14 0 0 0 0Z" fill={i === 2 ? GREEN : LEAF} />
          <circle cy="-27" r="6" fill="#fff" />
        </g></g>
      ))}
      <g>
        <g transform="translate(-22 -14)">
          <rect width="30" height="20" rx="4" fill="#fff" stroke={GREEN} strokeWidth="2.5" />
          <path d="M30 6h8l6 7v7H30Z" fill={GREEN} />
          <circle cx="8" cy="22" r="4" fill={INK} /><circle cx="36" cy="22" r="4" fill={INK} />
        </g>
        <animateMotion dur="4s" repeatCount="indefinite" rotate="auto" path={route} />
      </g>
    </svg>
  )
}

/* 4. Process & pay out: devices in, instant payouts out */
export function PayoutScene() {
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <Blob />
      <rect x="30" y="250" width="250" height="20" rx="10" fill={INK} />
      {[50, 90, 130, 170, 210, 250].map((x) => <circle key={x} cx={x} cy="260" r="5" fill="#56695d" />)}
      <g className="ps-belt">
        <rect x="40" y="220" width="18" height="30" rx="4" fill={INK} />
        <rect x="100" y="226" width="34" height="24" rx="3" fill={GREEN} />
        <rect x="170" y="230" width="28" height="20" rx="3" fill={GOLD} />
      </g>
      <g transform="translate(250 150)">
        <path d="M0 130V50l40 24V50l40 24V10h30v120Z" fill={GREEN} />
        <rect x="-4" y="126" width="120" height="8" rx="4" fill={DARK} />
      </g>
      {/* coins to the customer's phone */}
      <g transform="translate(330 60)">
        <rect width="70" height="120" rx="14" fill={INK} />
        <rect x="6" y="10" width="58" height="100" rx="9" fill={SCREEN} />
        <circle cx="35" cy="48" r="16" fill={GREEN} />
        <path d="m27 48 6 6 11-12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="74" width="38" height="8" rx="4" fill={GOLD} />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} className="ps-coin" style={{ '--d': `${i * 0.6}s` }}>
          <circle cx="300" cy="170" r="12" fill={GOLD} />
          <text x="300" y="175" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="12" fill="#fff">₹</text>
        </g>
      ))}
      <Star x={80} y={110} r={12} />
    </svg>
  )
}

/* 5. Grow your impact: numbers and certificates that grow with you */
export function GrowScene() {
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <Blob />
      <g transform="translate(70 90)">
        <rect width="230" height="220" rx="20" fill="#fff" stroke={MINT} strokeWidth="3" />
        {[0.35, 0.55, 0.45, 0.75, 0.95].map((h, i) => (
          <rect key={i} className="ps-bar" style={{ '--h': h, '--d': `${i * 0.15}s` }}
            x={26 + i * 38} y="40" width="26" height="150" rx="6" fill={i === 4 ? GREEN : LEAF} />
        ))}
        <path d="M26 196h180" stroke={MINT} strokeWidth="3" />
        <path className="ps-trend" d="M36 150 74 120l38 16 38-44 38-30" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      </g>
      <g transform="translate(340 330)">
        <path d="M-18 0h36l-4 -26h-28Z" fill="#e0823d" />
        <g className="ps-sprout">
          <path d="M0-26v-60" stroke={DARK} strokeWidth="5" strokeLinecap="round" />
          <path d="M0-60c-26 0-36-18-32-36 22 0 36 14 32 36Z" fill={LEAF} />
          <path d="M0-76c20-4 30-22 26-40-22 4-30 22-26 40Z" fill={GREEN} />
        </g>
      </g>
      <Star x={330} y={120} r={12} />
      <Star x={60} y={330} r={9} fill={LEAF} d={0.7} />
    </svg>
  )
}
