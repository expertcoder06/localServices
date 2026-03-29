import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import ServiceProviderProfile from './ServiceProviderProfile'
import axios from 'axios'

const EMAIL_SERVER = 'http://localhost:5000'

// ── Email helper: bid accepted → provider gets congratulations email
async function sendBidAcceptedEmail({ providerEmail, providerName, jobTitle, customerName, amount }) {
  try {
    const res = await axios.post(`${EMAIL_SERVER}/send-bid-accepted`, { providerEmail, providerName, jobTitle, customerName, amount })
    if (res.status !== 200) console.warn('Bid-accepted email server responded:', res.status)
  } catch (err) {
    console.error('Failed to send bid-accepted email:', err)
  }
}

export default function CustomerJobsFlow({ onAcceptSuccess }) {
  const [view, setView] = useState('job_list')
  const [selectedBid, setSelectedBid] = useState(null)
  const [jobs, setJobs] = useState([])
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [customerName, setCustomerName] = useState('Customer')
  const [selectedJob, setSelectedJob] = useState(null)

  const [viewProfileProvider, setViewProfileProvider] = useState(null)

  useEffect(() => {
    let subscription;
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      if (authUser) {
        // Fetch consumer profile for name + email used in email notifications
        const { data: consumerData } = await supabase
          .from('consumers')
          .select('name')
          .eq('id', authUser.id)
          .maybeSingle()
        if (consumerData?.name) setCustomerName(consumerData.name)
        fetchJobAndBids(authUser.id)
      } else {
        setLoading(false)
      }
    }
    init()
    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [])

  async function fetchJobAndBids(userId) {
    setLoading(true)
    try {
      const { data: jobsData, error: jobsErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('consumer_id', userId)
        .order('created_at', { ascending: false })

      if (jobsErr) throw jobsErr
      setJobs(jobsData || [])

      // Fetch bid counts for all jobs
      if (jobsData && jobsData.length > 0) {
        const { data: bidsData, error: bidsErr } = await supabase
          .from('bids')
          .select('job_id')
          .in('job_id', jobsData.map(j => j.id))

        if (bidsErr) throw bidsErr

        // Note: bid counts calculated but not used in UI

        const activeJob = jobsData[0]

        // 3. Start bid reminder emails if bids exist and job is still pending
        if (bidsData && bidsData.length > 0 && activeJob.status === 'pending') {
          const { data: consumer } = await supabase
            .from('consumers')
            .select('email, name')
            .eq('id', userId)
            .single()

          axios.post('https://api-node-emailverification.onrender.com/start-bid-alert', {
              jobId: activeJob.id,
              consumerEmail: consumer?.email,
              consumerName: consumer?.name,
              jobTitle: activeJob.title,
          }).catch(err => console.warn('Bid alert start failed:', err))
        }
        return activeJob
      }
    } catch (err) {
      console.error('Error fetching jobs/bids:', err)
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

      // 1. Update bid status to accepted
      const { error: bidUpdateError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bid.id)
      if (bidUpdateError) throw bidUpdateError

      // 2. Update job status to accepted with timestamp
      const { error: jobUpdateError } = await supabase
        .from('jobs')
        .update({ status: 'accepted', accepted_at: new Date().toISOString(), accepted_provider_id: bid.provider_id })
        .eq('id', activeJob.id)
      if (jobUpdateError) throw jobUpdateError

      // 3. Fetch provider email if not already available (handles both bid formats)
      const providerEmail = bid.service_providers?.email || bid.provider?.email
      const providerName  = bid.service_providers?.name  || bid.provider?.name || 'Service Provider'

      if (providerEmail) {
        // Fire-and-forget — don't block UI on email
        sendBidAcceptedEmail({
          providerEmail,
          providerName,
          jobTitle:     activeJob.title,
          customerName,
          amount:       bid.amount,
        })
      }

      setSelectedBid(bid)
      setView('payment')
    } catch (err) {
      console.error('Error accepting bid:', err)
      alert('Failed to accept bid: ' + err.message)
    }
  }


  const fetchBids = async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          provider:service_providers(*)
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
                      Booked: {new Date(job.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{job.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>{job.location}</p>
                  
                  {job.status === 'accepted' && job.accepted_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38a169', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span className="material-icons" style={{ fontSize: '0.9rem' }}>check_circle</span>
                      Accepted: {new Date(job.accepted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>₹{job.budget}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dd6b20', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.4rem' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>gavel</span>
                    {job.status === 'accepted' ? 'View Details' : 'View Bids'}
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
      <>
      <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>
        <button className="btn btn--ghost" onClick={() => setView('job_list')} style={{ marginBottom: '1.5rem', padding: '0.5rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem', marginRight: '6px', verticalAlign: 'middle' }}>arrow_back</span> Back to Requests
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🔥 {bids.length} Bid{bids.length !== 1 ? 's' : ''} Received</h1>
        </div>
        <div style={{ background: 'var(--surface-container-low)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--outline-variant)' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>For Request</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedJob.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{selectedJob.description}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--outline)' }}>
                <div>Booked: {new Date(selectedJob.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                {selectedJob.accepted_at && <div style={{ color: '#38a169', fontWeight: 600 }}>Accepted: {new Date(selectedJob.accepted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>}
              </div>
            </div>
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
                  <div 
                    onClick={() => setViewProfileProvider(bid.provider)}
                    style={{ 
                      width: '56px', height: '56px', borderRadius: '50%', 
                      background: 'rgba(49,130,206,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: '#3182ce', fontWeight: 700, fontSize: '1.2rem',
                      cursor: 'pointer'
                    }}>
                    {bid.provider?.name?.charAt(0) || 'P'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 
                        onClick={() => setViewProfileProvider(bid.provider)}
                        style={{ fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>{bid.provider?.name || 'Service Provider'}</h3>
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
                      <button className="btn btn--outline" style={{ flex: 1, padding: '0.6rem' }} onClick={() => setViewProfileProvider(bid.provider || bid.service_providers)}>View Profile</button>
                      <button className="btn btn--primary" style={{ flex: 2, padding: '0.6rem' }} onClick={() => handleAcceptBid(bid)}>Accept Proposal</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Profile Modal Render */}
      {viewProfileProvider && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '2rem 1rem', overflowY: 'auto'
        }}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: '1000px',
            background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease-out'
          }}>
            <button 
              onClick={() => setViewProfileProvider(null)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'var(--surface-container-high)', border: 'none',
                color: 'var(--on-surface-variant)', width: '36px', height: '36px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10
              }}
            >
              <span className="material-icons">close</span>
            </button>
            <div style={{ padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
              <ServiceProviderProfile provider={viewProfileProvider} isEditable={false} />
            </div>
          </div>
        </div>
      )}
    </>
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

  if (view === 'tracking') {
    const job = selectedJob || jobs[0]
    const isOverdue = job?.promised_completion_at && new Date() > new Date(job.promised_completion_at)
    
    const handleReleasePayment = async () => {
      try {
        const bid = selectedBid || bids.find(b => b.status === 'accepted')
        const baseAmount = bid?.amount || job.budget || 0
        let penaltyAmount = 0
        let penaltyDesc = ''

        // Delay Penalty: 10% deduction if overdue
        if (isOverdue) {
          penaltyAmount = baseAmount * 0.15 
          penaltyDesc = 'Provider deadline missed (15% penalty)'
        }

        const finalAmount = baseAmount - penaltyAmount

        // 1. Log Penalty if any
        if (penaltyAmount > 0) {
          await supabase.from('penalties').insert([{
            user_id: job.accepted_provider_id,
            user_type: 'provider',
            job_id: job.id,
            penalty_type: 'provider_deadline_missed',
            wallet_deduction: penaltyAmount,
            description: penaltyDesc
          }])
        }

        // 2. Update Provider Wallet
        const { data: pro } = await supabase.from('service_providers').select('wallet_balance').eq('id', job.accepted_provider_id).single()
        await supabase.from('service_providers').update({ wallet_balance: (pro?.wallet_balance || 0) + finalAmount }).eq('id', job.accepted_provider_id)

        // 3. Update Job
        await supabase.from('jobs').update({ status: 'completed', actual_completion_at: new Date().toISOString() }).eq('id', job.id)

        alert(penaltyAmount > 0 ? `Payment released with ₹${penaltyAmount} penalty for delay.` : 'Payment released successfully!')
        setView('success')
      } catch (err) {
        alert('Action failed: ' + err.message)
      }
    }

    const handleCancelJob = async () => {
      if (!window.confirm('Cancelling after acceptance incurs a ₹100 penalty. Proceed?')) return
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        // 1. Deduct from Customer
        const { data: consumer } = await supabase.from('consumers').select('wallet_balance').eq('id', user.id).single()
        await supabase.from('consumers').update({ wallet_balance: (consumer?.wallet_balance || 0) - 100 }).eq('id', user.id)

        // 2. Log Penalty
        await supabase.from('penalties').insert([{
          user_id: user.id,
          user_type: 'customer',
          job_id: job.id,
          penalty_type: 'customer_cancel_after_dispatch',
          wallet_deduction: 100,
          description: 'Job cancelled by customer after provider acceptance.'
        }])

        // 3. Reset Job
        await supabase.from('jobs').update({ status: 'cancelled', cancelled_by: user.id, cancelled_at: new Date().toISOString() }).eq('id', job.id)

        alert('Job cancelled. ₹100 penalty deducted from your wallet.')
        setView('job_list')
      } catch (err) {
        alert('Cancellation failed: ' + err.message)
      }
    }

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>🔥 Job Tracking</h1>
        
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
             <div>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{job?.title}</h3>
               <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Provider: {selectedBid?.service_providers?.name || 'Assigned'}</p>
             </div>
             <div style={{ background: isOverdue ? 'rgba(229,62,62,0.1)' : 'rgba(56,161,105,0.1)', color: isOverdue ? '#e53e3e' : '#38a169', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
               {isOverdue ? '⚠️ DELAYED' : '✅ ON TRACK'}
             </div>
          </div>

          <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estimate Completion By</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{job?.promised_completion_at ? new Date(job.promised_completion_at).toLocaleTimeString() : 'In Progress'}</div>
          </div>

          <button className="btn btn--primary" style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }} onClick={handleReleasePayment}>
             Complete Work & Release Payment
          </button>
          
          <button className="btn btn--ghost" style={{ width: '100%', color: '#e53e3e' }} onClick={handleCancelJob}>
             Cancel Work (₹100 Penalty)
          </button>
        </div>
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
          Your payment is held in escrow. The professional will reach out to you shortly to start the work. You can now track the project in real-time.
        </p>
        <button 
          className="btn btn--primary" 
          style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-xl)', marginBottom: '1rem' }} 
          onClick={() => {
            if (onAcceptSuccess) {
              onAcceptSuccess()
            } else {
              setView('job_list')
            }
          }}
        >
          Track My Work
        </button>
        <button className="btn btn--ghost" style={{ width: '100%', padding: '0.8rem' }} onClick={() => setView('job_list')}>
          Manage Bookings
        </button>
      </div>
    )
  }

  return null
}
