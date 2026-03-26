import { useState } from 'react'
import { Link } from 'react-router-dom'
import AiBiddingSystem from '../components/AiBiddingSystem'
import JobExecutionWallet from '../components/JobExecutionWallet'
import '../App.css'

const MOCK_REQUESTS = [
  {
    id: 1,
    title: 'Kitchen Sink Leakage',
    category: 'Plumbing',
    icon: 'plumbing',
    color: '#2b6cb0',
    budgetMin: 800,
    budgetMax: 1200,
    distance: '0.8 km',
    urgency: 'Urgent',
    postedAt: '5 min ago',
    address: 'Sector 21, Gurgaon',
  },
  {
    id: 2,
    title: 'Main Board Sparking',
    category: 'Electrical',
    icon: 'bolt',
    color: '#d69e2e',
    budgetMin: 1500,
    budgetMax: 2000,
    distance: '1.2 km',
    urgency: 'Urgent',
    postedAt: '12 min ago',
    address: 'DLF Phase 2, Gurgaon',
  },
  {
    id: 3,
    title: 'Deep House Cleaning',
    category: 'Cleaning',
    icon: 'cleaning_services',
    color: '#38a169',
    budgetMin: 600,
    budgetMax: 900,
    distance: '2.1 km',
    urgency: 'Flexible',
    postedAt: '34 min ago',
    address: 'Cyber City, Gurgaon',
  },
  {
    id: 4,
    title: 'AC Service & Gas Refill',
    category: 'AC Repair',
    icon: 'ac_unit',
    color: '#319795',
    budgetMin: 599,
    budgetMax: 799,
    distance: '3.4 km',
    urgency: 'Tomorrow',
    postedAt: '1h ago',
    address: 'Sushant Lok, Gurgaon',
    description: 'Detailed description of the service requested by the user. Need a comprehensive AC servicing and gas refill for a 1.5 ton split AC. The cooling has significantly decreased recently.',
    customerName: 'Ankit Mehta',
    date: '27th March 2026',
    time: '10:00 AM - 12:00 PM',
  },
]

const MOCK_SCHEDULE = [
  { time: '10:00 AM', client: 'Meera Kapoor', service: 'Yoga Session', status: 'upcoming' },
  { time: '2:00 PM', client: 'Rahul Mehta', service: 'Electrical Wiring Fix', status: 'confirmed' },
  { time: '5:00 PM – 8:00 PM', client: 'Open Slot', service: 'Peak Demand Zone', status: 'ai-suggest' },
]

const SIDEBAR_LINKS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'jobs', icon: 'work', label: 'Jobs' },
  { id: 'earnings', icon: 'payments', label: 'Earnings' },
  { id: 'insights', icon: 'insights', label: 'Insights' },
  { id: 'support', icon: 'help', label: 'Support' },
]

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isActive, setIsActive] = useState(true)
  const [acceptedJobs, setAcceptedJobs] = useState(new Set())
  const [declinedJobs, setDeclinedJobs] = useState(new Set())
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [activeJob, setActiveJob] = useState(null)

  const visibleRequests = MOCK_REQUESTS.filter(r => !declinedJobs.has(r.id))

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="navbar__logo" style={{ marginBottom: '2rem' }}>
          <span className="navbar__logo-icon">◈</span>
          <span>LOCAL<span className="navbar__logo-accent">SERVICES</span></span>
        </div>

        {/* Provider Badge */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span className="material-icons" style={{ color: '#f6ad55', fontSize: '1.1rem' }}>workspace_premium</span>
          <div>
            <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Premium Provider</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>Verified Expert</div>
          </div>
        </div>

        <nav className="dashboard-nav">
          {SIDEBAR_LINKS.map(link => (
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
            <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>logout</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header" style={{ flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              <h1 className="dashboard-title">Good morning, Alex.</h1>
              <p className="dashboard-subtitle">
                <span style={{ color: '#dd6b20', marginRight: '6px' }}>📍</span>
                You have <strong>12 new requests</strong> in your current radius.
              </p>
            </div>
            <div className="dashboard-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                onClick={() => setIsActive(!isActive)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: isActive ? 'rgba(56, 161, 105, 0.1)' : 'rgba(214, 158, 46, 0.1)',
                  color: isActive ? '#38a169' : '#d69e2e',
                  padding: '0.4rem 0.8rem', borderRadius: '100px',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  border: `1px solid ${isActive ? '#38a169' : '#d69e2e'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: isActive ? '#38a169' : '#d69e2e',
                  boxShadow: `0 0 6px ${isActive ? '#38a169' : '#d69e2e'}`
                }} />
                {isActive ? 'Active' : 'Inactive'}
              </div>
              <button className="btn btn--ghost" style={{ borderRadius: '50%', padding: '0.4rem' }}>
                <span className="material-icons">notifications</span>
              </button>
              <div className="dashboard-avatar" style={{ background: 'var(--tertiary)', color: 'white' }}>AL</div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            width: '100%',
          }}>
            {[
              { label: "Today's Earnings", value: '₹3,450', icon: 'currency_rupee', color: '#38a169', bg: 'rgba(56,161,105,0.1)' },
              { label: 'Monthly Earnings', value: '₹24,800', icon: 'trending_up', color: '#3182ce', bg: 'rgba(49,130,206,0.1)' },
              { label: 'Avg. Rating', value: '4.9 ★', icon: 'star', color: '#d69e2e', bg: 'rgba(214,158,46,0.1)' },
              { label: 'Lifetime Jobs', value: '142', icon: 'handyman', color: 'var(--primary-container)', bg: 'rgba(26,54,93,0.08)' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#fff',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--outline-variant)',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="material-icons" style={{ color: stat.color, fontSize: '1.2rem' }}>{stat.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginBottom: '0.15rem' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Job Execution View */}
        {activeJob && (
          <div style={{ padding: '1rem' }}>
            <JobExecutionWallet job={activeJob} onBack={() => setActiveJob(null)} />
          </div>
        )}

        {/* AI Bidding System — Jobs Tab */}
        {!activeJob && activeTab === 'jobs' && (
          <div style={{ padding: '0 0.5rem' }}>
            <AiBiddingSystem />
          </div>
        )}

        {/* Grid — Dashboard Tab */}
        {!activeJob && activeTab !== 'jobs' && (<div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-col-left">

            {/* Nearby Requests */}
            <section className="dash-section">
              <div className="dash-section__header">
                <h2>Nearby Requests <span style={{
                  background: 'rgba(221,107,32,0.12)', color: '#dd6b20',
                  fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                  borderRadius: '100px', letterSpacing: '0.05em', textTransform: 'uppercase',
                  marginLeft: '0.5rem', verticalAlign: 'middle',
                }}>Live</span></h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{visibleRequests.length} open</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {visibleRequests.map(req => (
                  <div key={req.id} 
                    onClick={() => setSelectedRequest(req)}
                    style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.2rem 1.5rem',
                    border: '1px solid var(--outline-variant)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                        background: `color-mix(in srgb, ${req.color} 12%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="material-icons" style={{ color: req.color }}>{req.icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{req.title}</h4>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                            borderRadius: '100px', letterSpacing: '0.04em',
                            background: req.urgency === 'Urgent' ? 'rgba(229,62,62,0.1)' : req.urgency === 'Flexible' ? 'rgba(56,161,105,0.1)' : 'rgba(49,130,206,0.1)',
                            color: req.urgency === 'Urgent' ? '#e53e3e' : req.urgency === 'Flexible' ? '#38a169' : '#3182ce',
                          }}>{req.urgency}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginBottom: '0.6rem' }}>
                          <span className="material-icons" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '2px' }}>location_on</span>
                          {req.address} &nbsp;·&nbsp; {req.distance} away &nbsp;·&nbsp; {req.postedAt}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
                            ₹{req.budgetMin.toLocaleString()} – ₹{req.budgetMax.toLocaleString()}
                            <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 400, marginLeft: '4px' }}>Est. Budget</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn--ghost"
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', border: '1px solid var(--outline-variant)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeclinedJobs(prev => new Set([...prev, req.id]))
                              }}
                            >Decline</button>
                            <button
                              className="btn btn--primary"
                              style={{ padding: '0.3rem 0.9rem', fontSize: '0.75rem', opacity: acceptedJobs.has(req.id) ? 0.7 : 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAcceptedJobs(prev => new Set([...prev, req.id]))
                                setActiveJob(req)
                              }}
                            >
                              {acceptedJobs.has(req.id) ? '✓ Bid Placed' : 'Place Bid'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {visibleRequests.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                    <span className="material-icons" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}>inbox</span>
                    No open requests right now. Check back soon!
                  </div>
                )}
              </div>
            </section>

            {/* Top 1% Badge */}
            <section className="dash-section">
              <div style={{
                background: 'linear-gradient(135deg, #1a3a5c 0%, var(--primary-container) 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: '#f6ad55' }}>emoji_events</span>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.3rem' }}>Elite Status Maintained</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>
                    You've met all <strong style={{ color: '#f6ad55' }}>Platinum Provider</strong> criteria for 3 consecutive months.
                    You are in the <strong style={{ color: '#f6ad55' }}>Top 1%</strong> in Sector 21.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="dashboard-col-right">

            {/* AI Demand Insight */}
            <section className="dash-section" style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <span className="material-icons" style={{ color: '#f6ad55' }}>auto_awesome</span>
                <h3 style={{ color: 'white', fontSize: '1rem' }}>High Demand Zone</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                AI predicts a <strong style={{ color: '#f6ad55' }}>40% surge</strong> in plumbing requests in <strong>Sector 43</strong> over the next 2 hours. Consider moving there to maximise bookings.
              </p>
              <button className="btn" style={{
                marginTop: '1rem', background: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)',
                padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: 'var(--radius-md)',
              }}>View Zone Map</button>
            </section>

            {/* Smart Schedule */}
            <section className="dash-section">
              <h2>Smart Schedule</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {MOCK_SCHEDULE.map((slot, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.8rem 1rem',
                    background: slot.status === 'ai-suggest' ? 'rgba(221,107,32,0.07)' : '#fff',
                    borderRadius: 'var(--radius-md)',
                    border: slot.status === 'ai-suggest' ? '1.5px dashed #dd6b20' : '1px solid var(--outline-variant)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: slot.status === 'confirmed' ? '#38a169' : slot.status === 'ai-suggest' ? '#dd6b20' : 'var(--outline)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)' }}>{slot.time}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--on-surface-variant)' }}>{slot.client} · {slot.service}</div>
                    </div>
                    {slot.status === 'ai-suggest' && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, color: '#dd6b20',
                        background: 'rgba(221,107,32,0.12)', padding: '2px 8px', borderRadius: '100px',
                      }}>AI Pick</span>
                    )}
                    {slot.status === 'confirmed' && (
                      <span className="material-icons" style={{ color: '#38a169', fontSize: '1rem' }}>check_circle</span>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-icons" style={{ fontSize: '0.9rem', color: '#dd6b20' }}>tips_and_updates</span>
                <strong>Optimal Slot:</strong>&nbsp;5:00 PM – 8:00 PM. Take a break now to stay fresh for the evening peak.
              </p>
            </section>

            {/* Quick Stats */}
            <section className="dash-section" style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid var(--outline-variant)',
            }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Performance This Week</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  { label: 'Jobs Completed', value: '8', icon: 'task_alt', color: '#38a169' },
                  { label: 'Response Rate', value: '96%', icon: 'speed', color: '#3182ce' },
                  { label: 'On-time Arrival', value: '100%', icon: 'schedule', color: '#319795' },
                  { label: 'Repeat Clients', value: '3', icon: 'people', color: '#805ad5' },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="material-icons" style={{ color: stat.color, fontSize: '1.1rem' }}>{stat.icon}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{stat.label}</span>
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: stat.color }}>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust Signals */}
            <section className="dash-section" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: 'verified_user', title: 'Background Verified', desc: 'Identity & police verification complete.' },
                  { icon: 'security', title: 'Escrow Payments', desc: 'Your earnings are secured until job completion.' },
                  { icon: 'headset_mic', title: '24/7 Provider Support', desc: 'Dedicated team ready to assist you anytime.' },
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
        </div>)}
      </main>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,32,69,0.6)',
          backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }} onClick={() => setSelectedRequest(null)}>
          <div style={{
            background: 'white', borderSelf: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative',
            animation: 'modalSlideUp 0.3s ease-out',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
                    background: `color-mix(in srgb, ${selectedRequest.color} 14%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-icons" style={{ color: selectedRequest.color, fontSize: '1.8rem' }}>{selectedRequest.icon}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedRequest.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{selectedRequest.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)' }}>close</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Budget Range</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{selectedRequest.budgetMin} - ₹{selectedRequest.budgetMax}</div>
                </div>
                <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Urgency</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedRequest.urgency === 'Urgent' ? '#e53e3e' : '#38a169' }}>{selectedRequest.urgency}</div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>description</span>
                  Job Description
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, background: 'var(--surface-container-lowest)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                  {selectedRequest.description || "The user needs professional assistance with their request. Please click 'Place Bid' to offer your services and discuss further details."}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Location</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>location_on</span>
                    {selectedRequest.address}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Preferred Time</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>schedule</span>
                    27th March, 10 AM - 12 PM
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn--ghost" 
                  style={{ flex: 1, padding: '1rem' }}
                  onClick={() => setSelectedRequest(null)}
                >Close</button>
                <button 
                  className="btn btn--primary" 
                  style={{ flex: 2, padding: '1rem', fontSize: '1rem' }}
                  onClick={() => {
                    setAcceptedJobs(prev => new Set([...prev, selectedRequest.id]))
                    setActiveJob(selectedRequest)
                    setSelectedRequest(null)
                  }}
                >
                  {acceptedJobs.has(selectedRequest.id) ? 'Bid Already Placed' : 'Place Bid Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
