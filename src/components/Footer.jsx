import { useSession } from '../lib/auth.js'
import { Link, navigate } from '../router.jsx'
import './Footer.css'

const PLATFORM_LINKS = [
  { label: 'Scan & Identify', to: '/sell', requiresAuth: true },
  { label: 'Recycle Electronics', to: '/sell', requiresAuth: true },
  { label: 'Schedule Pickup', to: '/sell', requiresAuth: true },
  { label: 'Rewards', to: '/#rewards', requiresAuth: false },
  { label: 'Track Pickup', to: '/sell', requiresAuth: true },
]

const COMPANY_LINKS = [
  { label: 'About CIRQL', to: '/', disabled: false },
  { label: 'How It Works', to: '/#how-it-works', disabled: false },
  { label: 'Contact Us', to: '/#contact', disabled: false },
  { label: 'FAQs', to: '/#features', disabled: false },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/', disabled: true },
  { label: 'Terms & Conditions', to: '/', disabled: true },
  { label: 'Refund & Cancellation Policy', to: '/', disabled: true },
  { label: 'E-Waste Policy', to: '/', disabled: true },
]

function SocialIcon({ type }) {
  const labels = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    x: 'X',
  }

  const paths = {
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
      </>
    ),
    linkedin: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <path d="M8 10.2v6.3M8 7.7v.1M11.1 16.5v-4.2c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3v4.2M11.1 10.2v6.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    x: (
      <>
        <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  }

  return (
    <span className="footer__social" aria-label={labels[type]} title={labels[type]}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
    </span>
  )
}

function handleNav(to, requiresAuth, session, e) {
  if (requiresAuth && !session) {
    e.preventDefault()
    navigate('/login')
    return
  }

  if (to.startsWith('/#')) {
    e.preventDefault()
    const id = to.slice(2)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
    }
    return
  }

  if (to === '/') {
    e.preventDefault()
    navigate('/')
    return
  }

  if (to.startsWith('/')) {
    e.preventDefault()
    navigate(to)
  }
}

function FooterLink({ item, session, className = '' }) {
  const content = (
    <span>{item.label}</span>
  )

  if (item.disabled) {
    return <span className={`footer__link footer__link--disabled ${className}`}>{content}</span>
  }

  return (
    <Link
      className={`footer__link ${className}`.trim()}
      to={item.to}
      onClick={(e) => handleNav(item.to, item.requiresAuth, session, e)}
      aria-disabled={item.disabled}
    >
      {content}
    </Link>
  )
}

export default function Footer() {
  const session = useSession()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a href="#" className="footer__logo" aria-label="CIRQL home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <img src="/logo.png" alt="CIRQL" className="footer__logo-img" />
          </a>
          <p>Give your old electronics a second life.</p>
          <p className="footer__subtext">Smarter recycling. Better impact.</p>

          <div className="footer__socials" aria-label="Social links">
            <span className="footer__social--static" aria-label="Instagram" title="Instagram">
              <SocialIcon type="instagram" />
            </span>
            <span className="footer__social--static" aria-label="LinkedIn" title="LinkedIn">
              <SocialIcon type="linkedin" />
            </span>
            <span className="footer__social--static" aria-label="X" title="X">
              <SocialIcon type="x" />
            </span>
          </div>
        </div>

        <div className="site-footer__column">
          <h3>Platform</h3>
          <nav className="site-footer__nav">
            {PLATFORM_LINKS.map((item) => (
              <FooterLink key={item.label} item={item} session={session} />
            ))}
          </nav>
        </div>

        <div className="site-footer__column">
          <h3>Company</h3>
          <nav className="site-footer__nav">
            {COMPANY_LINKS.map((item) => (
              <FooterLink key={item.label} item={item} session={session} />
            ))}
          </nav>
        </div>

        <div className="site-footer__column">
          <h3>Legal</h3>
          <nav className="site-footer__nav">
            {LEGAL_LINKS.map((item) => (
              <FooterLink key={item.label} item={item} session={session} />
            ))}
          </nav>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© 2026 CIRQL. All rights reserved.</span>
        <div className="site-footer__bottom-links">
          <FooterLink item={{ label: 'Privacy Policy', to: '/', disabled: true }} session={session} />
          <FooterLink item={{ label: 'Terms & Conditions', to: '/', disabled: true }} session={session} />
          <FooterLink item={{ label: 'Contact Us', to: '/#contact', disabled: false }} session={session} />
        </div>
      </div>
    </footer>
  )
}
