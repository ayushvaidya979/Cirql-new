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
        <img src="/logo.png" alt="CIRQL" className="logo__img" />
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
