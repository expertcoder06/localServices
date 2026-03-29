import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import ServiceProviderProfile from './ServiceProviderProfile'

const MILESTONES = [
  { id: 'requested', label: 'Job Requested', icon: 'history' },
  { id: 'accepted', label: 'Bid Accepted', icon: 'handshake' },
  { id: 'started', label: 'Work Started', icon: 'play_circle' },
  { id: 'completed', label: 'Work Completed', icon: 'task_alt' },
  { id: 'payment_released', label: 'Payment Released', icon: 'payments' },
]

export default function CurrentWork({ type = 'customer' }) {
  const [activeJob, setActiveJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showComplaint, setShowComplaint] = useState(false)
  const [complaintType, setComplaintType] = useState('other')
  const [complaintText, setComplaintText] = useState('')
  const [isDelayed, setIsDelayed] = useState(false)
  const [viewProfileProvider, setViewProfileProvider] = useState(null)
  
  // Media states for complaint
  const [issuePhoto, setIssuePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [issueAudio, setIssueAudio] = useState(null)
  const [isRecording, setIsRecording] = useState(false) // Simulation

  useEffect(() => {
    fetchActiveJob()
    
    // Real-time updates
    const channel = supabase.channel('current-work-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchActiveJob)
      .subscribe()
      
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchActiveJob() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('jobs').select('*, consumers(name, email), service_providers!accepted_provider_id(name, email, wallet_balance)')

      if (type === 'customer') {
        query = query.eq('consumer_id', user.id).in('status', ['accepted', 'in_progress', 'completed'])
      } else {
        query = query.eq('accepted_provider_id', user.id).in('status', ['accepted', 'in_progress', 'completed'])
      }

      const { data, error } = await query.maybeSingle()
      if (error) throw error
      setActiveJob(data)

      // Check for delay
      if (data && data.promised_completion_at) {
        setIsDelayed(new Date() > new Date(data.promised_completion_at))
      }
    } catch (err) {
      console.error('Error fetching active job:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!activeJob) return
    try {
      const updates = { status: newStatus }
      if (newStatus === 'completed') {
        updates.actual_completion_at = new Date().toISOString()
      }
      
      const { error } = await supabase.from('jobs').update(updates).eq('id', activeJob.id)
      if (error) throw error
      
      if (newStatus === 'payment_released') {
         // Handle wallet update logic here
         const amount = activeJob.budget || 0
         const providerBalance = activeJob.service_providers?.wallet_balance || 0
         await supabase.from('service_providers').update({ wallet_balance: providerBalance + amount }).eq('id', activeJob.accepted_provider_id)
         await supabase.from('jobs').update({ status: 'finished' }).eq('id', activeJob.id)
      }
      
      fetchActiveJob()
    } catch (err) {
      alert('Failed to update status: ' + err.message)
    }
  }

  const handleComplaint = async () => {
    if (!complaintText) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. Log the complaint with evidence placeholders
      await supabase.from('complaints').insert([{
        job_id: activeJob.id,
        user_id: user.id,
        user_type: type,
        issue_type: complaintType,
        description: complaintText,
        photo_proof: photoPreview, // Store base64 for demo
        audio_proof: issueAudio ? 'audio_provided' : null,
        status: 'pending'
      }])

      // 2. Penalty Logic
      if (type === 'customer' && complaintType === 'no_show') {
         // Log a penalty for the provider
         await supabase.from('penalties').insert([{
           user_id: activeJob.accepted_provider_id,
           user_type: 'provider',
           job_id: activeJob.id,
           penalty_type: 'no_show',
           wallet_deduction: 200,
           description: 'Automated penalty for reported provider no-show.'
         }])
         
         const currentBal = activeJob.service_providers?.wallet_balance || 0
         await supabase.from('service_providers').update({ wallet_balance: currentBal - 200 }).eq('id', activeJob.accepted_provider_id)
         
         alert('Complaint & Proof submitted. A ₹200 no-show penalty has been applied to the provider.')
      } else {
         alert('Report & Proof submitted successfully. Admin will review the evidence and decide on penalties within 24 hours.')
      }

      setShowComplaint(false)
      setComplaintText('')
      setComplaintType('other')
      setIssuePhoto(null)
      setPhotoPreview(null)
      setIssueAudio(null)
    } catch (err) {
      alert('Failed to submit report: ' + err.message)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setIssuePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Loading active work...</div>

  if (!activeJob) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--outline-variant)' }}>
        <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--outline-variant)', marginBottom: '1rem' }}>engineering</span>
        <h3 style={{ fontWeight: 700 }}>No current work active</h3>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
          {type === 'customer' 
            ? "When a provider accepts your request, it will appear here for tracking." 
            : "When a customer accepts your bid, it will appear here for execution."}
        </p>
      </div>
    )
  }

  const currentStep = activeJob.status === 'requested' ? 0
                    : activeJob.status === 'accepted' ? 1 
                    : activeJob.status === 'in_progress' ? 2 
                    : activeJob.status === 'completed' ? 3 
                    : activeJob.status === 'payment_released' || activeJob.status === 'finished' ? 4
                    : 0

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>⚡ Current Work</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Track and manage your ongoing project in real-time.</p>
        </div>
        <div style={{ background: 'rgba(56,161,105,0.1)', color: '#38a169', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38a169', animation: 'pulse 1.5s infinite' }} />
          {type === 'provider' ? 'Engaged' : 'Active Project'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Left: Progress & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Job Info Header */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{activeJob.title}</h3>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{activeJob.budget}</div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--outline-variant)', paddingTop: '1rem' }}>
                <div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase' }}>Requested At</div>
                   <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(activeJob.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                <div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase' }}>Accepted At</div>
                   <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeJob.accepted_at ? new Date(activeJob.accepted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending'}</div>
                </div>
             </div>
          </div>

          {/* Animated Stepper */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h4 style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>timeline</span>
                Project Timeline
              </h4>
              <button 
                onClick={() => setShowComplaint(true)}
                style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span className="material-icons" style={{ fontSize: '1rem' }}>report_problem</span>
                Report Issue
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
              {/* Progress Line */}
              <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '4px', background: 'var(--outline-variant)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '24px', left: '40px', width: `${(currentStep / (MILESTONES.length - 1)) * 80}%`, height: '4px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.5s ease' }} />
              
              {MILESTONES.map((m, i) => {
                const isCompleted = i <= currentStep
                const isActive = i === currentStep
                
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', zIndex: 1, width: '60px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', background: isCompleted ? 'var(--primary)' : '#fff',
                      border: `3px solid ${isCompleted ? 'var(--primary)' : 'var(--outline-variant)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isCompleted ? '#fff' : 'var(--outline)',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 15px rgba(49,130,206,0.4)' : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      <span className="material-icons" style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textAlign: 'center', color: isCompleted ? 'var(--on-surface)' : 'var(--outline)', textTransform: 'uppercase' }}>
                      {m.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contextual Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {type === 'provider' ? (
              <>
                {activeJob.status === 'accepted' && (
                  <button className="btn btn--primary" style={{ flex: 1, padding: '1rem' }} onClick={() => handleUpdateStatus('in_progress')}>Start Work</button>
                )}
                {activeJob.status === 'in_progress' && (
                  <button className="btn btn--primary" style={{ flex: 1, padding: '1rem' }} onClick={() => handleUpdateStatus('completed')}>Mark as Completed</button>
                )}
                {activeJob.status === 'completed' && (
                  <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
                     Waiting for Customer to release payment...
                  </div>
                )}
              </>
            ) : (
              <>
                {activeJob.status === 'completed' && (
                  <button className="btn btn--primary" style={{ flex: 1, padding: '1rem' }} onClick={() => handleUpdateStatus('payment_released')}>Approve & Release Payment</button>
                )}
                {activeJob.status !== 'completed' && (
                   <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
                      Project in Progress...
                   </div>
                )}
              </>
            )}
            
            <button className="btn btn--outline" style={{ padding: '1rem', flex: 1 }} onClick={() => setShowComplaint(true)}>
              <span className="material-icons" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }}>chat_bubble_outline</span>
              Message Support
            </button>
            <button 
              className="btn" 
              style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#e53e3e', padding: '1rem', border: '1px solid #e53e3e', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }} 
              onClick={() => setShowComplaint(true)}
            >
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>report_problem</span>
              Report Problem
            </button>
          </div>
          
          {isDelayed && type === 'customer' && (
            <div style={{ background: 'rgba(221,107,32,0.1)', border: '1px solid #dd6b20', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className="material-icons" style={{ color: '#dd6b20' }}>timer_off</span>
                  <div>
                     <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#dd6b20' }}>Project Delayed</div>
                     <div style={{ fontSize: '0.75rem', color: '#7b341e' }}>The provider has missed the promised deadline. You are eligible for a 15% discount.</div>
                  </div>
               </div>
               <button 
                className="btn btn--outline" 
                style={{ borderColor: '#dd6b20', color: '#dd6b20', fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                onClick={() => {
                  setComplaintType('delay')
                  setComplaintText('The provider exceeded the promised completion time.')
                  setShowComplaint(true)
                }}
               >Apply Penalty</button>
            </div>
          )}
        </div>

        {/* Right: Details & Parties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div 
            onClick={() => type === 'customer' && setViewProfileProvider(activeJob.service_providers)}
            style={{ 
              background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)',
              cursor: type === 'customer' ? 'pointer' : 'default',
              transition: 'transform 0.2s'
            }}
          >
             <h4 style={{ fontSize: '0.8rem', color: 'var(--outline)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
               {type === 'customer' ? 'Service Provider' : 'Customer'}
             </h4>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>
                   {type === 'customer' ? activeJob.service_providers?.name?.[0] : activeJob.consumers?.name?.[0]}
                </div>
                <div>
                   <div style={{ fontWeight: 700 }}>{type === 'customer' ? activeJob.service_providers?.name : activeJob.consumers?.name}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{type === 'customer' ? 'Verified Expert' : 'Homeowner'}</div>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn--outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>
                  <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>chat</span> Message
                </button>
                <button className="btn btn--outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>
                  <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>call</span> Call
                </button>
             </div>
          </div>

          {/* Job Description */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
             <h4 style={{ fontSize: '0.8rem', color: 'var(--outline)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.8rem' }}>Description</h4>
             <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{activeJob.description || 'No description provided.'}</p>
          </div>

          {/* Security Banner */}
          <div style={{ background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)', borderRadius: 'var(--radius-xl)', padding: '1.2rem', color: 'white' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="material-icons" style={{ color: '#F6AD55', fontSize: '1.1rem' }}>shield</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Payment Protection</span>
             </div>
             <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
               Funds are held in escrow and only released when the customer marks the work as satisfactory.
             </p>
          </div>
        </div>
      </div>

       {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setShowComplaint(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#e53e3e', color: 'white', border: 'none',
          boxShadow: '0 8px 32px rgba(229, 62, 62, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 100, transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(229, 62, 62, 0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(229, 62, 62, 0.4)'; }}
      >
        <span className="material-icons" style={{ fontSize: '2rem' }}>report_problem</span>
      </button>

      {/* Complaint Modal */}
      {showComplaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
           <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Report Issue</h3>
                <span className="material-icons" style={{ cursor: 'pointer', color: 'var(--outline)' }} onClick={() => setShowComplaint(false)}>close</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 {/* Category */}
                 <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}>What is the issue?</label>
                    <select 
                      value={complaintType} 
                      onChange={e => setComplaintType(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', outline: 'none', background: '#f8f9fa' }}
                    >
                        <option value="other">General Complaint</option>
                        <option value="no_show">Provider No-Show (Immediate Penalty)</option>
                        <option value="delay">Excessive Delay</option>
                        <option value="quality">Poor Quality Work</option>
                        <option value="behavior">Unprofessional Behavior</option>
                        <option value="payment">Payment Issue</option>
                    </select>
                 </div>

                 {/* Description */}
                 <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}>Details</label>
                    <textarea 
                      value={complaintText}
                      onChange={e => setComplaintText(e.target.value)}
                      placeholder="Explain exactly what happened..."
                      style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '0.5rem', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
                    />
                 </div>

                 {/* Photo Proof */}
                 <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.8rem' }}>Photo Proof (optional)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ cursor: 'pointer', background: 'var(--surface-container-low)', border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-icons" style={{ color: 'var(--outline)' }}>add_a_photo</span>
                        )}
                        <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                      </label>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                        Attached photos will be used by admin to verify the claims.
                      </div>
                    </div>
                 </div>

                 {/* Audio Proof */}
                 <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.8rem' }}>Audio Proof (optional)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <button 
                        className={`btn ${isRecording ? 'btn--primary' : 'btn--outline'}`} 
                        style={{ background: isRecording ? '#e53e3e' : '', borderColor: isRecording ? '#e53e3e' : '', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => {
                          setIsRecording(!isRecording)
                          if (!isRecording) setIssueAudio('simulated_audio_data')
                        }}
                       >
                         <span className="material-icons" style={{ fontSize: '1.2rem' }}>{isRecording ? 'stop_circle' : 'mic'}</span>
                         {isRecording ? 'Recording...' : (issueAudio ? 'Recorded' : 'Record Proof')}
                       </button>
                       {issueAudio && !isRecording && (
                         <span className="material-icons" style={{ color: '#38a169', fontSize: '1.2rem' }}>check_circle</span>
                       )}
                    </div>
                 </div>
              </div>

              <div style={{ marginTop: '2.5rem', background: 'rgba(229, 62, 62, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(229, 62, 62, 0.2)', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#742a2a', lineHeight: 1.5 }}>
                  <strong>Admin Mediation:</strong> Your report and proof will be reviewed by our trust & safety team. False reporting may lead to account suspension.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowComplaint(false)}>Cancel</button>
                 <button className="btn btn--primary" style={{ flex: 1, background: '#e53e3e' }} onClick={handleComplaint}>Submit Report</button>
              </div>
           </div>
        </div>
      )}

      {/* Profile Modal Render */}
      {viewProfileProvider && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '1000px', maxHeight: '90vh',
            borderRadius: 'var(--radius-xl)', overflowY: 'auto', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setViewProfileProvider(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="material-icons">close</span>
            </button>
            <div style={{ padding: '3rem 2rem 2rem' }}>
              <ServiceProviderProfile provider={viewProfileProvider} isEditable={false} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(56, 161, 105, 0); }
          100% { box-shadow: 0 0 0 0 rgba(56, 161, 105, 0); }
        }
      `}</style>
    </div>
  )
}
