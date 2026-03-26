import { Link } from 'react-router-dom'

const footerLinks = {
  Company: ['About', 'Careers', 'Impact', 'Newsroom'],
  Support: ['Contact', 'FAQ', 'Safety', 'Trust & Security'],
  Legal: ['Terms', 'Privacy', 'Accessibility'],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <a href="#" className="navbar__logo footer__logo">
              <span className="navbar__logo-icon">◈</span>
              <span>LOCAL<span className="navbar__logo-accent">SERVICES</span></span>
            </a>
            <p className="footer__tagline">
              The premier gateway to local expertise. Building a community of trust through digital innovation and verified service excellence.
            </p>
            <div className="footer__socials">
              {['language', 'share'].map(icon => (
                <a key={icon} href="#" className="footer__social-btn" aria-label={icon}>
                  <span className="material-icons">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([col, links]) => (
            <div key={col} className="footer__col">
              <h4 className="footer__col-title">{col}</h4>
              <ul className="footer__col-links">
                {links.map(l => (
                  <li key={l}><a href="#" className="footer__link">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p>© 2024 LOCAL-SERVICES. The Digital Architect.</p>
            <p className="footer__bottom-sub">All rights reserved. Designed with precision.</p>
          </div>
          <div>
            <Link to="/admin" className="btn btn--outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>admin_panel_settings</span>
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
