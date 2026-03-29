const services = [
  {
    icon: 'plumbing',
    title: 'Plumbing',
    desc: 'Emergency leaks, installations, and maintenance by certified experts.',
    color: '#2b6cb0',
  },
  {
    icon: 'bolt',
    title: 'Electrical',
    desc: 'Rewiring, smart home setup, and safety inspections with peace of mind.',
    color: '#d69e2e',
  },
  {
    icon: 'cleaning_services',
    title: 'Cleaning',
    desc: 'Deep clean, sanitization, and regular upkeep by trained professionals.',
    color: '#38a169',
  },
  {
    icon: 'ac_unit',
    title: 'AC Repair',
    desc: 'Cooling systems optimization, servicing, and emergency repairs.',
    color: '#319795',
  },
  {
    icon: 'school',
    title: 'Tutoring',
    desc: 'K-12, SAT/ACT, Music — personalized sessions that actually work.',
    color: '#805ad5',
  },
]

export default function ServicesSection() {
  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Popular Services</span>
          <h2 className="section-title">Curated professionals for<br />every corner of your life.</h2>
          <a href="#" className="section-link">
            Browse All Services <span className="material-icons" style={{fontSize:'1rem', verticalAlign:'middle'}}>arrow_forward</span>
          </a>
        </div>

        <div className="services__grid">
          {services.map(s => (
            <a key={s.title} href="#" className="service-card">
              <div className="service-card__icon-wrap" style={{'--svc-color': s.color}}>
                <span className="material-icons">{s.icon}</span>
              </div>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
              <span className="service-card__cta">
                Explore <span className="material-icons" style={{fontSize:'0.9rem'}}>arrow_forward</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
