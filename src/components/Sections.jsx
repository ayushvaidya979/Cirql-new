import {
  Icons, DotGrid, Sparkle, LeafTrail, Leaf,
  ScanIllustration, TruckIllustration,
  PersonDoodle, EwasteDoodle, FactoryDoodle, WalletDoodle,
} from './Doodles.jsx'
import { useEffect, useRef, useState } from 'react'
import { Link, navigate } from '../router.jsx'
import CameraScan from './CameraScan.jsx'
import { SCAN_HANDOFF_KEY } from '../lib/scanHandoff.js'
import './Sections.css'

/*
 * Every section watches its own [data-reveal] children, so a section that
 * remounts (hot reload, route change) always reveals again. The section also
 * gets .is-visible while on screen, which runs its looping doodle animations.
 */
export function Section({ children, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    const items = root.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'))
      root.classList.add('is-visible')
      return
    }
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            reveal.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    items.forEach((el) => reveal.observe(el))

    const visible = new IntersectionObserver(([e]) => root.classList.toggle('is-visible', e.isIntersecting))
    visible.observe(root)

    return () => {
      reveal.disconnect()
      visible.disconnect()
    }
  }, [])

  return (
    <section ref={ref} {...props}>
      {children}
    </section>
  )
}

/* Two-tone heading used by every section, matching the hero. */
function Heading({ a, b, sub, center = false, light = false }) {
  return (
    <div className={`heading ${center ? 'heading--center' : ''} ${light ? 'heading--light' : ''}`} data-reveal>
      <h2>
        <span className="heading__a">{a}</span> <span className="heading__b">{b}</span>
      </h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}

function CheckList({ items }) {
  return (
    <ul className="checks">
      {items.map(([title, text], i) => (
        <li key={title} data-reveal style={{ '--d': `${i * 80}ms` }}>
          <span className="checks__icon"><Icons.check /></span>
          <span>
            <strong>{title}</strong>
            {text}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ============================ 1. Features ============================ */
const FEATURES = [
  { icon: 'scan', tone: 'sage', title: 'AI device identification', text: 'Upload a photo and our AI recognises the device, from smartphones to laptops, with its details and e-waste category.' },
  { icon: 'layers', tone: 'leaf', title: 'Material breakdown', text: 'See the copper, aluminium, gold, silver and other recoverable materials estimated inside your device.' },
  { icon: 'value', tone: 'gold', title: 'Live value estimate', text: 'Current metal prices turn that breakdown into an approximate recyclable value for your device.' },
  { icon: 'pin', tone: 'teal', title: 'Recycler directory', text: 'Find authorised recyclers near you and get matched with the right one for your device.' },
  { icon: 'truck', tone: 'olive', title: 'Doorstep pickup', text: 'Choose a time slot and a verified recycler collects your e-waste right from your door.' },
  { icon: 'wallet', tone: 'gold', title: 'Cash & rewards', text: 'Get paid or earn rewards for eligible devices, with every transaction tracked.' },
  { icon: 'dashboard', tone: 'sage', title: 'Personal dashboard', text: 'Your recycling history, submitted devices and total earnings, all in one place.' },
  { icon: 'leaf', tone: 'leaf', title: 'Impact tracking', text: 'Watch your contribution grow as devices stay out of landfills and back in the circular economy.' },
]

export function Features() {
  return (
    <Section className="section section--cream" id="features">
      <DotGrid className="deco deco--tr" />
      <div className="container">
        <Heading
          center
          a="Everything your"
          b="e-waste needs"
          sub="From a single photo to cash in your account, Cirql handles every step of recycling your old electronics."
        />
        <div className="features">
          {FEATURES.map((f, i) => {
            const Icon = Icons[f.icon]
            return (
              <article className={`feature tone-${f.tone}`} key={f.title} data-reveal style={{ '--d': `${(i % 4) * 90}ms` }}>
                <span className="feature__icon"><Icon /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <span className="feature__line" />
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* ============================ 2. How it works ============================ */
const STEPS = [
  ['Upload a photo', 'Our AI identifies the device and its e-waste category.'],
  ['See what it’s worth', 'Get a material breakdown and value based on current prices.'],
  ['Match & schedule', 'We pair you with an authorised recycler nearby and book a pickup.'],
  ['Get rewarded', 'Receive your payment and track your impact on your dashboard.'],
]

export function HowItWorks() {
  const [scanning, setScanning] = useState(false)
  // Hand the result to the valuation page, which starts at the age question.
  const toPrice = (m) => {
    try {
      sessionStorage.setItem(SCAN_HANDOFF_KEY, JSON.stringify(m))
    } catch {
      /* private mode: the visitor just picks the device again */
    }
    setScanning(false)
    navigate('/sell')
  }
  return (
    <Section className="section section--tint section--cover" id="how-it-works">
      <LeafTrail className="deco deco--trail" data-fly="trail" />
      <div className="container split">
        <div className="split__art" data-fly="art">
          <ScanIllustration className="art" />
        </div>
        <div className="split__text">
          <Heading a="Simple," b="from start to finish" sub="Four easy steps turn the old gadget in your drawer into money, and into materials for something new." />
          <ol className="steps">
            {STEPS.map(([t, d], i) => (
              <li key={t} data-reveal style={{ '--d': `${i * 90}ms` }}>
                <span className="steps__num">{i + 1}</span>
                <span>
                  <strong>{t}</strong>
                  {d}
                </span>
              </li>
            ))}
          </ol>
          <div className="actions" data-reveal>
            <Link className="btn btn--primary" to="/sell">Select a device</Link>
            <button type="button" className="btn btn--ghost" onClick={() => setScanning(true)}>
              <Icons.scan width="18" height="18" /> Scan device
            </button>
          </div>
        </div>
      </div>
      <CameraScan open={scanning} onClose={() => setScanning(false)} onResult={toPrice} actionLabel="Get my price" />
    </Section>
  )
}

/* ============================ 6. Circular flow ============================ */
const FLOW = [
  { Art: PersonDoodle, title: 'You', text: 'Upload and book a pickup' },
  { Art: EwasteDoodle, title: 'E-waste', text: 'Identified, valued, collected' },
  { Art: FactoryDoodle, title: 'Recyclers', text: 'Recover materials responsibly' },
  { Art: WalletDoodle, title: 'Rewards', text: 'Value returned to you' },
]

export function Flow() {
  return (
    <Section className="section section--tint" id="impact">
      <Sparkle className="deco deco--spark2" />
      <div className="container">
        <Heading
          center
          a="Closing the loop"
          b="on e-waste"
          sub="Cirql connects people, devices and authorised recyclers, so old electronics become raw materials for new ones and real value for you."
        />
        <div className="flow">
          {FLOW.map(({ Art, title, text }, i) => (
            <div className="flow__node" key={title} data-reveal style={{ '--d': `${i * 120}ms` }}>
              <span className="flow__art"><Art /></span>
              <strong>{title}</strong>
              <em>{text}</em>
              {i < FLOW.length - 1 && (
                <svg className="flow__arrow" viewBox="0 0 80 24" aria-hidden="true">
                  <path d="M2 14c20-12 50-12 70-2" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
                  <path d="m66 6 7 6-9 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <div className="impact">
          {[
            ['layers', 'Recover precious materials', 'Gold, copper and aluminium go back into manufacturing instead of new mining.'],
            ['shield', 'Prevent toxic pollution', 'Lead, mercury and battery chemicals stay out of soil and groundwater.'],
            ['leaf', 'Build a circular economy', 'Every recycled device keeps valuable resources in use for longer.'],
          ].map(([ic, t, d], i) => {
            const Icon = Icons[ic]
            return (
              <div className="impact__item" key={t} data-reveal style={{ '--d': `${i * 90}ms` }}>
                <span className="impact__icon"><Icon /></span>
                <strong>{t}</strong>
                <p>{d}</p>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* ============================ 7. Partners ============================ */
const PARTNER = [
  ['inbox', 'Recycling requests', 'Receive and accept device requests from users nearby.'],
  ['calendar', 'Pickup management', 'Plan routes and manage every collection in one view.'],
  ['cog', 'Device processing', 'Log, grade and process devices as they come in.'],
  ['receipt', 'Transactions', 'Quotes, invoices and settlements, all tracked.'],
  ['send', 'Instant payouts', 'Transfer the recycling value to users in one tap.'],
]

export function Partners() {
  return (
    <Section className="section section--dark" id="partners">
      <DotGrid className="deco deco--tr" color="rgba(255,255,255,.18)" />
      <div className="container split">
        <div className="split__text">
          <Heading light a="For recyclers:" b="grow with Cirql" sub="A dedicated partner portal brings you a steady stream of sorted, pre-valued e-waste, and the tools to handle it." />
          <div className="partner-grid">
            {PARTNER.map(([ic, t, d], i) => {
              const Icon = Icons[ic]
              return (
                <div className="partner" key={t} data-reveal style={{ '--d': `${i * 70}ms` }}>
                  <span className="partner__icon"><Icon /></span>
                  <span>
                    <strong>{t}</strong>
                    {d}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="actions" data-reveal>
            <Link className="btn btn--light" to="/partner">Become a partner</Link>
          </div>
        </div>
        <div className="split__art" data-reveal>
          <TruckIllustration className="art truck" />
        </div>
      </div>
    </Section>
  )
}

/* ============================ 8. CTA + footer ============================ */
export function Closing() {
  return (
    <>
      <Section className="cta-wrap" id="contact">
        <div className="container">
          <div className="cta" data-reveal>
            <Leaf className="cta__leaf cta__leaf--1" color="rgba(255,255,255,.25)" vein="rgba(255,255,255,.4)" size={90} rotate={-20} />
            <Leaf className="cta__leaf cta__leaf--2" color="rgba(255,255,255,.18)" vein="rgba(255,255,255,.35)" size={60} rotate={40} />
            <div>
              <h2>Ready to turn e-waste into value?</h2>
              <p>Upload a photo of your old device and get an instant estimate.</p>
            </div>
            <Link className="btn btn--light" to="/sell">
              Get my estimate <Icons.arrow width="18" height="18" />
            </Link>
          </div>
        </div>
      </Section>
      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__brand">Cirql</span>
          <nav>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#how-we-work">How we work</a>
            <a href="#partners">Partners</a>
          </nav>
          <span className="footer__copy">© {new Date().getFullYear()} Cirql. Recycle responsibly.</span>
        </div>
      </footer>
    </>
  )
}
