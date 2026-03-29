import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

const JOB_TITLE = 'Plumbing Repair & Pipe Fixing'
const CUSTOMER_NAME = 'You'

async function sendBidAcceptedEmail(provider) {
  try {
    await fetch('http://localhost:5000/send-bid-accepted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerEmail: provider.email,
        providerName:  provider.name,
        jobTitle:      JOB_TITLE,
        customerName:  CUSTOMER_NAME,
        amount:        provider.hourly_rate ?? 'N/A',
      }),
    })
  } catch (err) {
    console.error('Failed to send bid-accepted email:', err)
  }
}

export default function CustomerJobsFlow() {
  const navigate = useNavigate()
  const [view, setView] = useState('bids')
  const [selectedBid, setSelectedBid] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(4)
  const [emailSent, setEmailSent] = useState(false)
  const [providers, setProviders] = useState([])
  const [loadingProviders, setLoadingProviders] = useState(true)

  useEffect(() => {
    async function fetchProviders() {
      setLoadingProviders(true)
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, name, email, phone, trust_score, hourly_rate, categories, photo_url, city, state')
        .eq('status', 'approved')
      if (error) {
        console.error('Error fetching providers:', error)
      } else {
        setProviders(data || [])
      }
      setLoadingProviders(false)
    }
    fetchProviders()
  }, [])

  /* ── VIEW 1: BIDS RECEIVED ── */
  if (view === 'bids') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {loadingProviders ? '⏳ Loading Bids...' : `🔥 ${providers.length} Bid${providers.length !== 1 ? 's' : ''} Received`}
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
          Expert professionals are ready to assist you. Review their proposals and hire the best match for your project.
        </p>

        {loadingProviders && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Fetching available providers...</p>
          </div>
        )}

        {!loadingProviders && providers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Approved Providers Yet</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>There are no approved service providers available right now. Please check back later.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {providers.map((provider, i) => {
            const initials = provider.name
              ? provider.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              : '??'
            const trustScore = provider.trust_score ?? 0
            const isHighTrust = trustScore >= 8.5
            const location = [provider.city, provider.state].filter(Boolean).join(', ')
            const serviceLabel = provider.categories?.length > 0
              ? provider.categories.slice(0, 2).join(' · ')
              : 'General Services'

            return (
              <div key={provider.id} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)', boxShadow: i === 0 ? 'var(--shadow-sm)' : 'none' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  {provider.photo_url ? (
                    <img src={provider.photo_url} alt={provider.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--outline-variant)' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(49,130,206,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{provider.name}</h3>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {provider.hourly_rate ? `₹${provider.hourly_rate}/hr` : 'Rate on request'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', background: isHighTrust ? 'rgba(56,161,105,0.1)' : 'var(--surface-container)', color: isHighTrust ? '#38a169' : 'var(--on-surface-variant)', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 700 }}>
                        ⭐ Trust Score: {trustScore}/10
                      </span>
                      {isHighTrust && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(214,158,46,0.1)', color: '#d69e2e', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 700 }}>Highly Trusted</span>
                      )}
                      {location && (
                        <span style={{ fontSize: '0.75rem', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 600 }}>📍 {location}</span>
                      )}
                    </div>

                    {serviceLabel && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{serviceLabel}</p>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn btn--outline" style={{ flex: 1, padding: '0.6rem' }}>View Profile</button>
                      <button className="btn btn--primary" style={{ flex: 2, padding: '0.6rem' }} onClick={() => { setSelectedBid(provider); setView('bid_details') }}>Accept Proposal</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ── VIEW 2: BID DETAILS ── */
  if (view === 'bid_details') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button className="btn btn--ghost" onClick={() => setView('bids')} style={{ marginBottom: '1.5rem', padding: '0.5rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem', marginRight: '6px', verticalAlign: 'middle' }}>arrow_back</span> Back to Bids
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Provider Card */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', borderRadius: 'var(--radius-xl)', padding: '2rem', color: 'white', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.8rem', border: '2px solid rgba(255,255,255,0.3)' }}>MT</div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Marcus Thorne</h1>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', color: '#f6ad55' }}>verified</span> Plumbing Specialist
              </div>
            </div>
          </div>

          {/* Bid details */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Proposal Details</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
              "I can fix your plumbing issue quickly using high-quality parts. I have all the materials ready and can arrive during your preferred time window."
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--outline-variant)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.2rem' }}>Total Cost</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹850</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.2rem' }}>Estimated Duration</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>2-3 Hours</div>
              </div>
            </div>
          </div>

          {/* Payment protection */}
          <div style={{ background: 'rgba(56,161,105,0.06)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid rgba(56,161,105,0.2)', display: 'flex', gap: '1rem' }}>
            <span className="material-icons" style={{ color: '#38a169', fontSize: '1.8rem' }}>security</span>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>Payment Protection</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Funds are held securely in escrow and only released when you're 100% satisfied with the job.</p>
            </div>
          </div>

          <button className="btn btn--primary" style={{ fontSize: '1.1rem', padding: '1rem' }} onClick={() => setView('payment')}>
            Proceed to Payment
          </button>
        </div>
      </div>
    )
  }

  /* ── VIEW 3: PAYMENT CONFIRMATION ── */
  if (view === 'payment') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Payment Summary</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
          You're one step away from securing your professional expert. Review your transaction details before proceeding to our encrypted gateway.
        </p>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(49,130,206,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem' }}>MT</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>Marcus Thorne</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Plumbing Specialist</div>
          </div>

          <div style={{ borderTop: '2px dashed var(--outline-variant)', borderBottom: '2px dashed var(--outline-variant)', padding: '1.5rem 0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Service Fee</span>
              <strong>₹800</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Platform Fee</span>
              <strong>₹50</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>Total Secure Payment</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹850</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: '#38a169', marginBottom: '2rem' }}>
          <span className="material-icons" style={{ fontSize: '1.1rem' }}>lock</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>256-bit Encrypted Checkout</span>
        </div>

        <button
          className="btn btn--primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          onClick={async () => {
            if (selectedBid && !emailSent) {
              setEmailSent(true)
              await sendBidAcceptedEmail(selectedBid)
            }
            setView('tracking')
          }}
        >
          Confirm Secure Payment
        </button>
        <button className="btn btn--ghost" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setView('bid_details')}>Cancel</button>
      </div>
    )
  }

  /* ── VIEW 4: JOB STATUS TRACKER ── */
  if (view === 'tracking') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>Job Status</h1>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {/* Left panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>Marcus Thorne</h3>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Plumbing Specialist</div>
              </div>
              <div 
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.4)', transition: 'transform 0.2s' }}
                onClick={() => setView('profile')}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Click to view detailed progress"
              >
                MT
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '1rem' }}>Arrival Estimate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#dd6b20', marginBottom: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                12 <span style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)' }}>mins</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', color: '#38a169' }}>directions_car</span>
                Provider is on the way (Light Traffic on I-35)
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Job Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--on-surface-variant)' }}>Service ID</span><strong>#LX-99284</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--on-surface-variant)' }}>Amount Paid</span><strong style={{ color: '#38a169' }}>₹850 (In Escrow)</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: 'var(--on-surface-variant)' }}>Destination</span><strong>Your Home</strong></div>
              </div>
            </div>
          </div>

          {/* Right panel - Map */}
          <div style={{ flex: 1, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.8rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
              <span className="material-icons" style={{ color: '#e53e3e', fontSize: '1rem' }}>my_location</span>
              Live Tracking
            </div>
            
            {/* Fake map UI */}
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#e0e3e5' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                <path d="M0 20 Q 30 50, 60 10 T 100 80" stroke="var(--primary)" strokeWidth="2" fill="none" />
                <path d="M-10 80 Q 40 40, 80 90 T 110 30" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
                <path d="M20 0 Q 50 20, 30 70 T 80 110" stroke="#dd6b20" strokeWidth="2" fill="none" />
              </svg>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(30px) translateX(-40px)' }}>
                <div style={{ background: '#2d476f', padding: '0.3rem 0.6rem', borderRadius: '4px', color: 'white', fontSize: '0.6rem', fontWeight: 700, marginBottom: '0.3rem', position: 'relative' }}>
                  Marcus
                  <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #2d476f' }} />
                </div>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', border: '3px solid var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }} />
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-20px) translateX(40px)' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(229,62,62,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e53e3e', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '0.3rem', color: '#181c1e', textShadow: '0 1px 2px white' }}>Your Home</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── VIEW 5: JOB IN PROGRESS (Milestones) ── */
  if (view === 'profile') {
    const isJobDone = true; // Simulating job is completed
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button className="btn btn--ghost" onClick={() => setView('tracking')} style={{ marginBottom: '1.5rem', padding: '0.5rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem', marginRight: '6px', verticalAlign: 'middle' }}>arrow_back</span> Back to Tracker
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{isJobDone ? 'Job Ready for Review' : 'Job In Progress'}</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Job ID: #LX-99284 • {isJobDone ? 'Completed 2 mins ago' : 'Started 10 mins ago'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>{isJobDone ? 'task_alt' : 'sync'}</span> {isJobDone ? 'Final Status' : 'Service Progress'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Provider Arrived', desc: 'Verified at 09:45 AM', status: 'done' },
                { label: 'Pre-inspection Complete', desc: 'No issues found', status: 'done' },
                { label: 'Work Executed', desc: 'Main repair finished', status: 'done' },
                { label: 'Quality Check', desc: 'Self-inspection passed', status: 'done' },
                { label: 'Job Complete', desc: 'Awaiting your approval', status: isJobDone ? 'done' : 'active' }
              ].map((m, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: m.status === 'done' ? '#38a169' : m.status === 'active' ? '#dd6b20' : 'var(--outline-variant)',
                      border: m.status === 'active' ? '2px solid rgba(221,107,32,0.3)' : 'none'
                    }}>
                      {m.status === 'done' && <span className="material-icons" style={{ color: 'white', fontSize: '0.9rem' }}>check</span>}
                      {m.status === 'active' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: '2px', height: '40px', background: m.status === 'done' ? '#38a169' : 'var(--outline-variant)', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? '1.5rem' : 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: m.status === 'active' ? 700 : 600, color: m.status === 'upcoming' ? 'var(--outline)' : 'var(--on-surface)' }}>{m.label}</div>
                    {m.desc && <div style={{ fontSize: '0.75rem', color: m.status === 'active' || (isJobDone && i === 4) ? '#38a169' : 'var(--on-surface-variant)', marginTop: '0.2rem' }}>{m.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
            
            {isJobDone && (
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(56,161,105,0.08)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(56,161,105,0.2)' }}>
                <p style={{ fontSize: '0.9rem', color: '#2f855a', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Marcus Richardson has marked the job as complete. Please inspect the work and release the payment if you're satisfied.
                </p>
                <button className="btn btn--primary" style={{ width: '100%', padding: '1rem', background: '#38a169' }} onClick={() => setView('feedback')}>
                  Release Payment & Rate Work
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.8rem', border: '2px solid rgba(255,255,255,0.3)', margin: '0 auto 1rem' }}>MR</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.2rem' }}>Marcus Richardson</h3>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Master HVAC Specialist</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button className="btn btn--outline" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem', borderRadius: '50%' }}><span className="material-icons" style={{ fontSize: '1.1rem' }}>call</span></button>
                <button className="btn btn--outline" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem', borderRadius: '50%' }}><span className="material-icons" style={{ fontSize: '1.1rem' }}>chat</span></button>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.8rem' }}>Job Management</h4>
              <button className="btn btn--outline" style={{ width: '100%', marginBottom: '0.6rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Report an Issue <span className="material-icons" style={{ fontSize: '1rem', color: 'var(--outline)' }}>chevron_right</span>
              </button>
              <button className="btn btn--outline" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e53e3e', borderColor: 'rgba(229,62,62,0.3)' }}>
                Raise Dispute <span className="material-icons" style={{ fontSize: '1rem', color: '#e53e3e' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── VIEW 6: FEEDBACK & RATING ── */
  if (view === 'feedback') {
    const handleTagClick = (tag) => {
      setFeedbackText(prev => prev ? `${prev} • ${tag}` : tag)
    }

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface-container-low)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#38a169' }}>
          <span className="material-icons" style={{ fontSize: '3rem' }}>verified_user</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Payment Released!</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--on-surface-variant)', marginBottom: '2.5rem' }}>
          Thank you for choosing Local Services. Marcus Richardson has been paid ₹850. How was your experience?
        </p>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', border: '1px solid var(--outline-variant)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.8rem', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>MR</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Marcus Richardson</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Master HVAC Specialist</p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--on-surface)' }}>Rate the Service</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  className="material-icons" 
                  style={{ fontSize: '2.5rem', color: star <= rating ? '#f6ad55' : 'var(--outline-variant)', cursor: 'pointer' }}
                  onClick={() => setRating(star)}
                >
                  {star <= rating ? 'star' : 'star_outline'}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.8rem', color: 'var(--on-surface)' }}>Your Feedback</label>
            <textarea 
              placeholder="What did you like about the work? (Optional)"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
            {['Punctual', 'Professional', 'Expert', 'Clean Work', 'Good Value'].map(tag => (
              <span 
                key={tag} 
                onClick={() => handleTagClick(tag)}
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', borderRadius: '100px', border: feedbackText.includes(tag) ? '1px solid var(--primary)' : '1px solid var(--outline-variant)', background: feedbackText.includes(tag) ? 'rgba(49,130,206,0.1)' : 'white', color: feedbackText.includes(tag) ? 'var(--primary)' : 'var(--on-surface)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <button className="btn btn--primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }} onClick={() => setView('success')}>
            Submit Feedback
          </button>
        </div>
      </div>
    )
  }

  /* ── VIEW 7: SUCCESS / RETURN TO HOME ── */
  if (view === 'success') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ background: '#38a169', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'white', boxShadow: '0 20px 40px rgba(56,161,105,0.3)' }}>
          <span className="material-icons" style={{ fontSize: '4rem' }}>check_circle</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>Great Success!</h1>
        <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Your feedback helps us maintain a high standard of service and supports professional experts like Marcus. We hope to see you again soon!
        </p>
        <button className="btn btn--primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-xl)' }} onClick={() => navigate('/dashboard')}>
          Return to Client Dashboard
        </button>
      </div>
    )
  }

  return null
}
