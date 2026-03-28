const features = [
  { icon: 'gps_fixed', label: 'Real-time GPS Tracking' },
  { icon: 'chat', label: 'Instant Secure Messaging' },
  { icon: 'receipt_long', label: 'Digital Invoicing & Payments' },
  { icon: 'shield', label: 'End-to-end Insurance Coverage' },
]

export default function AppPromo() {
  return (
    <section className="app-promo section">
      <div className="container">
        <div className="app-promo__grid">
          {/* Phone mockup */}
          <div className="app-promo__phone-wrap">
            <div className="app-promo__phone">
              <div className="app-promo__phone-screen">
                <div className="app-promo__phone-header">
                  <span className="app-promo__phone-dot" />
                  <span className="app-promo__phone-bar" />
                </div>
                <div className="app-promo__phone-map">
                  <div className="app-promo__map-pin">
                    <span className="material-icons">location_on</span>
                  </div>
                  <div className="app-promo__route" />
                </div>
                <div className="app-promo__phone-card">
                  <div className="app-promo__phone-avatar">DW</div>
                  <div>
                    <p className="app-promo__phone-name">David Wilson</p>
                    <p className="app-promo__phone-eta">Arriving in 8 mins</p>
                  </div>
                  <div className="app-promo__phone-chat-icon">
                    <span className="material-icons" style={{color:'#dd6b20'}}>chat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="app-promo__content">
            <span className="section-label">Manage Everything from Your Pocket</span>
            <h2 className="section-title" style={{textAlign:'left'}}>
              Seamless from booking<br />to completion.
            </h2>
            <p className="app-promo__desc">
              Experience a seamless flow from booking to completion. Live tracking, instant chat, and secure payments all in one place.
            </p>

            <ul className="app-promo__features">
              {features.map(f => (
                <li key={f.label} className="app-promo__feature">
                  <span className="app-promo__feature-icon">
                    <span className="material-icons">{f.icon}</span>
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="app-promo__btns">
              <a 
                href="https://www.webtonative.com/checkout/69c5f5525711ecee5e3ea604?previewId=3UH9U" 
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download App
              </a>
              <a href="#" className="btn btn--ghost">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
