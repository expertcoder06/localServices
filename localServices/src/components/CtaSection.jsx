export default function CtaSection() {
  return (
    <section className="cta-section section" id="cta">
      <div className="container">
        <div className="cta-section__card">
          {/* Decorative blobs */}
          <div className="cta-section__blob cta-section__blob--1" />
          <div className="cta-section__blob cta-section__blob--2" />

          <div className="cta-section__content">
            <span className="section-label" style={{color:'rgba(255,255,255,0.7)'}}>For Professionals</span>
            <h2 className="cta-section__title">
              Are you a professional<br />looking to grow?
            </h2>
            <p className="cta-section__desc">
              Join the network of the most elite local professionals. Get access to verified leads, simplified booking, and guaranteed payments.
            </p>
            <div className="cta-section__btns">
              <a href="#" className="btn btn--accent">Join as Professional</a>
              <a href="#" className="btn btn--ghost-light">Learn More</a>
            </div>
          </div>

          <div className="cta-section__stats">
            {[
              { value: '50K+', label: 'Active Pros' },
              { value: '₹2L+', label: 'Avg Monthly Earnings' },
              { value: '24h', label: 'First Lead Guarantee' },
            ].map(s => (
              <div key={s.label} className="cta-section__stat">
                <span className="cta-section__stat-value">{s.value}</span>
                <span className="cta-section__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
