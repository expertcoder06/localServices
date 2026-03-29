import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link, useLocation } from 'react-router-dom'
import '../App.css'
import PostRequestFlow from '../components/PostRequestFlow'
import CustomerJobsFlow from '../components/CustomerJobsFlow'
import UserProfile from '../components/UserProfile'
import ProviderScheduleBar from '../components/ProviderScheduleBar'
import CurrentWork from '../components/CurrentWork'

// generateMockData removed in favor of real database fetching

export default function CustomerDashboard() {
  const navLocation = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState(navLocation.state?.searchQuery || '')
  const [minRating, setMinRating] = useState(0)
  const [minTrustScore, setMinTrustScore] = useState(0)
  const [maxRadius, setMaxRadius] = useState(1)

  // Availability filter state
  const DAYS_LIST = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const DAY_SHORT = { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun' }
  const [filterDay, setFilterDay] = useState('')
  const [filterTimeFrom, setFilterTimeFrom] = useState('')
  const [filterTimeTo, setFilterTimeTo] = useState('')
  const [showAvailFilter, setShowAvailFilter] = useState(false)

  // Sync tab and search query from location state
  useEffect(() => {
    if (navLocation.state?.activeTab) {
      setActiveTab(navLocation.state.activeTab)
    }
    if (navLocation.state?.searchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery(navLocation.state.searchQuery)
      if (!navLocation.state.activeTab) setActiveTab('dashboard')
    }
    if (navLocation.state?.showPostRequest) {
      setPostRequestInitialData(navLocation.state.initialData || null)
      setShowPostRequest(true)
    }
  }, [navLocation.state, navLocation.key])

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showPostRequest, setShowPostRequest] = useState(false)
  const [postRequestInitialData, setPostRequestInitialData] = useState(null)
  const [userName, setUserName] = useState('User')
  const [userInitials, setUserInitials] = useState('U')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [activeJob, setActiveJob] = useState(null)
  const [lastCompletedJob, setLastCompletedJob] = useState(null)

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
    
    async function fetchJobsData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Active Job
      const { data: active } = await supabase
        .from('jobs')
        .select('*, service_providers!accepted_provider_id(name, email, wallet_balance)')
        .eq('consumer_id', user.id)
        .in('status', ['accepted', 'in_progress', 'completed'])
        .maybeSingle()
      if (active) setActiveJob(active)

      // Last Completed Job for Rating
      const { data: last } = await supabase
        .from('jobs')
        .select('*, service_providers!accepted_provider_id(name)')
        .eq('consumer_id', user.id)
        .eq('status', 'finished')
        .order('actual_completion_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (last) setLastCompletedJob(last)
    }
    
    fetchJobsData()

    // Real-time listener for jobs
    const channel = supabase.channel('dashboard-jobs-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchJobsData)
      .subscribe()
      
    return () => supabase.removeChannel(channel)
  }, [])

  const sidebarLinks = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'currentWork', icon: 'engineering', label: 'Current Work' },
    { id: 'bookings', icon: 'event', label: 'My Bookings' },
    { id: 'schedule', icon: 'calendar_month', label: 'Schedule' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ]

  const services = [
    { icon: 'plumbing', name: 'Plumbing', color: '#2b6cb0' },
    { icon: 'bolt', name: 'Electrical', color: '#d69e2e' },
    { icon: 'cleaning_services', name: 'Cleaning', color: '#38a169' },
    { icon: 'ac_unit', name: 'AC Repair', color: '#319795' },
  ]

  const [professionals, setProfessionals] = useState([])

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
          color: ['#d69e2e', '#805ad5', '#38a169', '#319795', '#e53e3e'][Math.floor(Math.random() * 5)],
          availability_schedule: p.availability_schedule || []
        }))
        setProfessionals(mapped)
      }
    }
    fetchProfessionals()
  }, [])

  const allProfessionals = professionals

  const isFiltering = searchQuery || minRating > 0 || minTrustScore > 0 || maxRadius > 1 || filterDay || filterTimeFrom || filterTimeTo

  // Helper: check if provider is available at given day/time
  function isProviderAvailableAt(pro, day, from, to) {
    if (!pro.availability_schedule || !Array.isArray(pro.availability_schedule)) return false
    const ds = pro.availability_schedule.find(s => s.day === day)
    if (!ds || !ds.slots?.length) return false
    if (!from && !to) return true // just day match
    return ds.slots.some(slot => {
      const slotFrom = slot.from
      const slotTo = slot.to
      if (from && slotFrom > from) return false
      if (to && slotTo < to) return false
      return true
    })
  }

  const filteredProfessionals = allProfessionals.filter(pro => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = pro.name.toLowerCase().includes(query) ||
      pro.role.toLowerCase().includes(query) ||
      pro.location.toLowerCase().includes(query);
    const matchesRating = pro.rating >= minRating;
    const matchesTrust = pro.trustScore >= minTrustScore;
    const matchesRadius = pro.distance <= maxRadius;
    const matchesAvail = filterDay
      ? isProviderAvailableAt(pro, filterDay, filterTimeFrom, filterTimeTo)
      : true

    return matchesSearch && matchesRating && matchesTrust && matchesRadius && matchesAvail;
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

              {/* Availability Filter */}
              <div style={{ width: '1px', height: '24px', background: 'var(--outline-variant)' }}></div>
              <button
                onClick={() => setShowAvailFilter(!showAvailFilter)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: showAvailFilter || filterDay ? 'rgba(56,161,105,0.1)' : 'transparent',
                  border: `1px solid ${showAvailFilter || filterDay ? '#38a169' : 'var(--outline-variant)'}`,
                  color: showAvailFilter || filterDay ? '#38a169' : 'var(--on-surface-variant)',
                  borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', height: 'fit-content'
                }}
              >
                <span className="material-icons" style={{ fontSize: '0.9rem' }}>event_available</span>
                {filterDay ? `${filterDay.slice(0,3)} ${filterTimeFrom || ''}${filterTimeTo ? '-'+filterTimeTo : ''}` : 'Availability'}
              </button>

              <button
                className="btn btn--ghost"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', height: 'fit-content', marginLeft: 'auto', border: '1px solid var(--outline)', opacity: isFiltering ? 1 : 0.5, pointerEvents: isFiltering ? 'auto' : 'none' }}
                onClick={() => { setSearchQuery(''); setMinRating(0); setMinTrustScore(0); setMaxRadius(1); setFilterDay(''); setFilterTimeFrom(''); setFilterTimeTo(''); setShowAvailFilter(false) }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Availability filter expanded */}
          {activeTab === 'dashboard' && showAvailFilter && (
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(56,161,105,0.3)', padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <span className="material-icons" style={{ color: '#38a169', fontSize: '1.1rem' }}>event_available</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Filter by availability:</span>
              <select
                value={filterDay}
                onChange={e => setFilterDay(e.target.value)}
                style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.6rem', fontSize: '0.82rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">Any day</option>
                {DAYS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>From</span>
              <input type="time" value={filterTimeFrom} onChange={e => setFilterTimeFrom(e.target.value)}
                style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.82rem', outline: 'none' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>To</span>
              <input type="time" value={filterTimeTo} onChange={e => setFilterTimeTo(e.target.value)}
                style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.82rem', outline: 'none' }} />
              {(filterDay || filterTimeFrom || filterTimeTo) && (
                <button onClick={() => { setFilterDay(''); setFilterTimeFrom(''); setFilterTimeTo('') }}
                  style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                >Clear</button>
              )}
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
        {showPostRequest && (
          <PostRequestFlow 
            onClose={() => { setShowPostRequest(false); setPostRequestInitialData(null); }} 
            initialData={postRequestInitialData}
          />
        )}

        {/* Main View Area */}
        {activeTab === 'profile' ? (
          <UserProfile />
        ) : activeTab === 'currentWork' ? (
          <div style={{ padding: '0 0.5rem', animation: 'fadeIn 0.3s' }}>
            <CurrentWork type="customer" />
          </div>
        ) : activeTab === 'bookings' ? (
          <div style={{ padding: '0 0.5rem', animation: 'fadeIn 0.3s' }}>
            <CustomerJobsFlow onAcceptSuccess={() => setActiveTab('currentWork')} />
          </div>
        ) : activeTab === 'schedule' ? (
          <div style={{ padding: '0 0.5rem', animation: 'fadeIn 0.3s' }}>
            <ProviderScheduleAvailabilityTab
              filterDay={filterDay}
              filterTimeFrom={filterTimeFrom}
              filterTimeTo={filterTimeTo}
              setFilterDay={setFilterDay}
              setFilterTimeFrom={setFilterTimeFrom}
              setFilterTimeTo={setFilterTimeTo}
              showAvailFilter={showAvailFilter}
              setShowAvailFilter={setShowAvailFilter}
              DAYS_LIST={DAYS_LIST}
              DAY_SHORT={DAY_SHORT}
            />
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
                        <button 
                          className="btn btn--primary" 
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }} 
                          onClick={() => {
                            setPostRequestInitialData({ category: pro.role, provider_id: pro.id });
                            setShowPostRequest(true);
                          }}
                        >
                          Book
                        </button>
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
            <div className="dashboard-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Active Job Notification */}
              {activeJob && (
                <div 
                  onClick={() => setActiveTab('currentWork')}
                  style={{ 
                    background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)', color: 'white', padding: '1.2rem 1.5rem', 
                    borderRadius: 'var(--radius-xl)', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                   <div style={{ zIndex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.2rem' }}>Job in Progress</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{activeJob.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48bb78', animation: 'pulse 1.5s infinite' }} />
                         <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Status: {activeJob.status.replace('_', ' ')}</span>
                      </div>
                   </div>
                   <button className="btn btn--primary" style={{ background: '#fff', color: '#2b6cb0', fontWeight: 800, padding: '0.6rem 1.2rem', fontSize: '0.8rem', borderRadius: '100px' }}>
                      Track
                   </button>
                   <span className="material-icons" style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '8rem', color: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}>engineering</span>
                </div>
              )}
              {/* Explore Services */}
              <section className="dash-section">
                <div className="dash-section__header">
                  <h2>Explore Services</h2>
                  <a href="#" style={{ color: 'var(--primary-container)', fontSize: '0.8rem', fontWeight: 600 }}>View All</a>
                </div>
                <div className="dash-services">
                  {services.map(s => (
                    <div key={s.name} className="dash-service-card" onClick={() => { setSearchQuery(s.name); setActiveTab('dashboard'); }}>
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
                      <button 
                        className="btn btn--primary" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          setPostRequestInitialData({ category: 'Electrical', provider_id: 'vikram-singh-id' });
                          setShowPostRequest(true);
                        }}
                      >
                        Book Now
                      </button>
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
                        <button 
                          className="btn btn--outline" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={() => {
                            setPostRequestInitialData({ category: pro.role, provider_id: pro.id });
                            setShowPostRequest(true);
                          }}
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="dashboard-col-right">
              {/* Rate Recent Service */}
              {lastCompletedJob && (
                <section className="dash-section" style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Rate Recent Service</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="pro-card__avatar" style={{ '--pro-color': '#2b6cb0', width: '40px', height: '40px', fontSize: '0.8rem' }}>
                      {lastCompletedJob.service_providers?.name?.[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>{lastCompletedJob.service_providers?.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{lastCompletedJob.title} &middot; {new Date(lastCompletedJob.actual_completion_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
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
                    onClick={async () => {
                      // Update pro rating (simulated) or just clear
                      await supabase.from('jobs').update({ status: 'finished' }).eq('id', lastCompletedJob.id)
                      alert(`Thank you for rating ${lastCompletedJob.service_providers?.name} ${rating} stars!`);
                      setRating(0);
                      setLastCompletedJob(null);
                    }}
                  >
                    Submit Rating
                  </button>
                </section>
              )}

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

// ===========================================================================
// ProviderScheduleAvailabilityTab — schedule section in Customer Dashboard
// ===========================================================================
const DAYS_VIEW = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DAY_COLORS_VIEW = {
  Monday: '#3182ce', Tuesday: '#805ad5', Wednesday: '#38a169',
  Thursday: '#dd6b20', Friday: '#e53e3e', Saturday: '#319795', Sunday: '#d69e2e'
}
const DAY_SHORT_VIEW = { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun' }

function formatTime12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hh = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}

function getTodayDayName() {
  const d = new Date().getDay()
  return DAYS_VIEW[d === 0 ? 6 : d - 1]
}

function ProviderScheduleAvailabilityTab({
  filterDay, filterTimeFrom, filterTimeTo,
  setFilterDay, setFilterTimeFrom, setFilterTimeTo,
  DAYS_LIST, DAY_SHORT,
  showAvailFilter, setShowAvailFilter
}) {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const today = getTodayDayName()

  useEffect(() => {
    async function fetchSchedules() {
      const { data } = await supabase
        .from('service_providers')
        .select('id, name, categories, city, state, availability_schedule, status, rating, trust_score')
        .eq('status', 'approved')
        .not('availability_schedule', 'is', null)

      if (data) {
        const filtered = data.filter(p =>
          p.availability_schedule && Array.isArray(p.availability_schedule) && p.availability_schedule.length > 0
        )
        setProviders(filtered)
      }
      setLoading(false)
    }
    fetchSchedules()

    const channel = supabase
      .channel('schedule_tab_customer')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_providers' }, fetchSchedules)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // Apply filter
  const filtered = providers.filter(p => {
    if (!filterDay) return true
    const ds = p.availability_schedule?.find(s => s.day === filterDay)
    if (!ds || !ds.slots?.length) return false
    if (!filterTimeFrom && !filterTimeTo) return true
    return ds.slots.some(slot => {
      if (filterTimeFrom && slot.from > filterTimeFrom) return false
      if (filterTimeTo && slot.to < filterTimeTo) return false
      return true
    })
  })

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)', fontSize: '1.6rem' }}>calendar_month</span>
            Provider Availability
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
            Real-time schedules updated by providers ·{' '}
            <strong style={{ color: '#38a169' }}>Today: {today}</strong>
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <button
            onClick={() => setShowAvailFilter(!showAvailFilter)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: showAvailFilter || filterDay ? 'rgba(56,161,105,0.12)' : '#fff',
              border: `1px solid ${filterDay ? '#38a169' : 'var(--outline-variant)'}`,
              color: filterDay ? '#38a169' : 'var(--on-surface-variant)',
              borderRadius: 'var(--radius-md)', padding: '0.45rem 0.9rem',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <span className="material-icons" style={{ fontSize: '1rem' }}>filter_alt</span>
            {filterDay ? `Filtered: ${DAY_SHORT[filterDay]}` : 'Filter by Day/Time'}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showAvailFilter && (
        <div style={{
          background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem',
          border: '1px solid rgba(56,161,105,0.25)', marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-icons" style={{ color: '#38a169', fontSize: '1.1rem' }}>event_available</span>
            Filter providers by when they are available
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button onClick={() => setFilterDay('')}
              style={{ padding: '0.4rem 1rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', background: !filterDay ? 'var(--primary)' : '#f0f0f0', color: !filterDay ? 'white' : 'var(--on-surface-variant)', border: 'none' }}>
              Any Day
            </button>
            {DAYS_LIST.map(d => (
              <button key={d} onClick={() => setFilterDay(d)}
                style={{ padding: '0.4rem 1rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', background: filterDay === d ? `color-mix(in srgb, ${DAY_COLORS_VIEW[d]} 15%, white)` : '#f0f0f0', color: filterDay === d ? DAY_COLORS_VIEW[d] : 'var(--on-surface-variant)', border: filterDay === d ? `2px solid ${DAY_COLORS_VIEW[d]}` : '2px solid transparent', transition: 'all 0.15s' }}>
                {DAY_SHORT[d]}
              </button>
            ))}
          </div>
          {filterDay && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Time range:</span>
              <input type="time" value={filterTimeFrom} onChange={e => setFilterTimeFrom(e.target.value)} style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.82rem', outline: 'none' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>to</span>
              <input type="time" value={filterTimeTo} onChange={e => setFilterTimeTo(e.target.value)} style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem', fontSize: '0.82rem', outline: 'none' }} />
              {(filterTimeFrom || filterTimeTo) && (
                <button onClick={() => { setFilterTimeFrom(''); setFilterTimeTo('') }} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>Clear time</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result count */}
      {filterDay && (
        <div style={{ marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
          Showing <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> provider{filtered.length !== 1 ? 's' : ''} available
          {filterDay ? ` on ${filterDay}` : ''}
          {filterTimeFrom ? ` from ${formatTime12(filterTimeFrom)}` : ''}
          {filterTimeTo ? ` to ${formatTime12(filterTimeTo)}` : ''}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--on-surface-variant)' }}>
          <span className="material-icons" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>sync</span>
          Loading schedules...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--outline-variant)' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--outline-variant)', display: 'block', marginBottom: '1rem' }}>event_busy</span>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{filterDay ? `No providers available on ${filterDay}` : 'No providers have set their schedules yet'}</p>
          {filterDay && <button onClick={() => { setFilterDay(''); setFilterTimeFrom(''); setFilterTimeTo('') }} className="btn btn--outline" style={{ marginTop: '1rem', fontSize: '0.82rem' }}>Show all</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(provider => {
            const initials = provider.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
            const COLORS = ['#d69e2e', '#805ad5', '#38a169', '#319795', '#e53e3e', '#3182ce']
            const avatarColor = COLORS[provider.name?.charCodeAt(0) % COLORS.length] || '#3182ce'
            const todaySchedule = provider.availability_schedule?.find(s => s.day === today)
            const isAvailableToday = todaySchedule && todaySchedule.slots?.length > 0

            return (
              <div key={provider.id} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                {/* Provider header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0, background: `color-mix(in srgb, ${avatarColor} 15%, white)`, border: `2px solid ${avatarColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: avatarColor }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{provider.name}</h3>
                      {isAvailableToday && <span style={{ fontSize: '0.63rem', background: 'rgba(56,161,105,0.1)', color: '#38a169', padding: '0.12rem 0.5rem', borderRadius: '100px', fontWeight: 700 }}>● Available Today</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      {(provider.categories || []).slice(0, 2).join(', ') || 'Service Provider'} · {provider.city ? `${provider.city}, ${provider.state}` : 'Nearby'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {provider.rating && <div style={{ fontSize: '0.82rem', color: '#d69e2e', fontWeight: 700 }}>★ {Number(provider.rating).toFixed(1)}</div>}
                    <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>Trust: {Number(provider.trust_score || 0).toFixed(1)}/10</div>
                  </div>
                </div>

                {/* Week grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
                  {DAYS_VIEW.map(day => {
                    const ds = provider.availability_schedule?.find(s => s.day === day)
                    const isToday = day === today
                    const isFiltered = filterDay === day
                    return (
                      <div key={day} style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.3rem', textAlign: 'center', background: ds ? `color-mix(in srgb, ${DAY_COLORS_VIEW[day]} 10%, white)` : '#f7f7f7', border: isFiltered ? `2px solid ${DAY_COLORS_VIEW[day]}` : isToday ? `2px solid ${ds ? DAY_COLORS_VIEW[day] : '#ddd'}` : `1px solid ${ds ? 'color-mix(in srgb, ' + DAY_COLORS_VIEW[day] + ' 25%, white)' : '#eee'}`, opacity: ds ? 1 : 0.45 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: ds ? DAY_COLORS_VIEW[day] : '#bbb', marginBottom: '0.25rem' }}>
                          {DAY_SHORT_VIEW[day]}{isToday ? '●' : ''}
                        </div>
                        {ds ? (
                          ds.slots.slice(0, 1).map((slot, i) => (
                            <div key={i} style={{ fontSize: '0.55rem', color: 'var(--on-surface)', lineHeight: 1.4, fontWeight: 600 }}>
                              {formatTime12(slot.from)}<br />{formatTime12(slot.to)}
                            </div>
                          ))
                        ) : <div style={{ fontSize: '0.58rem', color: '#bbb', fontWeight: 600 }}>Off</div>}
                        {ds && ds.slots.length > 1 && <div style={{ fontSize: '0.52rem', color: DAY_COLORS_VIEW[day], fontWeight: 700, marginTop: '2px' }}>+{ds.slots.length - 1}</div>}
                      </div>
                    )
                  })}
                </div>

                {/* Today highlight */}
                {isAvailableToday && (
                  <div style={{ marginTop: '0.8rem', background: 'rgba(56,161,105,0.07)', borderRadius: 'var(--radius-md)', padding: '0.55rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(56,161,105,0.15)' }}>
                    <span className="material-icons" style={{ color: '#38a169', fontSize: '0.9rem' }}>today</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38a169' }}>
                      Today: {todaySchedule.slots.map(s => `${formatTime12(s.from)} – ${formatTime12(s.to)}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
