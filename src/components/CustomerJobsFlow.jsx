import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

const CUSTOMER_NAME = 'You'

async function sendBidAcceptedEmail(provider, jobTitle) {
  try {
    await fetch('http://localhost:5000/send-bid-accepted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerEmail: provider.email,
        providerName:  provider.name,
        jobTitle:      jobTitle,
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
  const [view, setView] = useState('job_list')
  const [selectedBid, setSelectedBid] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(4)
  const [emailSent, setEmailSent] = useState(false)
  const [jobs, setJobs] = useState([])
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [bidCounts, setBidCounts] = useState({})

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      if (authUser) {
        fetchJobAndBids(authUser.id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])

  async function fetchJobAndBids(userId) {
    setLoading(true)
    try {
      // 1. Get all jobs for this consumer
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('consumer_id', userId)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError
      setJobs(jobsData || [])

      if (jobsData && jobsData.length > 0) {
        // 2. Get bid counts for all jobs
        const { data: countsData, error: countsError } = await supabase
          .from('bids')
          .select('job_id')
          .in('job_id', jobsData.map(j => j.id))

        if (countsError) throw countsError
        
        const counts = {}
        countsData.forEach(b => {
          counts[b.job_id] = (counts[b.job_id] || 0) + 1
        })
        setBidCounts(counts)

        // 3. For the latest/selected job, fetch detailed bids if in bids view
        if (view === 'bids' && jobsData[0]) {
           fetchBids(jobsData[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching job/bids:', err)
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const jobsChannel = supabase
      .channel('jobs-realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'jobs', 
        filter: `consumer_id=eq.${user.id}` 
      }, (payload) => {
        setJobs(prev => [payload.new, ...prev])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `consumer_id=eq.${user.id}`
      }, (payload) => {
        setJobs(prev => prev.map(j => j.id === payload.new.id ? payload.new : j))
      })
      .subscribe()

    const bidsChannel = supabase
      .channel('bids-realtime')
      .on('postgres_changes', {
        event: '*', // Listen to all bid changes
        schema: 'public',
        table: 'bids',
      }, (payload) => {
        const jobId = payload.new?.job_id || payload.old?.job_id
        if (!jobId) return

        // Update bid counts
        setBidCounts(prev => {
          const newCounts = { ...prev }
          if (payload.eventType === 'INSERT') {
            newCounts[jobId] = (newCounts[jobId] || 0) + 1
          } else if (payload.eventType === 'DELETE') {
            newCounts[jobId] = Math.max(0, (newCounts[jobId] || 1) - 1)
          }
          return newCounts
        })
        
        // Refresh detailed bids if it's the active job
        const activeJob = selectedJob || (jobs.length > 0 ? jobs[0] : null)
        if (activeJob && jobId === activeJob.id) {
          fetchBids(activeJob.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(bidsChannel)
    }
  }, [user, selectedJob, jobs, view])

  const handleAcceptBid = async (bid) => {
    try {
      const activeJob = jobs.find(j => j.id === bid.job_id) || selectedJob || jobs[0]
      if (!activeJob) throw new Error('Job not found')

      // 1. Update bid status
      const { error: bidUpdateError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bid.id)
      
      if (bidUpdateError) throw bidUpdateError

      // 2. Update job status
      const { error: jobUpdateError } = await supabase
        .from('jobs')
        .update({ status: 'accepted' })
        .eq('id', activeJob.id)
      
      if (jobUpdateError) throw jobUpdateError

      // 3. Send email notification
      if (bid.service_providers) {
        await sendBidAcceptedEmail({
          email: bid.service_providers.email,
          name: bid.service_providers.name,
          hourly_rate: bid.amount
        }, activeJob.title)
      }

      setSelectedBid(bid)
      setView('payment')
    } catch (err) {
      console.error('Error accepting bid:', err)
      alert('Failed to accept bid: ' + err.message)
    }
  }

  if (view === 'bids') {
    const activeJob = selectedJob || jobs[0]
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {loading ? '⏳ Loading Bids...' : activeJob ? `🔥 ${bidCounts[activeJob.id] || 0} Bid${(bidCounts[activeJob.id] || 0) !== 1 ? 's' : ''} for "${activeJob.title}"` : 'No Active Job Requests'}
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
          Expert professionals are ready to assist you. Review their proposals and hire the best match for your project.
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Fetching your bids...</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Active Requests</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>You haven't posted any job requests yet. Post a request to start receiving bids!</p>
          </div>
        )}

        {!loading && jobs.length > 0 && bids.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⌛</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Waiting for Bids</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Providers are reviewing your request. You'll see bids here as soon as they arrive.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bids.map((bid, i) => {
            const provider = bid.service_providers || {}
            const initials = provider.name
              ? provider.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              : '??'
            const trustScore = provider.trust_score ?? 0
            const isHighTrust = trustScore >= 8.5
            const location = [provider.city, provider.state].filter(Boolean).join(', ')
            const serviceLabel = provider.categories?.[0] || 'Professional Service'

            return (
              <div key={bid.id} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)', boxShadow: i === 0 ? 'var(--shadow-sm)' : 'none' }}>
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
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{provider.name || 'Anonymous Provider'}</h3>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{bid.amount}
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

                    <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{serviceLabel}</p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn btn--outline" style={{ flex: 1, padding: '0.6rem' }}>View Profile</button>
                      <button className="btn btn--primary" style={{ flex: 2, padding: '0.6rem' }} onClick={() => handleAcceptBid(bid)}>Accept Bid</button>
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

  const fetchBids = async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          provider:service_providers(id, name, role, email, trust_score)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBids(data || [])
    } catch (err) {
      console.error('Error fetching bids:', err)
    }
  }

  const handleJobClick = async (job) => {
    setSelectedJob(job)
    await fetchBids(job.id)
    setView('bid_list')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="loader">Loading...</div>
      </div>
    )
  }




  /* ── VIEW 0: JOB LIST ── */
  if (view === 'job_list') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>My Service Requests</h1>
        
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
            <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--outline-variant)', marginBottom: '1.5rem' }}>assignment_late</span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>No Requests Yet</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>You haven't posted any service requests yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => handleJobClick(job)}
                style={{ 
                  background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.2rem 1.5rem', 
                  border: '1px solid var(--outline-variant)', cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', background: 'var(--primary-container)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '40px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {job.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{job.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{job.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>₹{job.budget}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dd6b20', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>gavel</span>
                    {bidCounts[job.id] || 0} Bids
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ── VIEW 1: BIDS RECEIVED ── */
  if (view === 'bid_list') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>
        <button className="btn btn--ghost" onClick={() => setView('job_list')} style={{ marginBottom: '1.5rem', padding: '0.5rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem', marginRight: '6px', verticalAlign: 'middle' }}>arrow_back</span> Back to Requests
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🔥 {bids.length} Bid{bids.length !== 1 ? 's' : ''} Received</h1>
        </div>
        <div style={{ background: 'var(--surface-container-low)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--outline-variant)' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>For Request</h4>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedJob?.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{selectedJob?.description}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--outline)' }}>
              <p style={{ color: 'var(--on-surface-variant)' }}>No bids received yet. Professionals have been notified and will respond shortly.</p>
            </div>
          ) : (
            bids.map(bid => (
              <div key={bid.id} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', 
                    background: 'rgba(49,130,206,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#3182ce', fontWeight: 700, fontSize: '1.2rem' 
                  }}>
                    {bid.provider?.name?.charAt(0) || 'P'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{bid.provider?.name || 'Service Provider'}</h3>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{bid.amount}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(56,161,105,0.1)', color: '#38a169', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 700 }}>
                        Trust: {bid.provider?.trust_score || 'N/A'}/10
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 600 }}>
                        {bid.provider?.role || 'Expert'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{bid.message || 'I would like to help you with this project.'}"
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn btn--outline" style={{ flex: 1, padding: '0.6rem' }}>View Profile</button>
                      <button className="btn btn--primary" style={{ flex: 2, padding: '0.6rem' }} onClick={() => setView('payment')}>Accept Proposal</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (view === 'payment') {
      return (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
          <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '1rem' }}>payments</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Secure Payment</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Proceeding to secure payment for the selected bid. Funds will be held in escrow.</p>
          <button className="btn btn--primary" style={{ width: '100%', padding: '1rem' }} onClick={() => setView('success')}>Confirm Payment</button>
          <button className="btn btn--ghost" style={{ display: 'block', margin: '1rem auto' }} onClick={() => setView('bid_list')}>Cancel</button>
        </div>
      )
  }

  if (view === 'success') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ background: '#38a169', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'white', boxShadow: '0 20px 40px rgba(56,161,105,0.3)' }}>
          <span className="material-icons" style={{ fontSize: '4rem' }}>check_circle</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>Booking Confirmed!</h1>
        <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Your payment is held in escrow. The professional will reach out to you shortly to start the work.
        </p>
        <button className="btn btn--primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-xl)' }} onClick={() => setView('job_list')}>
          Manage Bookings
        </button>
      </div>
    )
  }

  return null
}
