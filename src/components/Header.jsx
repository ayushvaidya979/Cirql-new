import { useState } from 'react'
import { Link } from '../router.jsx'
import { logOut, useSession } from '../lib/auth.js'
import './Header.css'

const LINKS = [
  ['Features', '/#features'],
  ['How it works', '/#how-it-works'],
  ['How we work', '/#how-we-work'],
  ['Rewards', '/#rewards'],
  ['Partners', '/#partners'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const session = useSession()

  return (
    <header className={`header ${open ? 'is-open' : ''}`}>
      <Link className="logo" to="/" aria-label="Cirql home">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M20 3C9 3 4 8.5 4 15c0 2 .6 3.8 1.5 5 1-5 4.5-9 9.5-11-4 3-6.6 6.6-7.6 11.3 1 .5 2.2.7 3.6.7C18 21 21 13 20 3Z" fill="#1e9e57" />
        </svg>
        Cirql
      </Link>

      <nav className="nav" id="site-nav">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        {session ? (
          <span className="nav__user">
            <span className="nav__avatar" aria-hidden="true">{(session.user.name || session.user.email)[0].toUpperCase()}</span>
            <span className="nav__name">{session.user.name.split(' ')[0] || session.user.email.split('@')[0]}</span>
            <button type="button" className="btn btn--ghost nav__btn" onClick={() => { setOpen(false); logOut() }}>Log out</button>
          </span>
        ) : (
          <span className="nav__auth">
            <Link className="btn btn--ghost nav__btn" to="/login" onClick={() => setOpen(false)}>Log in</Link>
            <Link className="btn btn--primary nav__btn" to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
          </span>
        )}
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
