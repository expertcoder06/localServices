import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../App.css'
import PostRequestFlow from '../components/PostRequestFlow'
import CustomerJobsFlow from '../components/CustomerJobsFlow'
import UserProfile from '../components/UserProfile'

const generateMockData = () => {
  const roles = [
    { r: 'Expert Electrician', c: '#d69e2e' },
    { r: 'Academic Tutor (Math/Sci)', c: '#805ad5' },
    { r: 'Full Home Cleaning', c: '#38a169' },
    { r: 'AC Repair Expert', c: '#319795' },
    { r: 'Plumbing Service', c: '#e53e3e' },
    { r: 'Deep Cleaning', c: '#dd6b20' },
    { r: 'Yoga Instructor', c: '#3182ce' },
    { r: 'CCTV Installation', c: '#e53e3e' },
    { r: 'Event Catering', c: '#dd6b20' },
    { r: 'House Painting', c: '#3182ce' },
    { r: 'Carpentry', c: '#805ad5' },
    { r: 'Pest Control', c: '#38a169' },
    { r: 'Interior Architect', c: '#805ad5' },
    { r: 'Personal Trainer', c: '#e53e3e' },
    { r: 'Appliance Repair', c: '#2b6cb0' },
  ];
  const locations = ['Sector 21, Gurgaon', 'Cyber City, Gurgaon', 'Andheri West, Mumbai', 'Indiranagar, Bangalore', 'Bandra, Mumbai', 'Koramangala, Bangalore', 'Connaught Place, Delhi', 'Salt Lake, Kolkata', 'Vasant Kunj, Delhi', 'Bopal, Ahmedabad', 'Kochi, Kerala', 'Tech Park, Hyderabad', 'Anna Nagar, Chennai'];
  const firstNames = ['Vikram', 'Ananya', 'Rahul', 'David', 'Sarah', 'Elena', 'Manish', 'Ravi', 'Linda', 'Priya', 'Amit', 'Sunita', 'Nita', 'Tony', 'Rajesh', 'Neha', 'Karan', 'Sneha', 'Arjun', 'Meera', 'Rohan', 'Pooja', 'Suresh', 'Rita', 'Gaurav'];
  const lastNames = ['Singh', 'Sharma', 'Mehta', 'Wilson', 'Jenkins', 'Rodriguez', 'Patel', 'Kumar', 'Mathews', 'Kapoor', 'Jain', 'Krishnan', 'Gadhavi', 'Joseph', 'Gupta', 'Verma', 'Reddy', 'Nair', 'Iyer', 'Das', 'Sen', 'Bose', 'Chopra', 'Malhotra', 'Roy'];

  const items = [];
  // seeded PRNG for consistent results
  let seed = 123;
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 1; i <= 50; i++) {
    const fn = firstNames[Math.floor(rand() * firstNames.length)];
    const ln = lastNames[Math.floor(rand() * lastNames.length)];
    const roleObj = roles[Math.floor(rand() * roles.length)];
    const loc = locations[Math.floor(rand() * locations.length)];

    let rating = 1.0 + rand() * 4.0;
    rating = Math.round(rating * 10) / 10;

    let trustScore = 1.0 + rand() * 9.0;
    trustScore = Math.round(trustScore * 10) / 10;

    let reviews = Math.floor(rand() * 500) + 1;

    items.push({
      id: i,
      initials: fn.charAt(0) + ln.charAt(0),
      name: `${fn} ${ln}`,
      role: roleObj.r,
      rating,
      trustScore,
      reviews,
      location: loc,
      color: roleObj.c
    });
  }
  // Hardcode index 0 so that "Vikram Singh" on default dashboard matches perfectly
  items[0] = { id: 1, initials: 'VS', name: 'Vikram Singh', role: 'Expert Electrician', rating: 4.9, trustScore: 9.8, reviews: 342, location: 'Sector 21, Gurgaon', color: '#d69e2e' };

  // Hardcode a few very low ones specifically so they show up easily when testers search for 1-star
  items[1].rating = 1.2; items[1].trustScore = 2.1;
  items[2].rating = 2.5; items[2].trustScore = 4.3;
  items[3].rating = 3.1; items[3].trustScore = 5.0;

  return items;
}

export default function CustomerDashboard() {
  const navLocation = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState(navLocation.state?.searchQuery || '')
  const [minRating, setMinRating] = useState(0)
  const [minTrustScore, setMinTrustScore] = useState(0)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showPostRequest, setShowPostRequest] = useState(false)

  const sidebarLinks = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'bookings', icon: 'event', label: 'My Bookings' },
    { id: 'chats', icon: 'chat', label: 'Chats' },
    { id: 'favorites', icon: 'favorite', label: 'Favorites' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ]

  const services = [
    { icon: 'plumbing', name: 'Plumbing', color: '#2b6cb0' },
    { icon: 'bolt', name: 'Electrical', color: '#d69e2e' },
    { icon: 'cleaning_services', name: 'Cleaning', color: '#38a169' },
    { icon: 'ac_unit', name: 'AC Repair', color: '#319795' },
  ]

  const allProfessionals = useMemo(() => generateMockData(), [])

  const isFiltering = searchQuery || minRating > 0 || minTrustScore > 0

  const filteredProfessionals = allProfessionals.filter(pro => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = pro.name.toLowerCase().includes(query) ||
      pro.role.toLowerCase().includes(query) ||
      pro.location.toLowerCase().includes(query);
    const matchesRating = pro.rating >= minRating;
    const matchesTrust = pro.trustScore >= minTrustScore;

    return matchesSearch && matchesRating && matchesTrust;
  })

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="navbar__logo" style={{ marginBottom: '3rem' }}>
          <span className="navbar__logo-icon">◈</span>
          <span>LOCAL<span className="navbar__logo-accent">SERVICES</span></span>
        </div>

        <nav className="dashboard-nav">
          {sidebarLinks.map(link => (
            <button
              key={link.id}
              className={`dashboard-nav__btn ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => setActiveTab(link.id)}
            >
              <span className="material-icons">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar__bottom">
          <Link to="/" className="btn btn--outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>
            <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>logout</span> Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
            <div>
              <h1 className="dashboard-title">Good Morning, Alex</h1>
              <p className="dashboard-subtitle">
                <span style={{ color: '#dd6b20', marginRight: '6px' }}>🔥</span>
                23 helpers available nearby
              </p>
            </div>

            <div className="dashboard-header__actions">
              <div className="hero__search-inner" style={{ background: '#fff', border: '1px solid var(--outline-variant)', borderRadius: '24px', padding: '0.3rem 0.5rem' }}>
                <span className="material-icons" style={{ color: 'var(--outline)', paddingLeft: '8px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search services, pros, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '0.3rem', width: '250px' }}
                />
                {searchQuery && (
                  <span
                    className="material-icons"
                    style={{ color: 'var(--outline)', cursor: 'pointer', fontSize: '1.2rem', paddingRight: '4px' }}
                    onClick={() => setSearchQuery('')}
                  >
                    close
                  </span>
                )}
              </div>
              <div className="dashboard-avatar" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>AL</div>
            </div>
          </div>

          {/* Filtering Metrics */}
          <div className="dashboard-header__filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: '#fff', padding: '0.8rem 1.5rem', borderRadius: '100px', border: '1px solid var(--outline-variant)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface-variant)', width: '110px' }}>Min Rating: {minRating} <span className="material-icons" style={{ fontSize: '0.9rem', color: '#d69e2e', verticalAlign: 'middle' }}>star</span></label>
              <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(Number(e.target.value))} style={{ width: '120px', cursor: 'pointer' }} />
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface-variant)', width: '140px' }}>Min Trust Score: {minTrustScore}</label>
              <input type="range" min="0" max="10" step="0.5" value={minTrustScore} onChange={e => setMinTrustScore(Number(e.target.value))} style={{ width: '120px', cursor: 'pointer' }} />
            </div>

            {isFiltering && (
              <button
                className="btn btn--ghost"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', height: 'fit-content', marginLeft: 'auto', border: '1px solid var(--outline)' }}
                onClick={() => { setSearchQuery(''); setMinRating(0); setMinTrustScore(0); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </header>

        {/* Post a Request Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
          <button
            id="post-request-btn"
            onClick={() => setShowPostRequest(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #dd6b20, #e05c14)',
              color: 'white', border: 'none', borderRadius: '100px',
              padding: '0.55rem 1.4rem', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(221,107,32,0.4)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(221,107,32,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(221,107,32,0.4)' }}
          >
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>add_circle</span>
            Post a Request
          </button>
        </div>

        {/* Modal: Post Request */}
        {showPostRequest && <PostRequestFlow onClose={() => setShowPostRequest(false)} />}

        {/* Main View Area */}
        {activeTab === 'profile' ? (
          <UserProfile />
        ) : activeTab === 'bookings' ? (
          <div style={{ padding: '0 0.5rem', animation: 'fadeIn 0.3s' }}>
            <CustomerJobsFlow />
          </div>
        ) : isFiltering ? (
          /* Search Results View */
          <div className="dash-search-results">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>
                Found {filteredProfessionals.length} professional{filteredProfessionals.length !== 1 ? 's' : ''}
              </h2>
            </div>
            {filteredProfessionals.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredProfessionals.map(pro => (
                  <div key={pro.id} className="pro-card" style={{ textAlign: 'left', alignItems: 'flex-start', padding: '1.5rem', flexDirection: 'row', gap: '1rem' }}>
                    <div className="pro-card__avatar" style={{ '--pro-color': pro.color, width: '50px', height: '50px', fontSize: '0.9rem' }}>
                      {pro.initials}
                      {pro.trustScore >= 9.0 && (
                        <div className="pro-card__verified"><span className="material-icons">verified</span></div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{pro.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.2rem' }}>{pro.role}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--outline)', marginBottom: '0.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '2px' }}>location_on</span>
                        {pro.location}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div className="pro-card__rating" style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: 0, background: 'none' }}>
                          <span className="material-icons pro-card__star">star</span>
                          <strong>{pro.rating}</strong>
                          <span className="pro-card__reviews">({pro.reviews})</span>
                        </div>
                        <span style={{ color: 'var(--outline-variant)' }}>|</span>
                        <div className="pro-card__trust" style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'var(--secondary-container)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                          <span className="material-icons" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>shield</span>
                          Trust: {pro.trustScore}/10
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn--primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>Book</button>
                        <button className="btn btn--ghost" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                          <span className="material-icons" style={{ fontSize: '1rem' }}>chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)' }}>
                <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--outline-variant)', marginBottom: '1rem' }}>search_off</span>
                <p style={{ color: 'var(--on-surface-variant)' }}>No professionals found matching your filters.</p>
                <button className="btn btn--outline" style={{ marginTop: '1rem' }} onClick={() => { setSearchQuery(''); setMinRating(0); setMinTrustScore(0); }}>Clear Filters</button>
              </div>
            )}
          </div>
        ) : (
          /* Default Dashboard View */
          <div className="dashboard-grid">
            {/* Left Column */}
            <div className="dashboard-col-left">
              {/* Explore Services */}
              <section className="dash-section">
                <div className="dash-section__header">
                  <h2>Explore Services</h2>
                  <a href="#" style={{ color: 'var(--primary-container)', fontSize: '0.8rem', fontWeight: 600 }}>View All</a>
                </div>
                <div className="dash-services">
                  {services.map(s => (
                    <div key={s.name} className="dash-service-card" onClick={() => setSearchQuery(s.name)}>
                      <div className="dash-service-icon" style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)`, color: s.color }}>
                        <span className="material-icons">{s.icon}</span>
                      </div>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Match */}
              <section className="dash-section">
                <h2>Best Match for You</h2>
                <div className="pro-card" style={{ flexWrap: 'wrap', textAlign: 'left', alignItems: 'flex-start', padding: '1.5rem', flexDirection: 'row', gap: '1.5rem' }}>
                  <div className="pro-card__avatar" style={{ '--pro-color': '#d69e2e', width: '60px', height: '60px', fontSize: '1rem' }}>
                    VS
                    <div className="pro-card__verified"><span className="material-icons">verified</span></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Vikram Singh</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '0.2rem' }}>Expert Electrician &middot; 8 years exp.</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '0.5rem' }}>Sector 21, Gurgaon</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div className="pro-card__rating" style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: 0, background: 'none' }}>
                        <span className="material-icons pro-card__star">star</span>
                        <strong>4.9</strong>
                        <span className="pro-card__reviews">(342)</span>
                      </div>
                      <span style={{ color: 'var(--outline-variant)' }}>|</span>
                      <div className="pro-card__trust" style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'var(--secondary-container)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                        <span className="material-icons" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>shield</span>
                        Trust: 9.8/10
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn--primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Book Now</button>
                      <button className="btn btn--ghost" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Verified Nearby Professionals */}
              <section className="dash-section">
                <h2>Verified Nearby Professionals</h2>
                <div className="dash-nearby-list">
                  {allProfessionals.filter(p => p.rating > 4.5 && p.id !== 1).slice(0, 3).map(pro => (
                    <div key={pro.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                      <div className="pro-card__avatar" style={{ '--pro-color': pro.color, width: '40px', height: '40px', fontSize: '0.8rem' }}>
                        {pro.initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem' }}>{pro.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{pro.role}</p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                        <div className="pro-card__rating" style={{ fontSize: '0.7rem' }}>
                          <span className="material-icons pro-card__star" style={{ fontSize: '0.8rem' }}>star</span>
                          <strong>{pro.rating}</strong>
                        </div>
                        <button className="btn btn--outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="dashboard-col-right">
              {/* Rate Recent Service */}
              <section className="dash-section" style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Rate Recent Service</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="pro-card__avatar" style={{ '--pro-color': '#2b6cb0', width: '40px', height: '40px', fontSize: '0.8rem' }}>
                    DW
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>David Wilson</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Master Electrician &middot; Oct 12</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-icons"
                      style={{
                        color: (hoverRating || rating) >= star ? '#d69e2e' : 'var(--outline-variant)',
                        cursor: 'pointer',
                        fontSize: '1.8rem',
                        transition: 'color 0.2s',
                        lineHeight: 1
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hoverRating || rating) ? 'star' : 'star_border'}
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn--primary"
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                  disabled={rating === 0}
                  onClick={() => {
                    alert(`Thank you for rating David Wilson ${rating} stars!`);
                    setRating(0);
                  }}
                >
                  Submit Rating
                </button>
              </section>

              {/* Recent Messages */}
              <section className="dash-section">
                <h2>Recent Chats</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    { name: 'Meera (Fitness)', msg: '"See you tomorrow at 7 AM!"', time: '10m ago' },
                    { name: 'Karan (Plumbing)', msg: 'Offer: ₹450 for tap fixing', time: '2h ago' }
                  ].map(chat => (
                    <div key={chat.name} style={{ background: '#fff', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-container)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <strong style={{ fontSize: '0.85rem' }}>{chat.name}</strong>
                        <span style={{ fontSize: '0.65rem', color: 'var(--outline)' }}>{chat.time}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>{chat.msg}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing Insights */}
              <section className="dash-section" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', color: 'white', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="material-icons" style={{ color: '#f6ad55' }}>trending_up</span>
                  <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Pricing Insights</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
                  Average rates for <strong>Sector 21, Gurgaon</strong> this week. Based on 1,200+ bookings in your radius.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                    <span>Plumbing (Minor)</span>
                    <strong>₹350 - ₹500</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>AC Service</span>
                    <strong>₹599 - ₹799</strong>
                  </div>
                </div>
              </section>

              {/* Trusts */}
              <section className="dash-section" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { icon: 'verified_user', title: 'Verified Providers', desc: 'Rigorous background check & skills test.' },
                    { icon: 'security', title: 'Secure Payments', desc: 'Funds held safely until 100% satisfied.' },
                    { icon: 'headset_mic', title: '24/7 Support', desc: 'Dedicated concierge for your needs.' }
                  ].map(trust => (
                    <div key={trust.title} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                      <span className="material-icons" style={{ color: 'var(--primary-container)' }}>{trust.icon}</span>
                      <div>
                        <h5 style={{ fontSize: '0.85rem', marginBottom: '0.1rem' }}>{trust.title}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{trust.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
