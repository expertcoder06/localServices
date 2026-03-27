import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import AiBiddingSystem from '../components/AiBiddingSystem'
import JobExecutionWallet from '../components/JobExecutionWallet'
import '../App.css'
import ServiceProviderProfile from '../components/ServiceProviderProfile'

const MOCK_REQUESTS = [
  {
    id: 'mock-1',
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
    id: 'mock-2',
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
    id: 'mock-3',
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
    id: 'mock-4',
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
  { id: 'jobs', icon: 'work', label: 'Explore Jobs' },
  { id: 'my_bids', icon: 'gavel', label: 'My Bids' },
  { id: 'earnings', icon: 'payments', label: 'Earnings' },
  { id: 'customers', icon: 'groups', label: 'Customers' },
  { id: 'profile', icon: 'person', label: 'Profile' }
]

function ProviderBidsView({ providerId }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!providerId) return
    async function fetchBids() {
      const { data, error } = await supabase
        .from('bids')
        .select('*, jobs(*)')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching provider bids:', error)
      } else {
        setBids(data || [])
      }
      setLoading(false)
    }
    fetchBids()
  }, [providerId])

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>⏳ Loading your bids...</div>

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>My Submitted Bids</h2>
      {bids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--outline-variant)', marginBottom: '1rem' }}>gavel</span>
            <p>You haven't placed any bids yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bids.map(bid => (
            <div key={bid.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', background: bid.status === 'accepted' ? 'rgba(56,161,105,0.1)' : 'var(--surface-container)', color: bid.status === 'accepted' ? '#38a169' : 'var(--on-surface-variant)', padding: '0.2rem 0.6rem', borderRadius: '40px', fontWeight: 800, textTransform: 'uppercase' }}>
                    {bid.status}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
                     Bid on: {new Date(bid.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{bid.jobs?.title || 'Unknown Job'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>{bid.jobs?.location}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span>📅 Client Booked: {new Date(bid.jobs?.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  {bid.status === 'accepted' && bid.jobs?.accepted_at && (
                    <span style={{ color: '#38a169', fontWeight: 600 }}>✅ Accepted At: {new Date(bid.jobs.accepted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{bid.amount}</div>
                {bid.status === 'accepted' && <button className="btn btn--primary" style={{ marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Open Workspace</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isActive, setIsActive] = useState(true)
  const [acceptedJobs, setAcceptedJobs] = useState(new Set())
  const [declinedJobs, setDeclinedJobs] = useState(new Set())
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [activeJob, setActiveJob] = useState(null)
  const [isPriceStep, setIsPriceStep] = useState(false)
  const [currentBidPrice, setCurrentBidPrice] = useState(0)
  const [liveRequests, setLiveRequests] = useState([])
  const [providerBids, setProviderBids] = useState([])
  const [radius, setRadius] = useState(10) // 10km default
  const [providerLocation, setProviderLocation] = useState(null)
  const [promisedHours, setPromisedHours] = useState(2) // Default 2 hours

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const fetchProviderLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setProviderLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      }, (err) => console.warn('Provider location permission denied', err))
    }
  }

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, consumers(name, photo_url)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data) {
        const fetchColor = (cat) => {
          const map = {
            'Plumbing': '#2b6cb0', 'Electrical': '#d69e2e', 'Cleaning': '#38a169', 'AC Repair': '#319795',
            'Carpentry': '#805ad5', 'Painting': '#dd6b20', 'Personal Trainer': '#e53e3e', 'Interior Design': '#9f7aea',
            'Pest Control': '#38a169', 'CCTV / Security': '#e53e3e', 'Catering': '#d69e2e', 'Yoga / Wellness': '#3182ce'
          };
          return map[cat] || '#718096';
        };

        const fetchIcon = (cat) => {
          const map = {
            'Plumbing': 'plumbing', 'Electrical': 'bolt', 'Cleaning': 'cleaning_services', 'AC Repair': 'ac_unit',
            'Carpentry': 'build', 'Painting': 'format_paint', 'Personal Trainer': 'fitness_center', 'Interior Design': 'design_services',
            'Pest Control': 'pest_control', 'CCTV / Security': 'camera_indoor', 'Catering': 'local_dining', 'Yoga / Wellness': 'spa'
          };
          return map[cat] || 'more_horiz';
        };

        const mapped = data.map(dbJob => {
          const dist = providerLocation ? haversineDistance(providerLocation.lat, providerLocation.lon, dbJob.latitude, dbJob.longitude) : null
          
          return {
            id: dbJob.id,
            title: dbJob.title,
            category: dbJob.category,
            icon: fetchIcon(dbJob.category),
            color: fetchColor(dbJob.category),
            budgetMin: dbJob.budget_min || (dbJob.budget ? Math.max(0, dbJob.budget - 500) : 0),
            budgetMax: dbJob.budget_max || dbJob.budget || 0,
            distance: dist ? `${dist.toFixed(1)} km` : 'Live',
            distanceValue: dist,
            urgency: dbJob.timeline === 'urgent' ? 'Urgent' : 'New',
            postedAt: new Date(dbJob.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            address: dbJob.location || 'Unknown',
            description: dbJob.description || '',
            audio_url: dbJob.audio_url,
            timeline: dbJob.timeline,
            preferred_date: dbJob.preferred_date ? new Date(dbJob.preferred_date).toLocaleDateString() : 'ASAP',
            customerName: dbJob.consumers?.name || 'Customer',
            customerPhoto: dbJob.consumers?.photo_url
          }
        });
        setLiveRequests(mapped);
      }
    };

    fetchProviderLocation();

    const fetchMyBids = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data, error } = await supabase
           .from('bids')
           .select('*, job:jobs(*)')
           .eq('provider_id', user.id)
           .order('created_at', { ascending: false });
         if (data) {
           setProviderBids(data);
           setAcceptedJobs(prev => new Set([...prev, ...data.map(b => b.job_id)]));
         }
      }
    };

    fetchJobs();
    fetchMyBids();

    const subscription = supabase.channel('public:jobs_and_bids')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => {
        fetchMyBids();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [providerLocation]); // Refetch with distance if location updates

  const visibleRequests = [...liveRequests, ...MOCK_REQUESTS].filter(r => {
    if (declinedJobs.has(r.id)) return false
    if (providerLocation && r.distanceValue !== undefined && r.distanceValue !== null) {
      return r.distanceValue <= radius
    }
    return true
  })

  return (
    <div className="dashboard-layout">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
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
                You have <strong>{visibleRequests.length} new requests</strong> in your area.
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
              <div className="dashboard-avatar" style={{ background: 'var(--tertiary)', color: 'white', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>AL</div>
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
        {!activeJob && activeTab === 'profile' && (
          <ServiceProviderProfile isEditable={true} />
        )}

        {activeTab === 'customers' && (
           <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Potential Customers</h2>
             <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>People looking for services in your area.</p>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {liveRequests.map(req => (
                  <div key={req.id} style={{ padding: '1.2rem', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                       <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800 }}>
                          {req.customerPhoto ? <img src={req.customerPhoto} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : req.customerName?.[0]}
                       </div>
                       <div>
                          <div style={{ fontWeight: 700 }}>{req.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Active Request: {req.title}</div>
                       </div>
                    </div>
                    <button className="btn btn--outline" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => { setActiveTab('jobs'); setSelectedRequest(req); }}>View Request</button>
                  </div>
                ))}
             </div>
           </div>
        )}
        {!activeJob && activeTab !== 'jobs' && activeTab !== 'profile' && (<div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-col-left">

            {/* Nearby Requests */}
            <section className="dash-section">
              <div className="dash-section__header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center' }}>Nearby Requests <span style={{
                    background: 'rgba(221,107,32,0.12)', color: '#dd6b20',
                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: '100px', letterSpacing: '0.05em', textTransform: 'uppercase',
                    marginLeft: '0.5rem', verticalAlign: 'middle',
                  }}>Live</span></h2>
                  
                  {!providerLocation ? (
                    <button 
                      onClick={fetchProviderLocation}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700,
                        background: 'var(--primary)', color: 'white', border: 'none',
                        borderRadius: 'var(--radius-md)', cursor: 'pointer'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '1rem' }}>my_location</span>
                      Enable Geolocation
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#38a169', fontWeight: 700 }}>
                      <span className="material-icons" style={{ fontSize: '1.1rem' }}>check_circle</span>
                      Radius: {radius}km
                    </div>
                  )}
                </div>

                {providerLocation && (
                  <div style={{ 
                    background: 'var(--surface-container-low)', padding: '1rem', 
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Filter by proximity</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{radius} km</span>
                    </div>
                    <input 
                      type="range" min="1" max="50" value={radius} 
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--on-surface-variant)', marginTop: '0.4rem' }}>
                      <span>1km</span><span>50km</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Radius Filter Bar */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(26,54,93,0.04) 0%, rgba(49,130,206,0.06) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.2rem',
                marginBottom: '1.2rem',
                border: '1px solid var(--outline-variant)',
              }}>
                {/* Location Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: providerLocation ? 'rgba(56,161,105,0.12)' : isLocating ? 'rgba(49,130,206,0.12)' : 'rgba(229,62,62,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-icons" style={{
                        fontSize: '0.95rem',
                        color: providerLocation ? '#38a169' : isLocating ? '#3182ce' : '#e53e3e',
                        animation: isLocating ? 'pulse 1.5s infinite' : 'none'
                      }}>
                        {providerLocation ? 'my_location' : isLocating ? 'sync' : 'location_off'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: providerLocation ? '#38a169' : '#e53e3e' }}>
                        {providerLocation ? 'Location Active' : isLocating ? 'Detecting...' : 'Location Off'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>
                        {providerLocation 
                          ? `${providerLocation.lat.toFixed(4)}°, ${providerLocation.lng.toFixed(4)}°` 
                          : locationError || 'Enable location for radius filter'}
                      </div>
                    </div>
                  </div>
                  {!providerLocation && !isLocating && (
                    <button
                      onClick={() => {
                        setIsLocating(true)
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setProviderLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                            setIsLocating(false)
                            setLocationError(null)
                          },
                          (err) => {
                            setLocationError('Permission denied')
                            setIsLocating(false)
                          }
                        )
                      }}
                      style={{
                        background: 'var(--primary)', color: 'white', border: 'none',
                        borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
                        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '0.85rem' }}>gps_fixed</span>
                      Enable
                    </button>
                  )}
                </div>

                {/* Radius Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Search Radius
                    </label>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)',
                      background: 'var(--primary-container)', padding: '2px 10px',
                      borderRadius: '100px',
                    }}>
                      {searchRadius} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={e => setSearchRadius(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)', height: '6px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--outline)', marginTop: '2px' }}>
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Filter summary */}
                {providerLocation && (
                  <div style={{
                    marginTop: '0.6rem', paddingTop: '0.6rem',
                    borderTop: '1px solid var(--outline-variant)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.72rem', color: 'var(--on-surface-variant)',
                  }}>
                    <span className="material-icons" style={{ fontSize: '0.85rem', color: '#3182ce' }}>filter_alt</span>
                    Showing <strong style={{ color: 'var(--primary)' }}>{filteredRequests.length}</strong> request{filteredRequests.length !== 1 ? 's' : ''} within {searchRadius} km
                  </div>
                )}
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
                            background: '#3182ce1a',
                            color: '#3182ce',
                          }}>Pending</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                          <span className="material-icons" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '2px' }}>location_on</span>
                          {req.address} &nbsp;·&nbsp; 
                          <span style={{ 
                            color: req.distanceValue <= 3 ? '#38a169' : req.distanceValue <= 10 ? '#dd6b20' : 'var(--on-surface-variant)',
                            fontWeight: 700
                          }}>
                            {req.distance} away
                          </span> &nbsp;·&nbsp; {req.postedAt}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
                            ₹{req.budgetMin?.toLocaleString()} — ₹{req.budgetMax?.toLocaleString()}
                            <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 400, marginLeft: '6px' }}>Budget Range</span>
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
                                const budget = req.budget || 1000;
                                setSelectedRequest(req)
                                setIsPriceStep(true)
                                setCurrentBidPrice(budget)
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

            {/* My Active Bids */}
            {providerBids.length > 0 && (
            <section className="dash-section">
              <div className="dash-section__header">
                <h2>My Active Bids</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{providerBids.length} submitted</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {providerBids.map(bid => (
                  <div key={bid.id} style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.2rem 1.5rem',
                    border: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>{bid.job?.title || 'Unknown Job'}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                        <span className="material-icons" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '2px' }}>location_on</span>
                        {bid.job?.location} &nbsp;·&nbsp; {new Date(bid.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{bid.amount}</div>
                      <div style={{ fontSize: '0.7rem', color: '#dd6b20', fontWeight: 700, padding: '2px 6px', background: 'rgba(221,107,32,0.1)', borderRadius: '4px', marginTop: '4px' }}>
                         Awaiting Reply
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            )}

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
        }} onClick={() => { setSelectedRequest(null); setIsPriceStep(false); }}>
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
                  {!isPriceStep ? (
                    <div style={{
                      width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
                      background: `color-mix(in srgb, ${selectedRequest.color} 14%, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-icons" style={{ color: selectedRequest.color, fontSize: '1.8rem' }}>{selectedRequest.icon}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsPriceStep(false)}
                      style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)' }}>arrow_back</span>
                    </button>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{isPriceStep ? 'Set Your Price' : selectedRequest.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{isPriceStep ? `Customer Budget: ₹${selectedRequest.budget || 0}` : selectedRequest.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedRequest(null); setIsPriceStep(false); }}
                  style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)' }}>close</span>
                </button>
              </div>

              {!isPriceStep ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Budget Range</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{selectedRequest.budgetMin} — ₹{selectedRequest.budgetMax}</div>
                    </div>
                    <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Status</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38a169' }}>{selectedRequest.status}</div>
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

                  {selectedRequest.audio_url && (
                    <div style={{ marginBottom: '2rem', background: 'var(--surface-container-low)', padding: '1.2rem', borderRadius: 'var(--radius-lg)', border: '1px border var(--outline-variant)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>mic</span>
                        Customer Voice Note
                      </h4>
                      <audio controls src={selectedRequest.audio_url} style={{ width: '100%', height: '40px' }}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Location</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>location_on</span>
                        {selectedRequest.address}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Preferred Date</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>calendar_month</span>
                        {selectedRequest.preferred_date}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Urgency</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: (selectedRequest.timeline === 'urgent' || selectedRequest.timeline === 'immediate') ? '#e53e3e' : 'var(--on-surface-variant)', fontWeight: 600 }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>{selectedRequest.timeline === 'urgent' ? 'bolt' : 'schedule'}</span>
                        {selectedRequest.timeline?.toUpperCase() || 'NORMAL'}
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
                        setIsPriceStep(true)
                        setCurrentBidPrice(Math.round((selectedRequest.budgetMin + selectedRequest.budgetMax) / 2))
                      }}
                    >
                      {acceptedJobs.has(selectedRequest.id) ? 'Bid Already Placed' : 'Place Bid Now'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>₹{currentBidPrice}</div>
                  
                  <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max={(selectedRequest.budget || 2000) * 1.5} 
                      value={currentBidPrice} 
                      onChange={(e) => setCurrentBidPrice(parseInt(e.target.value))}
                      style={{ width: '100%', height: '8px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                      <span>₹0</span>
                      <span>₹{(selectedRequest.budget || 2000) * 1.5}</span>
                    </div>
                  </div>

                  <div className="ai-suggested-card" style={{ 
                    marginBottom: '2rem', padding: '1.2rem', borderRadius: 'var(--radius-lg)', 
                    textAlign: 'left', cursor: 'pointer', border: '1px solid var(--primary)',
                    background: 'rgba(0,32,69,0.02)'
                  }} onClick={() => setCurrentBidPrice(Math.round((selectedRequest.budget || 1000) * 0.95))}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
                      <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>auto_awesome</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Bidding Active</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>₹{Math.round((selectedRequest.budget || 1000) * 0.95)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>Optimized for <strong>92% win probability</strong></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38a169', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', background: '#38a169', borderRadius: '50%' }} />
                          Recommended
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>Tap to apply</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(56, 161, 105, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', textAlign: 'left' }}>
                    <span className="material-icons" style={{ color: '#38a169' }}>info</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                      Choosing a price within the customer's budget increases your chance of winning by <strong style={{ color: '#38a169' }}>24%</strong>.
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface-container-low)', padding: '1.2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--outline-variant)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                      <span className="material-icons" style={{ fontSize: '1.2rem' }}>schedule</span>
                      Estimated Completion Time
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input 
                        type="number" 
                        min="0.5" 
                        step="0.5" 
                        value={promisedHours} 
                        onChange={(e) => setPromisedHours(parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontWeight: 700, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Hours to complete work</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#e53e3e', marginTop: '0.6rem', fontWeight: 600 }}>
                      ⚠️ Penalty applies if actual time exceeds this estimate.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      className="btn btn--ghost" 
                      style={{ flex: 1, padding: '1rem' }}
                      onClick={() => setIsPriceStep(false)}
                    >Back</button>
                    <button 
                      className="btn btn--primary" 
                      style={{ flex: 2, padding: '1rem', fontSize: '1rem' }}
                      onClick={async () => {
                        if (typeof selectedRequest.id === 'string' && selectedRequest.id.startsWith('mock-')) {
                           // Skip DB for mock requests
                        } else {
                           try {
                             const { data: { user } } = await supabase.auth.getUser();
                             if (user) {
                               const { error } = await supabase.from('bids').insert([{
                                 job_id: selectedRequest.id,
                                 provider_id: user.id,
                                 amount: currentBidPrice,
                                 promised_hours: promisedHours,
                                 message: `I can complete this in approx ${promisedHours} hours.`
                               }]);
                               if (error) {
                                 console.error('Error submitting bid:', error);
                               } else {
                                 // Try to start the bid alert for the consumer
                                 fetch('http://localhost:5000/start-bid-alert', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({
                                     jobId: selectedRequest.id,
                                     jobTitle: selectedRequest.title
                                   })
                                 }).catch(err => console.warn('Bid alert start failed:', err));
                               }
                             }
                           } catch (err) {
                             console.error('Failed to place bid on DB:', err);
                           }
                        }

                        setAcceptedJobs(prev => new Set([...prev, selectedRequest.id]))
                        setActiveJob({ ...selectedRequest, bidPrice: currentBidPrice })
                        setSelectedRequest(null)
                        setIsPriceStep(false)
                      }}
                    >
                      Confirm Bid — ₹{currentBidPrice}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
