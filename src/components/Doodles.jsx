/* Hand-drawn SVG doodles in the site palette. All decorative (aria-hidden). */

const C = {
  sage: '#1e9e57',
  sageDark: '#147a41',
  sageLight: '#5cbf45',
  leaf: '#6fcf4e',
  leafSoft: '#dff3d4',
  mint: '#c6ebb2',
  cream: '#fbfaf6',
  ink: '#2f3b34',
  gold: '#f6b92b',
  goldSoft: '#fdedc2',
  skin: '#f0c4a0',
  water: '#bfe9e3',
}

/* ---------------- small line icons (24×24, stroke = currentColor) ---------------- */
const icon = (paths) =>
  function Icon(props) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {paths}
      </svg>
    )
  }

export const Icons = {
  scan: icon(<>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <rect x="9" y="7.5" width="6" height="9" rx="1.4" />
    <path d="M11.2 14.5h1.6" />
  </>),
  layers: icon(<>
    <path d="M12 3.5 3.5 8 12 12.5 20.5 8 12 3.5Z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
  </>),
  value: icon(<>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 8h6M9 10.8h6M12.4 8c1.6 0 2.4 1 2.4 1.8 0 1.4-1.2 2.3-3.2 2.3H9.2l4.6 4" />
  </>),
  pin: icon(<>
    <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </>),
  truck: icon(<>
    <path d="M3 6.5h10.5v9.5H3zM13.5 10h4l3 3.2V16h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>),
  wallet: icon(<>
    <path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18V7.5Zm0 0L15 4.5v3" />
    <path d="M20 12h-3.5a1.5 1.5 0 0 0 0 3H20" />
  </>),
  dashboard: icon(<>
    <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
    <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
  </>),
  leaf: icon(<>
    <path d="M5 19.5C5 11 10 5.5 19.5 4.5c0 9.5-5.5 15-14 15Z" />
    <path d="M5 19.5c3-4.5 6.5-7.5 10.5-9.5" />
  </>),
  check: icon(<path d="m5 12.5 4.2 4.2L19 7" />),
  inbox: icon(<>
    <path d="M3.5 13.5 6 5.5h12l2.5 8V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18v-4.5Z" />
    <path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5" />
  </>),
  calendar: icon(<>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h3" />
  </>),
  cog: icon(<>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
  </>),
  receipt: icon(<>
    <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3v-17Z" />
    <path d="M9 8h6M9 11.5h6M9 15h3.5" />
  </>),
  send: icon(<>
    <path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4 17-6.5Z" />
  </>),
  shield: icon(<>
    <path d="M12 3.5 19 6v5.5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </>),
  arrow: icon(<path d="M5 12h14M13 6l6 6-6 6" />),
}

/* ---------------- decorative bits ---------------- */
export function DotGrid({ className, cols = 5, rows = 4, color = C.sageLight }) {
  const dots = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) dots.push(<circle key={`${r}-${c}`} cx={6 + c * 18} cy={6 + r * 18} r="2.6" />)
  return (
    <svg className={className} viewBox={`0 0 ${cols * 18} ${rows * 18}`} width={cols * 18} height={rows * 18} fill={color} aria-hidden="true">
      {dots}
    </svg>
  )
}

export function Sparkle({ className, color = C.leaf, size = 22 }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 1.5c.9 5.6 2.9 7.6 8.5 8.5-5.6.9-7.6 2.9-8.5 8.5-.9-5.6-2.9-7.6-8.5-8.5 5.6-.9 7.6-2.9 8.5-8.5Z" fill={color} />
    </svg>
  )
}

/* A leaf gliding along a dashed loop, the site's take on the paper-plane doodle. */
export function LeafTrail({ className, ...rest }) {
  return (
    <svg className={className} viewBox="0 0 220 130" width="220" height="130" fill="none" aria-hidden="true" {...rest}>
      <path d="M8 118c30-4 52-18 58-38 7-24-18-34-30-18-12 17 10 38 44 34 36-4 64-32 86-64"
        stroke={C.sageLight} strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round" />
      <g transform="translate(168 8) rotate(28)">
        <path d="M0 22C0 8 10 0 26 0c0 15-9 22-26 22Z" fill={C.leaf} />
        <path d="M0 22C8 14 15 9 22 5" stroke={C.sage} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function Leaf({ className, color = C.leaf, vein = C.sage, rotate = 0, size = 44 }) {
  return (
    <svg className={className} viewBox="0 0 44 44" width={size} height={size} fill="none" aria-hidden="true"
      style={{ rotate: `${rotate}deg` }}>
      <path d="M6 38C6 18 18 6 38 6c0 20-12 32-32 32Z" fill={color} />
      <path d="M6 38C16 27 24 20 32 13" stroke={vein} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Fronds({ x, y, flip = false, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <path d="M0 0C-6-34 6-62 34-78 34-44 22-18 0 0Z" fill={C.leaf} />
      <path d="M0 0C8-26 18-48 30-70" stroke={C.sage} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M0 0C-22-14-44-14-62-2-38 8-18 8 0 0Z" fill={C.sageLight} />
      <path d="M0 0C-20-4-38-4-54-2" stroke={C.sage} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M2 0C10-20 26-30 46-32 40-12 24-2 2 0Z" fill={C.mint} />
    </g>
  )
}

/* ---------------- How it works: phone scanning an old laptop ---------------- */
export function ScanIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 480 420" fill="none" aria-hidden="true">
      <path d="M92 110c38-66 150-86 232-54 82 32 132 104 110 188-22 86-118 136-214 124-96-12-164-74-168-150-2-40 14-72 40-108Z" fill={C.leafSoft} />
      <circle cx="400" cy="92" r="26" fill={C.mint} />

      {/* old laptop */}
      <g transform="translate(58 218)">
        <rect x="18" y="0" width="190" height="122" rx="10" fill={C.ink} />
        <rect x="28" y="10" width="170" height="102" rx="5" fill="#56695d" />
        <path d="M96 24l14 30-10 12 16 30" stroke="#8fa196" strokeWidth="2" strokeLinecap="round" />
        <path d="M110 54l26-6" stroke="#8fa196" strokeWidth="2" strokeLinecap="round" />
        <path d="M0 122h226l-12 16H12L0 122Z" fill="#3e4c44" />
        <rect x="92" y="122" width="42" height="6" rx="3" fill="#56695d" />
      </g>

      {/* phone */}
      <g transform="translate(240 64)">
        <rect x="0" y="0" width="156" height="290" rx="24" fill={C.ink} />
        <rect x="9" y="12" width="138" height="266" rx="16" fill={C.cream} />
        <rect x="58" y="18" width="40" height="7" rx="3.5" fill={C.ink} />
        {/* viewfinder */}
        <g stroke={C.sage} strokeWidth="4" strokeLinecap="round">
          <path d="M28 70V56h14M128 56h-14M128 56v14M28 166v14h14M128 180h-14M128 180v-14" />
        </g>
        <g transform="translate(40 92)">
          <rect x="6" y="0" width="64" height="42" rx="4" fill="#56695d" />
          <path d="M0 42h76l-5 7H5l-5-7Z" fill="#3e4c44" />
        </g>
        <rect className="scanline" x="30" y="60" width="96" height="3" rx="1.5" fill={C.leaf} />
        {/* result chip */}
        <rect x="22" y="200" width="112" height="30" rx="15" fill={C.leafSoft} />
        <circle cx="40" cy="215" r="7" fill={C.leaf} />
        <path d="m36.5 215 2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="54" y="210" width="62" height="5" rx="2.5" fill={C.sage} />
        <rect x="54" y="219" width="40" height="4" rx="2" fill={C.sageLight} />
        <rect x="22" y="240" width="112" height="22" rx="11" fill={C.sage} />
        <rect x="52" y="249" width="52" height="4" rx="2" fill="#fff" />
      </g>

      {/* AI badge */}
      <g transform="translate(362 36)">
        <rect x="0" y="0" width="74" height="40" rx="20" fill={C.sage} />
        <text x="37" y="26.5" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="18" fontWeight="600" fill="#fff" letterSpacing="1">AI</text>
      </g>
      <path d="M352 104c10-10 14-20 16-30" stroke={C.sage} strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M444 116c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6Z" fill={C.gold} />
      <path d="M214 60c.8 5.2 2.6 7 7.8 7.8-5.2.8-7 2.6-7.8 7.8-.8-5.2-2.6-7-7.8-7.8 5.2-.8 7-2.6 7.8-7.8Z" fill={C.leaf} />

      <Fronds x={60} y={380} scale={0.9} />
      <Fronds x={440} y={390} flip scale={1} />
      <path d="M20 380h440" stroke={C.mint} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ---------------- Partners: recycling truck ---------------- */
export function TruckIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 520 320" fill="none" aria-hidden="true">
      <path d="M60 150c20-80 120-120 220-110s190 60 200 140c8 70-60 110-200 110S40 230 60 150Z" fill="rgba(255,255,255,.08)" />
      <g stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeLinecap="round">
        <path d="M24 150h50M10 180h70M34 210h40" />
      </g>
      {/* box */}
      <rect x="100" y="90" width="230" height="150" rx="14" fill={C.leaf} />
      <rect x="100" y="222" width="230" height="18" fill="#52b536" />
      <circle cx="215" cy="160" r="38" fill="#fff" opacity=".9" />
      <path d="M233 146a20 20 0 0 0-34-2M197 174a20 20 0 0 0 34 2M234 134v12h-12M196 186v-12h12" stroke={C.sage} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* cab */}
      <path d="M330 130h66c8 0 15 4 19 11l29 45c3 5 4 10 4 16v26c0 7-5 12-12 12h-106V130Z" fill={C.cream} />
      <path d="M346 146h46l24 40h-70v-40Z" fill={C.water} />
      <rect x="346" y="200" width="22" height="5" rx="2.5" fill={C.sageLight} />
      <rect x="436" y="214" width="14" height="10" rx="3" fill={C.gold} />
      {/* wheels */}
      {[160, 280, 400].map((x) => (
        <g key={x}>
          <circle cx={x} cy="246" r="28" fill={C.ink} />
          <circle cx={x} cy="246" r="12" fill="#cfd8d1" />
          <circle cx={x} cy="246" r="4" fill={C.ink} />
        </g>
      ))}
      <path d="M40 276h450" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeLinecap="round" strokeDasharray="22 14" />
      <g transform="translate(96 58) rotate(-20)">
        <path d="M0 26C0 10 12 0 30 0c0 18-11 26-30 26Z" fill={C.mint} />
      </g>
      <g transform="translate(454 92) rotate(30)">
        <path d="M0 20C0 8 9 0 22 0c0 13-8 20-22 20Z" fill={C.leaf} />
      </g>
    </svg>
  )
}

/* ---------------- Flow nodes ---------------- */
export function PersonDoodle() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M26 120c0-26 16-40 34-40s34 14 34 40Z" fill={C.sage} />
      <rect x="53" y="66" width="14" height="16" rx="6" fill={C.skin} />
      <circle cx="60" cy="50" r="20" fill={C.skin} />
      <path d="M40 48c-2-16 10-26 22-26 14 0 22 10 20 22-6-6-14-8-22-8-8 0-14 4-20 12Z" fill={C.ink} />
      <circle cx="53" cy="52" r="2" fill={C.ink} />
      <circle cx="67" cy="52" r="2" fill={C.ink} />
      <path d="M54 60c4 4 8 4 12 0" stroke={C.ink} strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="72" y="84" width="16" height="26" rx="4" fill={C.ink} transform="rotate(-12 80 97)" />
    </svg>
  )
}

export function EwasteDoodle() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="18" y="44" width="64" height="42" rx="5" fill={C.ink} />
      <rect x="23" y="49" width="54" height="32" rx="3" fill="#56695d" />
      <path d="M12 86h76l-5 7H17Z" fill="#3e4c44" />
      <rect x="70" y="30" width="30" height="56" rx="6" fill="#3e4c44" transform="rotate(12 85 58)" />
      <rect x="74" y="36" width="22" height="42" rx="3" fill="#7d8f84" transform="rotate(12 85 58)" />
      <rect x="28" y="92" width="44" height="18" rx="4" fill={C.gold} />
      <rect x="72" y="97" width="5" height="8" rx="1.5" fill={C.gold} />
      <path d="M36 101h10M41 96v10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function FactoryDoodle() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M14 104V62l22 14V62l22 14V62l22 14V40h18v64Z" fill={C.sage} />
      <rect x="22" y="84" width="10" height="10" rx="2" fill={C.cream} />
      <rect x="44" y="84" width="10" height="10" rx="2" fill={C.cream} />
      <rect x="66" y="84" width="10" height="10" rx="2" fill={C.cream} />
      <path d="M89 34C89 20 98 12 112 12c0 14-8 22-23 22Z" fill={C.leaf} />
      <path d="M89 34c6-8 12-12 18-16" stroke={C.sageDark} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 104h104" stroke={C.sageDark} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function WalletDoodle() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="70" cy="38" rx="16" ry="16" fill={C.gold} />
      <ellipse cx="70" cy="38" rx="10" ry="10" fill="none" stroke="#fff" strokeWidth="2.5" />
      <ellipse cx="44" cy="30" rx="12" ry="12" fill={C.goldSoft} stroke={C.gold} strokeWidth="3" />
      <rect x="16" y="50" width="88" height="56" rx="10" fill={C.sage} />
      <path d="M16 62h88" stroke={C.sageDark} strokeWidth="3" />
      <rect x="72" y="70" width="32" height="20" rx="6" fill={C.sageDark} />
      <circle cx="84" cy="80" r="4" fill={C.gold} />
    </svg>
  )
}
