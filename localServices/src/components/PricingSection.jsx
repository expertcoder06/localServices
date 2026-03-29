const plans = [
  {
    icon: 'cleaning_services',
    title: 'Cleaning',
    price: '₹499',
    period: '/session',
    color: '#38a169',
    features: ['2 Rooms Included', 'Eco-friendly supplies', 'Background checked pro'],
    popular: false,
  },
  {
    icon: 'bolt',
    title: 'Electrical Fix',
    price: '₹799',
    period: '/visit',
    color: '#dd6b20',
    features: ['Emergency dispatch', '1-Year Guarantee', 'Licensed professional'],
    popular: true,
  },
  {
    icon: 'ac_unit',
    title: 'AC Service',
    price: '₹649',
    period: '/unit',
    color: '#319795',
    features: ['Filter replacement', 'Performance diagnostic', '4.8+ Rated experts'],
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section className="pricing section" id="pricing">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Transparent Pricing</span>
          <h2 className="section-title">No hidden charges.<br />No surprises. Just value.</h2>
        </div>

        <div className="pricing__grid">
          {plans.map(plan => (
            <div key={plan.title} className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}`}>
              {plan.popular && (
                <div className="pricing-card__badge">Most Popular</div>
              )}
              <div className="pricing-card__icon" style={{'--plan-color': plan.color}}>
                <span className="material-icons">{plan.icon}</span>
              </div>
              <h3 className="pricing-card__title">{plan.title}</h3>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">{plan.price}</span>
                <span className="pricing-card__period">{plan.period}</span>
              </div>
              <ul className="pricing-card__features">
                {plan.features.map(f => (
                  <li key={f} className="pricing-card__feature">
                    <span className="material-icons pricing-card__check">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#" className={`btn ${plan.popular ? 'btn--primary' : 'btn--outline'} pricing-card__cta`}>
                Book Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
