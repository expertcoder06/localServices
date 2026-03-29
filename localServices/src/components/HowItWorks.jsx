const steps = [
  {
    num: '01',
    icon: 'search',
    title: 'Search',
    desc: 'Browse verified pros by service, rating, or proximity to your location.',
  },
  {
    num: '02',
    icon: 'compare_arrows',
    title: 'Compare',
    desc: 'Review transparent pricing and real user testimonials before you decide.',
  },
  {
    num: '03',
    icon: 'calendar_month',
    title: 'Book',
    desc: 'Schedule your appointment with instant confirmation and zero waiting.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Three Steps to Success</span>
          <h2 className="section-title">Simplicity is the ultimate<br />sophistication.</h2>
          <p className="section-sub">Here&apos;s how we bridge the gap between you and expert help.</p>
        </div>

        <div className="steps">
          {steps.map((step, i) => (
            <div key={step.num} className="step-card">
              <div className="step-card__number">{step.num}</div>
              <div className="step-card__icon">
                <span className="material-icons">{step.icon}</span>
              </div>
              <h3 className="step-card__title">{step.title}</h3>
              <p className="step-card__desc">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="step-card__connector" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
