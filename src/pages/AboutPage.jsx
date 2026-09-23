import { useEffect } from 'react'
import { Link } from '../router.jsx'
import Footer from '../components/Footer.jsx'
import './AboutPage.css'

const OFFERS = [
  {
    step: '01',
    title: 'Device Identification',
    desc: 'Upload a photo of an electronic device and CIRQL helps identify what it is.',
    tag: 'AI Computer Vision',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Value & Material Estimation',
    desc: 'CIRQL uses device information and material data to provide an estimated recyclable value.',
    tag: 'Transparent Pricing',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Verified Recycling Network',
    desc: 'Connect with recycling partners and appropriate e-waste collection channels.',
    tag: 'CPCB / SPCB Authorized',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Pickup Scheduling',
    desc: 'Schedule a convenient pickup for your electronic waste.',
    tag: 'Doorstep Collection',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Rewards & EcoPoints',
    desc: 'Users can earn rewards for responsible recycling and referrals.',
    tag: 'Instant UPI & Perks',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    step: '06',
    title: 'Impact Tracking',
    desc: 'Track your recycling activity and contribution toward responsible e-waste management.',
    tag: 'Verified Metrics',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
]

const JOURNEY = [
  {
    phase: 'Discovery',
    title: 'From Dusty Drawer to Smart Assessment',
    description:
      'Most electronic waste never reaches recyclers because people are unsure what their devices are worth or where to take them. CIRQL eliminates that friction by letting you snap a single photo from home to immediately identify the device model, specification, and baseline condition.',
  },
  {
    phase: 'Valuation',
    title: 'Transparent Material Science & Value',
    description:
      'Electronic devices contain critical rare minerals like gold, copper, palladium, and lithium. CIRQL calculates a fair estimated value based on actual recoverable materials and market commodity prices so you get rewarded fairly before arranging handover.',
  },
  {
    phase: 'Fulfillment',
    title: 'Certified Doorstep Logistics',
    description:
      'No trips across town to informal scrap dealers. Choose a convenient date and time window. Our verified logistics partner arrives at your address, checks the device, and provides digital receipt confirmation on the spot.',
  },
  {
    phase: 'Circular Impact',
    title: 'Zero Landfill & Responsible Regeneration',
    description:
      'Collected e-waste is transferred directly to authorized CPCB/SPCB recycling plants. Up to 98% of components and raw metals are harvested to re-enter industrial supply chains, drastically reducing fresh mining and toxic environmental damage.',
  },
]

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us · CIRQL · Smart E-Waste Management'
    window.scrollTo(0, 0)
    return () => {
      document.title = 'Cirql · Sell & Recycle Your Old Electronics'
    }
  }, [])

  return (
    <div className="about-page">
      {/* ---------- HERO SECTION ---------- */}
      <section className="about-hero">
        <div className="about-wrap">
          <Link to="/" className="about-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <div className="about-hero__header">
            <span className="about-kicker">About CIRQL</span>
            <h1 className="about-h1">
              <span>Smart E-Waste</span>
              <span>Management Platform</span>
            </h1>

            <div className="about-hero__overview">
              <p className="about-overview__lead">
                <strong>CIRQL is a smart e-waste management platform</strong> that makes recycling old electronics simple, transparent, and rewarding.
              </p>
              <p className="about-overview__body">
                Instead of letting unused phones, laptops, and other electronic devices sit at home or end up in improper disposal channels, CIRQL helps users identify their devices, understand their potential recyclable value, find suitable recycling partners, and arrange pickups.
              </p>
            </div>

            <div className="about-hero__actions">
              <Link to="/sell" className="btn btn--primary">
                Check Your Device Value
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#offers" className="btn btn--ghost">
                What CIRQL Offers
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHAT CIRQL OFFERS ---------- */}
      <section className="about-offers" id="offers">
        <div className="about-wrap">
          <div className="about-section-heading">
            <span className="about-kicker">Platform Features</span>
            <h2 className="about-h2">
              <span>What CIRQL</span> <span>Offers</span>
            </h2>
            <p className="about-lead">
              A comprehensive platform designed to streamline every step from initial identification to certified recycling and immediate rewards.
            </p>
          </div>

          <div className="about-offers__grid">
            {OFFERS.map((item) => (
              <div key={item.step} className="about-offer-card">
                <div className="about-offer-card__header">
                  <span className="about-offer-card__step">{item.step}</span>
                  <div className="about-offer-card__icon">{item.icon}</div>
                </div>
                <h3 className="about-offer-card__title">{item.title}</h3>
                <p className="about-offer-card__desc">{item.desc}</p>
                <div className="about-offer-card__footer">
                  <span className="about-offer-card__tag">{item.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- THE USER STORY & JOURNEY ---------- */}
      <section className="about-journey">
        <div className="about-wrap">
          <div className="about-section-heading">
            <span className="about-kicker">The Experience</span>
            <h2 className="about-h2">
              <span>The CIRQL Journey</span> <span>How It Works For You</span>
            </h2>
            <p className="about-lead">
              How CIRQL guides you from a forgotten device to a transparent payout and verified environmental recovery.
            </p>
          </div>

          <div className="about-journey__timeline">
            {JOURNEY.map((step, idx) => (
              <div key={idx} className="about-journey__item">
                <div className="about-journey__marker">
                  <span className="about-journey__dot" />
                  {idx < JOURNEY.length - 1 && <span className="about-journey__line" />}
                </div>
                <div className="about-journey__content">
                  <span className="about-journey__phase">{step.phase}</span>
                  <h3 className="about-journey__title">{step.title}</h3>
                  <p className="about-journey__description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MISSION & VALUES ---------- */}
      <section className="about-values">
        <div className="about-wrap">
          <div className="about-values__card">
            <div className="about-values__text">
              <span className="about-kicker" style={{ color: '#6fcf4e' }}>Environmental Commitment</span>
              <h2 className="about-values__heading">
                Responsible E-Waste Recycling For a Cleaner Tomorrow
              </h2>
              <p>
                India produces over 3.2 million metric tonnes of electronic waste annually, with less than 10% channeled into formal, scientifically safe recycling. CIRQL bridges this gap by creating accessible, transparent digital infrastructure for individuals and businesses alike.
              </p>
            </div>
            <div className="about-values__stats">
              <div className="about-val-stat">
                <span className="about-val-stat__num">100%</span>
                <span className="about-val-stat__label">Authorised CPCB / SPCB Partners</span>
              </div>
              <div className="about-val-stat">
                <span className="about-val-stat__num">0%</span>
                <span className="about-val-stat__label">Informal Backyard Scrap Burning</span>
              </div>
              <div className="about-val-stat">
                <span className="about-val-stat__num">Direct</span>
                <span className="about-val-stat__label">Doorstep Pickup Scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CALL TO ACTION ---------- */}
      <section className="about-cta-section">
        <div className="about-wrap">
          <div className="about-cta-card">
            <h2>Ready to recycle your old electronics?</h2>
            <p>
              Upload a photo to identify your gadget, check its estimated recyclable value, and schedule a free doorstep pickup today.
            </p>
            <div className="about-cta-card__actions">
              <Link to="/sell" className="btn btn--primary">
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/" className="btn btn--ghost">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
