const professionals = [
  {
    name: 'David Wilson',
    role: 'Master Electrician',
    exp: '12 yrs exp',
    rating: '4.9',
    reviews: 312,
    color: '#2b6cb0',
    initials: 'DW',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Interior Architect',
    exp: '8 yrs exp',
    rating: '4.8',
    reviews: 214,
    color: '#805ad5',
    initials: 'SJ',
  },
  {
    name: 'Michael Reed',
    role: 'Emergency Plumber',
    exp: '15 yrs exp',
    rating: '4.9',
    reviews: 489,
    color: '#2b6cb0',
    initials: 'MR',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Science Tutor',
    exp: '6 yrs exp',
    rating: '5.0',
    reviews: 127,
    color: '#38a169',
    initials: 'ER',
  },
]

export default function TopProfessionals() {
  return (
    <section className="professionals section" id="professionals">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Top Rated Architects of Service</span>
          <h2 className="section-title">Meet the elite, vetted<br />professionals near you.</h2>
        </div>

        <div className="pros-grid">
          {professionals.map(pro => (
            <div key={pro.name} className="pro-card">
              {/* Avatar */}
              <div className="pro-card__avatar" style={{'--pro-color': pro.color}}>
                <span>{pro.initials}</span>
                <div className="pro-card__verified">
                  <span className="material-icons">verified</span>
                </div>
              </div>

              <div className="pro-card__info">
                <h3 className="pro-card__name">{pro.name}</h3>
                <p className="pro-card__role">{pro.role} &middot; {pro.exp}</p>
                <div className="pro-card__rating">
                  <span className="material-icons pro-card__star">star</span>
                  <strong>{pro.rating}</strong>
                  <span className="pro-card__reviews">({pro.reviews} reviews)</span>
                </div>
              </div>

              <div className="pro-card__actions">
                <button className="btn btn--primary pro-card__book">Book Now</button>
                <button className="btn btn--ghost pro-card__chat">
                  <span className="material-icons" style={{fontSize:'1.1rem'}}>chat_bubble_outline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
