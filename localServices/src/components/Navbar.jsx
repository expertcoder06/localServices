import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <a href="#" className="navbar__logo">
          <span className="navbar__logo-icon">◈</span>
          <span>LOCAL<span className="navbar__logo-accent">SERVICES</span></span>
        </a>

        {/* Desktop Links */}
        <ul className="navbar__links">
          <li><a href="#services" className="navbar__link">Services</a></li>
          <li><a href="#how-it-works" className="navbar__link">How it Works</a></li>
          <li><a href="#pricing" className="navbar__link">Pricing</a></li>
          <li><a href="#professionals" className="navbar__link">For Professionals</a></li>
        </ul>

        {/* CTA */}
        <div className="navbar__actions">
          <Link to="/login" className="btn btn--ghost">Sign In</Link>
        </div>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span className={`navbar__bar${menuOpen ? ' open' : ''}`} />
          <span className={`navbar__bar${menuOpen ? ' open' : ''}`} />
          <span className={`navbar__bar${menuOpen ? ' open' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#professionals" onClick={() => setMenuOpen(false)}>For Professionals</a>

        </div>
      )}
    </nav>
  )
}
