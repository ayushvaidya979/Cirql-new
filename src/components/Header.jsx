import { useState } from 'react'
import { Link } from '../router.jsx'
import './Header.css'

const LINKS = [
  ['Features', '/#features'],
  ['How it works', '/#how-it-works'],
  ['How we work', '/#how-we-work'],
  ['Dashboard', '/#dashboard'],
  ['Partners', '/#partners'],
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className={`header ${open ? 'is-open' : ''}`}>
      <Link className="logo" to="/" aria-label="EcoBin home">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M20 3C9 3 4 8.5 4 15c0 2 .6 3.8 1.5 5 1-5 4.5-9 9.5-11-4 3-6.6 6.6-7.6 11.3 1 .5 2.2.7 3.6.7C18 21 21 13 20 3Z" fill="#1e9e57" />
        </svg>
        EcoBin
      </Link>

      <nav className="nav" id="site-nav">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <Link className="btn btn--primary nav__cta" to="/sell" onClick={() => setOpen(false)}>
          Check value
        </Link>
      </nav>

      <button
        className="burger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}
