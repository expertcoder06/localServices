import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link, useLocation } from 'react-router-dom'
import '../App.css'
import PostRequestFlow from '../components/PostRequestFlow'
import CustomerJobsFlow from '../components/CustomerJobsFlow'
import UserProfile from '../components/UserProfile'
import { supabase } from '../utils/supabaseClient'

// generateMockData removed in favor of real database fetching

export default function CustomerDashboard() {
  const navLocation = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState(navLocation.state?.searchQuery || '')
  const [minRating, setMinRating] = useState(0)
  const [minTrustScore, setMinTrustScore] = useState(0)
  const [maxRadius, setMaxRadius] = useState(1)

  // Sync search query when location state changes (e.g. chatbot navigation)
  useEffect(() => {
    if (navLocation.state?.searchQuery) {
      setSearchQuery(navLocation.state.searchQuery)
      setActiveTab('dashboard')
    }
  }, [navLocation.state?.searchQuery, navLocation.key])

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showPostRequest, setShowPostRequest] = useState(false)
  const [userName, setUserName] = useState('User')
  const [userInitials, setUserInitials] = useState('U')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: consumer } = await supabase.from('consumers').select('name').eq('id', user.id).maybeSingle()
        if (consumer && consumer.name) {
          setUserName(consumer.name)
          const nameParts = consumer.name.split(' ')
          const initials = nameParts.length > 1 
            ? nameParts[0][0] + nameParts[1][0] 
            : nameParts[0][0]
          setUserInitials(initials.toUpperCase())
        }
      }
    }
    fetchUser()
  }, [])

  const sidebarLinks = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'bookings', icon: 'event', label: 'My Bookings' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ]

  const services = [
    { icon: 'plumbing', name: 'Plumbing', color: '#2b6cb0' },
    { icon: 'bolt', name: 'Electrical', color: '#d69e2e' },
    { icon: 'cleaning_services', name: 'Cleaning', color: '#38a169' },
    { icon: 'ac_unit', name: 'AC Repair', color: '#319795' },
  ]

  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfessionals() {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('status', 'approved')
      if (error) {
        console.error('Error fetching professionals:', error)
      } else {
        const mapped = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          role: p.categories?.[0] || 'Service Provider',
          rating: p.rating || (4.0 + Math.random()),
          trustScore: p.trust_score || (7.0 + Math.random() * 3),
          reviews: Math.floor(Math.random() * 200) + 20,
          location: p.city ? `${p.city}, ${p.state}` : 'Nearby',
          initials: p.name ? p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??',
          color: ['#d69e2e', '#805ad5', '#38a169', '#319795', '#e53e3e'][Math.floor(Math.random() * 5)]
        }))
        setProfessionals(mapped)
      }
      setLoading(false)
    }
    fetchProfessionals()
  }, [])

  const allProfessionals = professionals

  const isFiltering = searchQuery || minRating > 0 || minTrustScore > 0 || maxRadius > 1

  const filteredProfessionals = allProfessionals.filter(pro => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = pro.name.toLowerCase().includes(query) ||
      pro.role.toLowerCase().includes(query) ||
      pro.location.toLowerCase().includes(query);
    const matchesRating = pro.rating >= minRating;
    const matchesTrust = pro.trustScore >= minTrustScore;
    const matchesRadius = pro.distance <= maxRadius;

    return matchesSearch && matchesRating && matchesTrust && matchesRadius;
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
          <button 
            className="btn btn--outline" 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center' }}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px', verticalAlign: 'middle' }}>logout</span> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab !== 'profile' && (
        <header className="dashboard-header" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
            <div>
              <h1 className="dashboard-title">Hello, {userName}</h1>
              <p className="dashboard-subtitle">
                <span style={{ color: '#dd6b20', marginRight: '6px' }}>🔥</span>
                {allProfessionals.length} helpers available nearby
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
              <div className="dashboard-avatar" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>{userInitials}</div>
            </div>
          </div>

          {/* Filtering Metrics */}
          {activeTab === 'dashboard' && (
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
              <div style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface-variant)', width: '110px' }}>Max Radius: {maxRadius}km</label>
                <input type="range" min="1" max="20" step="1" value={maxRadius} onChange={e => setMaxRadius(Number(e.target.value))} style={{ width: '120px', cursor: 'pointer' }} />
              </div>

              <button
                className="btn btn--ghost"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', height: 'fit-content', marginLeft: 'auto', border: '1px solid var(--outline)', opacity: isFiltering ? 1 : 0.5, pointerEvents: isFiltering ? 'auto' : 'none' }}
                onClick={() => { setSearchQuery(''); setMinRating(0); setMinTrustScore(0); setMaxRadius(1); }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </header>
        )}

        {/* Post a Request Button */}
        {activeTab !== 'profile' && (
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
        )}

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
                        {pro.location} &middot; {pro.distance} km away
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
                <button className="btn btn--outline" style={{ marginTop: '1rem' }} onClick={() => { setSearchQuery(''); setMinRating(0); setMinTrustScore(0); setMaxRadius(1); }}>Clear Filters</button>
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
                    { name: 'Support', msg: '"Welcome to Local Services!"', time: 'Just now' },
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
            <span className="material-icons" style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '1rem' }}>logout</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Confirm Logout</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn--ghost" style={{ flex: 1, padding: '0.8rem' }} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn--primary" style={{ flex: 1, padding: '0.8rem', background: '#e53e3e' }} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
