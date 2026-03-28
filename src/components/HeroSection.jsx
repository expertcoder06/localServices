import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="hero" id="hero">
      {/* Background blobs */}
      <div className="hero__blob hero__blob--1" />
      <div className="hero__blob hero__blob--2" />

      <div className="hero__content">
        {/* Trust badge */}
        <div className="hero__badge">
          <span className="material-icons" style={{fontSize: '1rem'}}>verified</span>
          Every professional undergoes a 12-point background check
        </div>

        <h1 className="hero__headline">
          Find Trusted Local<br />
          <span className="hero__headline-accent">Professionals</span> Instantly
        </h1>

        <p className="hero__sub">
          Verified experts. Transparent pricing. Zero hassle.<br className="hero__br" />
          The digital architect of your home services.
        </p>

        {/* CTA Buttons */}
        <div className="hero__cta-buttons">
          <a href="#how-it-works" className="btn btn--ghost btn--lg">See Demo</a>
          <Link to="/signup" className="btn btn--primary btn--lg">Get Started</Link>
        </div>

        {/* Quick tags */}
        <div className="hero__tags">
          {['Plumbing', 'Electrical', 'Cleaning', 'AC Repair', 'Tutoring'].map(tag => (
            <a key={tag} href="#services" className="hero__tag">{tag}</a>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="hero__stats">
        {[
          { value: '50K+', label: 'Verified Professionals' },
          { value: '4.9★', label: 'Average Rating' },
          { value: '200K+', label: 'Bookings Completed' },
          { value: '98%', label: 'Satisfaction Rate' },
        ].map(s => (
          <div key={s.label} className="hero__stat">
            <span className="hero__stat-value">{s.value}</span>
            <span className="hero__stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
