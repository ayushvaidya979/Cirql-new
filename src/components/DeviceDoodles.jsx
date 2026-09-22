/* Device doodles for the valuation flow, in the site palette. */

const INK = '#2f3b34'
const BASE = '#3e4c44'
const SCREEN = '#eef8e8'
const DEAD = '#1f2a24'
const GREEN = '#1e9e57'
const LEAF = '#6fcf4e'
const MINT = '#c6ebb2'
const GOLD = '#f6b92b'
const SOFT_GREEN = '#e2f4d8'
const TEAL_SHIRT = '#1fb3a0'
const APP_COLORS = ['#1e9e57', '#f6b92b', '#1fb3a0', '#6fcf4e', '#ef8354', '#5cbf45', '#1fb3a0', '#f6b92b', '#1e9e57']

const star = (x, y, r, fill = LEAF, cls) => (
  <path
    className={cls}
    d={`M${x} ${y - r}c${r * 0.14} ${r * 0.72} ${r * 0.28} ${r * 0.86} ${r} ${r}c-${r * 0.72} ${r * 0.14}-${r * 0.86} ${r * 0.28}-${r} ${r}c-${r * 0.14}-${r * 0.72}-${r * 0.28}-${r * 0.86}-${r}-${r}c${r * 0.72}-${r * 0.14} ${r * 0.86}-${r * 0.28} ${r}-${r}Z`}
    fill={fill}
  />
)

function PowerIcon({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#5b6b61" strokeWidth="4" strokeLinecap="round" fill="none">
      <path d="M-11-8a15 15 0 1 0 22 0" />
      <path d="M0-16V-2" />
    </g>
  )
}

/* ---------- phone: 150 × 280 ---------- */
export function PhoneG({ condition }) {
  const dead = condition === 'dead'
  return (
    <g>
      <rect width="150" height="280" rx="24" fill={INK} />
      <rect className="dd-screen" x="8" y="10" width="134" height="260" rx="17" style={{ fill: dead ? DEAD : SCREEN }} />
      <g className="dd-ui" style={{ opacity: dead ? 0 : 1 }}>
        <rect x="20" y="36" width="110" height="46" rx="11" fill={GREEN} />
        <rect x="32" y="50" width="54" height="6" rx="3" fill="#fff" />
        <rect x="32" y="62" width="34" height="5" rx="2.5" fill="#bdebc9" />
        <circle cx="112" cy="59" r="10" fill={GOLD} />
        {APP_COLORS.map((c, i) => (
          <rect key={i} x={22 + (i % 3) * 38} y={96 + Math.floor(i / 3) * 38} width="30" height="30" rx="9" fill={c} />
        ))}
        <rect x="20" y="222" width="110" height="34" rx="14" fill={GREEN} opacity=".12" />
        {[42, 75, 108].map((x) => <circle key={x} cx={x} cy="239" r="9" fill={GREEN} opacity=".55" />)}
      </g>
      <rect x="55" y="16" width="40" height="7" rx="3.5" fill={INK} />
      {dead && <PowerIcon x={75} y={140} />}
      {condition === 'cracked' && (
        <g className="dd-cracks" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".92">
          <path d="M98 124 62 70 50 26M98 124l40-30M98 124l20 78-8 60M98 124 40 172 12 182M98 124 76 214M62 70l-26 6M118 202l18 16" />
          <circle cx="98" cy="124" r="7" />
        </g>
      )}
    </g>
  )
}

/* ---------- laptop: 300 × 196 ---------- */
export function LaptopG({ condition }) {
  const dead = condition === 'dead'
  return (
    <g>
      <rect x="22" width="256" height="172" rx="12" fill={INK} />
      <rect className="dd-screen" x="32" y="10" width="236" height="150" rx="6" style={{ fill: dead ? DEAD : SCREEN }} />
      <g className="dd-ui" style={{ opacity: dead ? 0 : 1 }}>
        <rect x="32" y="10" width="236" height="16" rx="6" fill={GREEN} opacity=".18" />
        {[44, 54, 64].map((x, i) => <circle key={x} cx={x} cy="18" r="3" fill={[GOLD, LEAF, GREEN][i]} />)}
        <rect x="44" y="36" width="52" height="112" rx="8" fill={GREEN} opacity=".14" />
        {[48, 66, 84, 102].map((y) => <rect key={y} x="52" y={y} width="36" height="7" rx="3.5" fill={GREEN} opacity=".5" />)}
        <rect x="106" y="36" width="150" height="54" rx="9" fill={GREEN} />
        <rect x="118" y="50" width="70" height="7" rx="3.5" fill="#fff" />
        <rect x="118" y="63" width="44" height="6" rx="3" fill="#bdebc9" />
        <circle cx="232" cy="63" r="12" fill={GOLD} />
        <rect x="106" y="98" width="70" height="50" rx="9" fill="#1fb3a0" />
        <rect x="186" y="98" width="70" height="50" rx="9" fill={LEAF} />
      </g>
      {dead && <PowerIcon x={150} y={88} />}
      {condition === 'cracked' && (
        <g className="dd-cracks" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".92">
          <path d="M190 70 150 30 136 12M190 70l54-28M190 70l30 50 18 36M190 70l-72 40-50 30M190 70l-16 84M150 30l-30 4M220 120l28 6" />
          <circle cx="190" cy="70" r="7" />
        </g>
      )}
      <path d="M0 172h300l-14 22H14Z" fill={BASE} />
      <rect x="124" y="172" width="52" height="6" rx="3" fill="#56695d" />
    </g>
  )
}

/* Self-contained device picture for option cards. */
export function DeviceArt({ category = 'phone', condition, className }) {
  const phone = category === 'phone'
  return (
    <svg className={className} viewBox={phone ? '-40 -24 230 330' : '-26 -34 352 262'} aria-hidden="true">
      <ellipse cx={phone ? 75 : 150} cy={phone ? 292 : 206} rx={phone ? 70 : 150} ry="9" fill={MINT} />
      {phone ? <PhoneG condition={condition} /> : <LaptopG condition={condition} />}
      {condition === 'superb' && (
        <g>
          {star(phone ? -18 : -10, 40, 14, GOLD, 'twinkle')}
          {star(phone ? 168 : 316, 90, 11, LEAF, 'twinkle twinkle--2')}
          {star(phone ? 160 : 300, 10, 8, GOLD, 'twinkle twinkle--3')}
        </g>
      )}
      {condition === 'dead' && (
        <text x={phone ? 150 : 290} y={phone ? 20 : 0} fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="22" fill="#8a968f">z<tspan dy="-10" fontSize="16">z</tspan></text>
      )}
    </svg>
  )
}

/* ---------- the story stage ---------- */
function Tag({ x, y, text }) {
  const w = 30 + text.length * 10
  return (
    <g transform={`translate(${x} ${y})`}><g className="stage__tag">
      <path d="M0 0c10 10 18 18 22 30" stroke={GREEN} strokeWidth="2" fill="none" strokeDasharray="3 4" />
      <g transform="translate(14 28) rotate(8)">
        <path d={`M0 10 12 0h${w}a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H12L0 30Z`} fill="#fff" stroke={GREEN} strokeWidth="2.5" />
        <circle cx="12" cy="20" r="4" fill={GREEN} />
        <text x={22 + w / 2} y="26.5" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="16" fill={INK}>{text}</text>
      </g>
    </g></g>
  )
}

function Calendar({ age }) {
  return (
    <g transform="translate(28 40) rotate(-6)"><g className="stage__calendar">
      <rect width="100" height="96" rx="14" fill="#fff" stroke={MINT} strokeWidth="2" />
      <path d="M0 14a14 14 0 0 1 14-14h72a14 14 0 0 1 14 14v12H0Z" fill={GREEN} />
      <rect x="24" y="-8" width="6" height="18" rx="3" fill={INK} />
      <rect x="70" y="-8" width="6" height="18" rx="3" fill={INK} />
      <text x="50" y="66" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="30" fill={GREEN}>{age.badge}</text>
      <text x="50" y="84" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="11" letterSpacing="1.5" fill="#56615a">{age.unit}</text>
    </g></g>
  )
}

function Bin() {
  return (
    <g>
      <path d="M136 272h168l-16 152a14 14 0 0 1-14 12H166a14 14 0 0 1-14-12Z" fill={GREEN} />
      <rect x="124" y="254" width="192" height="26" rx="10" fill="#178a45" />
      <path d="M196 336a26 26 0 0 1 46-4M244 372a26 26 0 0 1-46 4M244 318v14h-14M196 390v-14h14" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  )
}

export function Stage({ category, brand, age, condition, done }) {
  const phone = category === 'phone'
  const origin = phone ? { x: 145, y: 118 } : { x: 70, y: 196 }
  const tagAt = phone ? { x: 282, y: 128 } : { x: 340, y: 206 }
  return (
    <svg className="story-stage" viewBox="0 0 440 470" aria-hidden="true">
      <path d="M70 140c30-80 150-120 250-90s120 110 110 190-50 170-160 180S40 360 40 260c0-50 12-80 30-120Z" fill="#e2f4d8" />
      <ellipse cx="220" cy="440" rx="160" ry="14" fill={MINT} />

      {!category && (
        <g className="stage__pop">
          <g transform="translate(96 150) rotate(-8)" opacity=".35"><PhoneG /></g>
          <g transform="translate(200 250) scale(.62)" opacity=".35"><LaptopG /></g>
          <g transform="translate(250 80)">
            <path d="M0 40a40 40 0 1 1 18 33l-20 9 6-18A40 40 0 0 1 0 40Z" fill="#fff" stroke={GREEN} strokeWidth="3" />
            <text x="40" y="56" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="42" fill={GREEN}>?</text>
          </g>
        </g>
      )}

      {category && !done && (
        <g key={category} className="stage__pop">
          {age && <Calendar key={age.id} age={age} />}
          <g transform={`translate(${origin.x} ${origin.y})`}>
            {phone ? <PhoneG condition={condition} /> : <LaptopG condition={condition} />}
          </g>
          {brand && <Tag key={brand.id} x={tagAt.x} y={tagAt.y} text={brand.name} />}
          {age && Array.from({ length: age.level }, (_, i) => (
            <circle key={i} className="stage__dust" cx={120 + i * 52} cy={426 - (i % 2) * 8} r={3 + (i % 3)} fill="#b7c2bb" style={{ '--i': i }} />
          ))}
          {condition === 'superb' && (
            <g key="superb">
              {star(phone ? 104 : 46, phone ? 250 : 180, 16, GOLD, 'twinkle')}
              {star(340, 330, 13, LEAF, 'twinkle twinkle--2')}
              {star(330, 110, 9, GOLD, 'twinkle twinkle--3')}
            </g>
          )}
          {condition === 'good' && (
            <g key="good" transform="translate(330 330)"><g className="stage__badge">
              <circle r="26" fill={LEAF} />
              <path d="m-11 1 7 7 15-15" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g></g>
          )}
          {condition === 'dead' && (
            <text key="dead" className="stage__zz" x={phone ? 300 : 360} y={phone ? 120 : 190} fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="30" fill="#8a968f">
              z<tspan dy="-14" fontSize="22">z</tspan><tspan dy="-12" fontSize="16">z</tspan>
            </text>
          )}
        </g>
      )}

      {done && (
        <g className="stage__finale">
          <g className="stage__drop">
            <g transform={phone ? 'translate(180 40) rotate(14) scale(.55)' : 'translate(130 90) rotate(10) scale(.6)'}>
              {phone ? <PhoneG condition={condition} /> : <LaptopG condition={condition} />}
            </g>
          </g>
          <Bin />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} className="stage__coin" style={{ '--i': i, '--x': `${[-70, -30, 10, 50, 86][i]}px` }}>
              <circle cx="220" cy="250" r="17" fill={GOLD} />
              <circle cx="220" cy="250" r="11" fill="none" stroke="#fff" strokeWidth="2.5" />
              <text x="220" y="256" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="15" fill="#fff">₹</text>
            </g>
          ))}
          {star(90, 250, 14, GOLD, 'twinkle')}
          {star(360, 220, 12, LEAF, 'twinkle twinkle--2')}
        </g>
      )}
    </svg>
  )
}

/* ---------- pickup scenes: locating → shuffling → matched ---------- */
const SKIN = '#f0c4a0'
const SKIN_DARK = '#d9a27c'
const HAIR = '#2b2320'
const KRAFT = '#d9a066'
const GLASS = '#cfeff0'

/* Electric pickup van, 204 × 128, facing right; wheels sit on y = 128. */
function Van() {
  return (
    <g>
      <ellipse cx="102" cy="128" rx="100" ry="6" fill="#000" opacity=".08" />
      {/* cargo box + cab */}
      <path d="M4 18A16 16 0 0 1 20 2h112a8 8 0 0 1 8 8v18h22c6 0 11 3 14 8l20 32c2 3 3 7 3 11v25H4Z" fill="#fff" stroke="#d5ecc8" strokeWidth="2.5" />
      <path d="M144 34h16c4 0 7 2 9 5l16 26h-41Z" fill={GLASS} />
      <path d="M152 38l-6 20" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M140 30v74" stroke="#d5ecc8" strokeWidth="2.5" />
      <rect x="146" y="72" width="12" height="4" rx="2" fill="#b8c4bd" />
      {/* livery */}
      <path d="M4 82h199v14H4Z" fill={GREEN} />
      <path d="M4 76h199v5H4Z" fill={LEAF} />
      <text x="99" y="93" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="10" letterSpacing="2" fill="#fff">ECOBIN</text>
      <circle cx="72" cy="42" r="24" fill={SOFT_GREEN} />
      <path d="M62 36a12 12 0 0 1 21-3M82 48a12 12 0 0 1-21 3M84 26v8h-8M60 58v-8h8" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="m112 22-7 13h7l-3 11 10-15h-7l3-9Z" fill={GOLD} />
      {/* front details */}
      <circle cx="198" cy="84" r="4.5" fill={GOLD} />
      <rect x="0" y="100" width="206" height="10" rx="5" fill="#3e4c44" />
      {/* wheel arches + wheels */}
      <path d="M22 104a22 22 0 0 1 44 0Z M132 104a22 22 0 0 1 44 0Z" fill="#dfe7e1" />
      {[44, 154].map((x) => (
        <g key={x} className="van__wheel" style={{ transformOrigin: `${x}px 110px` }}>
          <circle cx={x} cy="110" r="18" fill={INK} />
          <circle cx={x} cy="110" r="8" fill="#cfd8d1" />
          <path d={`M${x} 103v14M${x - 7} 110h14`} stroke="#8a968f" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

/* The pickup executive, feet at 0,0, walking left with a recycling box. */
function Executive() {
  return (
    <g>
      <ellipse cy="2" rx="20" ry="4" fill="#000" opacity=".08" />
      <g className="walk-leg"><rect x="-9" y="-36" width="8" height="36" rx="4" fill="#26322b" /><ellipse cx="-7" cy="-1" rx="7" ry="3.5" fill={INK} /></g>
      <g className="walk-leg walk-leg--2"><rect x="2" y="-36" width="8" height="36" rx="4" fill="#26322b" /><ellipse cx="4" cy="-1" rx="7" ry="3.5" fill={INK} /></g>
      <rect x="-15" y="-76" width="30" height="44" rx="11" fill={GREEN} />
      <path d="M-2-76 0-62 2-76" stroke="#fff" strokeWidth="2" fill="none" />
      <rect x="-6" y="-80" width="12" height="8" rx="3" fill={SKIN_DARK} />
      <circle cy="-92" r="14" fill={SKIN} />
      <circle cx="-6" cy="-92" r="1.8" fill={INK} />
      <path d="M-10-86c3 3 7 3 9 1" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M-14-95a14 14 0 0 1 28 0Z" fill="#147a41" />
      <rect x="-26" y="-98" width="16" height="5" rx="2.5" fill="#147a41" />
      {/* box held out in front */}
      <rect x="-40" y="-70" width="30" height="26" rx="4" fill={KRAFT} />
      <path d="M-40-62h30" stroke="#b98348" strokeWidth="2" />
      <path d="M-30-52a5 5 0 0 1 9-1M-20-48a5 5 0 0 1-9 1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M-12-70c-6 4-10 10-14 16" stroke={GREEN} strokeWidth="9" strokeLinecap="round" />
      <circle cx="-27" cy="-54" r="5" fill={SKIN} />
    </g>
  )
}

/* The customer at the door, feet at 0,0, waving. */
function Customer() {
  return (
    <g>
      <rect x="-9" y="-34" width="8" height="34" rx="4" fill="#3b4a6b" />
      <rect x="2" y="-34" width="8" height="34" rx="4" fill="#3b4a6b" />
      <path d="M-15-40c0-20 6-34 15-34s15 14 15 34v6h-30Z" fill={TEAL_SHIRT} />
      <circle cy="-88" r="13" fill={SKIN} />
      <path d="M-14-88c-2-14 8-20 16-19 9 1 14 8 12 18-6-6-12-8-18-8-4 0-8 3-10 9Z" fill={HAIR} />
      <circle cx="12" cy="-100" r="6" fill={HAIR} />
      <circle cx="4" cy="-89" r="1.8" fill={INK} />
      <path d="M1-83c3 2 6 2 8 0" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <g className="wave-arm">
        <path d="M12-66c8-6 12-16 14-26" stroke={TEAL_SHIRT} strokeWidth="8" strokeLinecap="round" />
        <circle cx="26" cy="-94" r="5" fill={SKIN} />
      </g>
    </g>
  )
}

/* A two-storey home with a balcony, 160 × 210; ground at y = 210. */
function Home() {
  return (
    <g>
      <rect x="10" y="20" width="140" height="190" fill="#fbfaf6" />
      <rect x="120" y="20" width="30" height="190" fill="#eef1e8" />
      <rect x="0" y="8" width="160" height="16" rx="5" fill="#147a41" />
      <rect x="6" y="0" width="148" height="10" rx="4" fill={GREEN} />
      {/* upper windows with awnings */}
      {[26, 90].map((x) => (
        <g key={x}>
          <path d={`M${x - 4} 38h44l-6 10h-32Z`} fill={LEAF} />
          <rect x={x} y="48" width="36" height="32" rx="3" fill={GLASS} stroke="#fff" strokeWidth="3" />
          <path d={`M${x + 18} 48v32M${x} 64h36`} stroke="#fff" strokeWidth="2.5" />
        </g>
      ))}
      {/* balcony */}
      <rect x="14" y="96" width="132" height="6" rx="3" fill="#147a41" />
      <path d="M20 102v22M36 102v22M52 102v22M68 102v22M84 102v22M100 102v22M116 102v22M132 102v22" stroke="#147a41" strokeWidth="2.5" />
      <rect x="14" y="122" width="132" height="5" rx="2.5" fill="#147a41" />
      {[[26, GOLD], [128, '#ef8354']].map(([x, c]) => (
        <g key={x}>
          <path d={`M${x - 7} 86h14l-2 10h-10Z`} fill={c} />
          <path d={`M${x} 86c-8-6-8-14-2-18 2 6 4 10 2 18Zm0 0c8-6 10-12 6-16-4 4-6 8-6 16Z`} fill={LEAF} />
        </g>
      ))}
      {/* ground floor */}
      <rect x="22" y="148" width="30" height="30" rx="3" fill={GLASS} stroke="#fff" strokeWidth="3" />
      <rect x="62" y="140" width="40" height="70" rx="5" fill={GOLD} />
      <rect x="68" y="148" width="28" height="24" rx="3" fill="#e0a41f" />
      <rect x="68" y="178" width="28" height="24" rx="3" fill="#e0a41f" />
      <circle cx="96" cy="176" r="2.5" fill={INK} />
      <rect x="108" y="150" width="14" height="10" rx="2" fill="#fff" stroke="#d5ecc8" />
      <text x="115" y="158" textAnchor="middle" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="7" fill={GREEN}>21</text>
      <rect x="54" y="206" width="56" height="6" rx="2" fill="#dfe7e1" />
    </g>
  )
}

function Cloud({ x, y, s = 1, cls }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}><g className={cls}>
      <path d="M0 20a14 14 0 0 1 14-14 18 18 0 0 1 32-2 13 13 0 0 1 20 12 10 10 0 0 1-2 20H8A10 10 0 0 1 0 20Z" fill="#fff" />
    </g></g>
  )
}

export function PickupStage({ phase, name }) {
  return (
    <svg className="story-stage" viewBox="0 0 440 470" aria-hidden="true">
      <path d="M70 140c30-80 150-120 250-90s120 110 110 190-50 170-160 180S40 360 40 260c0-50 12-80 30-120Z" fill="#e2f4d8" />
      <ellipse cx="220" cy="440" rx="200" ry="14" fill={MINT} />

      {phase === 'locating' && (
        <g key="locating" className="stage__pop">
          <rect x="70" y="110" width="300" height="250" rx="28" fill="#f9fbf5" stroke={MINT} strokeWidth="3" />
          <path d="M70 250c80-10 150 20 300-30M200 110c-10 80 30 150 10 250M90 150c60 30 100 60 110 110" stroke="#fff" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="300" cy="170" r="22" fill={MINT} /><circle cx="120" cy="320" r="18" fill="#bfe9e3" />
          {[0, 1, 2].map((i) => <circle key={i} cx="220" cy="236" r="30" className="radar-ring" style={{ '--i': i }} />)}
          <g transform="translate(220 236)">
            <path d="M0 0s-26-23-26-44a26 26 0 0 1 52 0C26-23 0 0 0 0Z" fill={GREEN} />
            <circle cy="-44" r="10" fill="#fff" />
          </g>
        </g>
      )}

      {phase === 'spinning' && (
        <g key="spinning">
          <g className="road-dash"><path d="M-40 434h520" stroke="#fff" strokeWidth="5" strokeDasharray="30 22" strokeLinecap="round" /></g>
          <g transform="translate(118 304)"><g className="van--bounce"><Van /></g></g>
          <g stroke={MINT} strokeWidth="6" strokeLinecap="round" className="speed-lines">
            <path d="M40 336h56M24 366h64M52 396h40" />
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${120 + i * 100} 170)`}><g className="stage__question" style={{ '--i': i }}>
              <circle r="24" fill="#fff" stroke={GREEN} strokeWidth="3" />
              <text y="9" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="26" fill={GREEN}>?</text>
            </g></g>
          ))}
        </g>
      )}

      {phase === 'matched' && (
        <g key="matched">
          {/* sky */}
          <g transform="translate(78 92)">
            <g className="sun-rays" stroke={GOLD} strokeWidth="4" strokeLinecap="round">
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i * Math.PI) / 4
                return <path key={i} d={`M${Math.cos(a) * 30} ${Math.sin(a) * 30}L${Math.cos(a) * 40} ${Math.sin(a) * 40}`} />
              })}
            </g>
            <circle r="21" fill={GOLD} />
          </g>
          <Cloud x={250} y={70} s={1} cls="cloud" />
          <Cloud x={150} y={128} s={0.7} cls="cloud cloud--2" />

          {/* road */}
          <path d="M200 436h240" stroke="#fff" strokeWidth="4" strokeDasharray="22 16" strokeLinecap="round" />

          {/* home + customer */}
          <g transform="translate(22 226)"><Home /></g>
          <g transform="translate(100 436)"><g className="stage__pop"><Customer /></g></g>

          {/* bushes by the house */}
          <g transform="translate(18 436)">
            <circle cx="0" cy="-12" r="14" fill={LEAF} /><circle cx="16" cy="-8" r="10" fill={GREEN} />
          </g>
          <g transform="translate(176 436)">
            <circle cx="0" cy="-10" r="12" fill="#5cbf45" /><circle cx="-12" cy="-6" r="8" fill={LEAF} />
          </g>

          {/* van pulls up, then the executive walks to the door */}
          <g transform="translate(222 308)"><g className="van--arrive"><Van /></g></g>
          <g transform="translate(196 436)"><g className="walk-in"><Executive /></g></g>

          {name && (
            <g transform="translate(190 206)"><g className="stage__tag">
              <path d="M16 0h206a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14H80l-12 12-4-12H16A14 14 0 0 1 2 40V14A14 14 0 0 1 16 0Z" fill="#fff" stroke={GREEN} strokeWidth="2.5" />
              <circle cx="26" cy="27" r="12" fill={GREEN} />
              <path d="m20 27 4 4 8-8" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x="46" y="24" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize={name.length > 20 ? 12.5 : 14.5} fill={INK}>{name}</text>
              <text x="46" y="41" fontFamily="Quicksand, sans-serif" fontWeight="600" fontSize="11" fill="#56615a">Pickup tomorrow · 10 AM</text>
            </g></g>
          )}
          {star(196, 170, 11, LEAF, 'twinkle twinkle--2')}
          {star(420, 330, 9, GOLD, 'twinkle')}
        </g>
      )}
    </svg>
  )
}
