import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'

const CATEGORIES = [
  { icon: 'plumbing',          label: 'Plumbing',        color: '#2b6cb0' },
  { icon: 'bolt',              label: 'Electrical',      color: '#d69e2e' },
  { icon: 'cleaning_services', label: 'Cleaning',        color: '#38a169' },
  { icon: 'ac_unit',           label: 'AC Repair',       color: '#319795' },
  { icon: 'build',             label: 'Carpentry',       color: '#805ad5' },
  { icon: 'format_paint',      label: 'Painting',        color: '#dd6b20' },
  { icon: 'fitness_center',    label: 'Personal Trainer',color: '#e53e3e' },
  { icon: 'design_services',   label: 'Interior Design', color: '#9f7aea' },
  { icon: 'pest_control',      label: 'Pest Control',    color: '#38a169' },
  { icon: 'camera_indoor',     label: 'CCTV / Security', color: '#e53e3e' },
  { icon: 'local_dining',      label: 'Catering',        color: '#d69e2e' },
  { icon: 'spa',               label: 'Yoga / Wellness', color: '#3182ce' },
  { icon: 'more_horiz',        label: 'Others',          color: '#718096' },
]

const RECENT = ['Home Renovation', 'Gardening']

const STEPS = [
  'Select Service',
  'Describe Job',
  'Budget & Time',
  'Location',
  'Review',
  'Waiting for Bids',
]

/* ── Step Progress Bar ─────────────────────────────────── */
function StepBar({ step }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STEPS.slice(0, 5).map((label, i) => {
          const num = i + 1
          const done = step > num
          const active = step === num
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 4 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem',
                  background: done ? '#38a169' : active ? 'var(--primary)' : 'var(--outline-variant)',
                  color: done || active ? 'white' : 'var(--on-surface-variant)',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}>
                  {done ? <span className="material-icons" style={{ fontSize: '1rem' }}>check</span> : num}
                </div>
                <span style={{ fontSize: '0.6rem', color: active ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < 4 && (
                <div style={{
                  flex: 1, height: '2px', margin: '0 4px', marginBottom: '14px',
                  background: done ? '#38a169' : 'var(--outline-variant)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Shared Modal Shell ────────────────────────────────── */
function ModalShell({ step, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-container-lowest)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {step <= 5 && <StepBar step={step} />}
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────── */
export default function PostRequestFlow({ onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    service: '',
    title: '',
    description: '',
    photos: false,
    audio: false,
    budgetMin: '',
    budgetMax: '',
    timeline: 'flexible',
    date: '',
    location: 'Sector 21, Gurgaon',
    radius: '5',
  })
  const [search, setSearch] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const [isLocating, setIsLocating] = useState(false)

  // Audio Playback logic
  const toggleAudio = () => {
    if (!form.audio) return
    if (!audioRef.current) {
      audioRef.current = new Audio(form.audio)
      audioRef.current.onended = () => setIsPlaying(false)
    }
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(false) // Trigger re-render if needed or use state
      setIsPlaying(true)
    }
  }

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        const data = await response.json()
        const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        update('location', address)
      } catch (err) {
        console.error("Geocoding error", err)
        update('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
      } finally {
        setIsLocating(false)
      }
    }, (err) => {
      console.error("Location error", err)
      alert("Unable to retrieve your location. Please check permissions.")
      setIsLocating(false)
    })
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in to post a request.')
        return
      }

      // First, ensure the user exists in the consumers table
      // (This is a safety check because auth.uid() might not be in consumers yet in some edge cases)
      const { data: consumer, error: fetchError } = await supabase
        .from('consumers')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (!consumer) {
        // Create consumer profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('consumers')
          .insert([{ id: user.id, name: user.user_metadata?.full_name || 'Consumer' }])
        if (insertError) throw insertError
      }

      // Geocode the location to get lat/lng
      let latitude = null, longitude = null
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`)
        const geoData = await geoRes.json()
        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat)
          longitude = parseFloat(geoData[0].lon)
        }
      } catch (geoErr) {
        console.warn('Geocoding failed, posting without coordinates:', geoErr)
      }

      const { error } = await supabase.from('jobs').insert([{
        consumer_id: user.id,
        title: form.title,
        description: form.description,
        category: form.service,
        location: form.location,
        budget: parseFloat(form.budgetMax) || parseFloat(form.budgetMin) || 0,
        status: 'pending',
        latitude,
        longitude
      }])

      if (error) throw error
      setStep(6)
    } catch (err) {
      console.error('Error publishing job:', err)
      alert('Failed to publish job: ' + err.message)
    } finally {
      setIsPublishing(false)
    }
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        update('audio', audioUrl)
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone permission denied", err)
      alert("Microphone access is required to record audio.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
  }

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mediaRecorder])

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.9rem', fontSize: '0.88rem',
    border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-md)',
    outline: 'none', background: '#fff', color: 'var(--on-surface)',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem' }

  /* filter categories by search */
  const filtered = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase())
  )

  /* ─── Step 1: Select Service ─── */
  const Step1 = (
    <>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>What service do you need?</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '1.2rem' }}>Search or pick from popular categories below.</p>

      {/* search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <span className="material-icons" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.1rem' }}>search</span>
        <input
          style={{ ...inputStyle, paddingLeft: '2.4rem' }}
          placeholder="Search a service…"
          value={search}
          onChange={e => { setSearch(e.target.value); update('service', e.target.value) }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
        />
      </div>

      {/* popular categories */}
      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>Popular Categories</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {filtered.map(cat => (
          <div
            key={cat.label}
            onClick={() => { update('service', cat.label); setStep(2) }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
              padding: '0.8rem 0.4rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              border: form.service === cat.label ? `2px solid ${cat.color}` : '1.5px solid var(--outline-variant)',
              background: form.service === cat.label ? `color-mix(in srgb, ${cat.color} 8%, transparent)` : '#fff',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${cat.color} 12%, transparent)` }}>
              <span className="material-icons" style={{ color: cat.color, fontSize: '1.1rem' }}>{cat.icon}</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', color: 'var(--on-surface)' }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* recent */}
      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Recent Searches</h4>
      <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginBottom: '0.6rem' }}>Quickly pick up where you left off.</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {RECENT.map(r => (
          <button
            key={r}
            onClick={() => { update('service', r); setStep(2) }}
            style={{ padding: '0.35rem 0.9rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container)', cursor: 'pointer', color: 'var(--on-surface)' }}
          >
            <span className="material-icons" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '3px', color: 'var(--outline)' }}>history</span>
            {r}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn--ghost" onClick={onClose} style={{ fontSize: '0.85rem' }}>Cancel</button>
        <button className="btn btn--primary" disabled={!form.service} onClick={() => setStep(2)} style={{ fontSize: '0.85rem', opacity: form.service ? 1 : 0.5 }}>
          Next Step <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>chevron_right</span>
        </button>
      </div>
    </>
  )

  /* ─── Step 2: Describe Job ─── */
  const Step2 = (
    <>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>Describe Job</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '1.4rem' }}>
        Describe clearly for better quotes — professionals give more accurate estimates with detailed descriptions.
      </p>

      <div style={{ background: 'rgba(0,32,69,0.04)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span className="material-icons" style={{ fontSize: '1rem' }}>auto_awesome</span>
        Service: <strong>{form.service}</strong>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Job Title *</label>
        <input style={inputStyle} placeholder="e.g. Fix kitchen sink leak" value={form.title} onChange={e => update('title', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Job Description *</label>
        <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Describe the issue in detail. Include dimensions, material preferences, access constraints, etc."
          value={form.description} onChange={e => update('description', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Attachments (Optional)</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          
          {/* Photos */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="file" accept="image/*" id="photo-upload" hidden onChange={(e) => {
               if(e.target.files[0]) update('photos', e.target.files[0].name)
            }} />
            <label htmlFor="photo-upload"
              style={{ display: 'block', border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: form.photos ? 'rgba(56,161,105,0.05)' : '#fafafa', height: '100%' }}
            >
              <span className="material-icons" style={{ color: form.photos ? '#38a169' : 'var(--outline)', fontSize: '1.8rem', marginBottom: '0.3rem', display: 'block' }}>
                {form.photos ? 'image' : 'add_photo_alternate'}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', wordBreak: 'break-word', display: 'block', lineHeight: 1.3 }}>
                {form.photos ? `Attached: ${form.photos}` : 'Upload photo'}
              </span>
            </label>
            {form.photos && <span className="material-icons" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '1.2rem', color: '#e53e3e', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); update('photos', false); }}>cancel</span>}
          </div>

          {/* Audio */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div
              style={{ height: '100%', border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: isRecording ? 'rgba(229,62,62,0.05)' : form.audio ? 'rgba(56,161,105,0.05)' : '#fafafa' }}
              onClick={isRecording ? stopRecording : form.audio ? toggleAudio : startRecording}
            >
              <span className="material-icons" style={{ color: isRecording ? '#e53e3e' : form.audio ? 'var(--primary)' : 'var(--outline)', fontSize: '1.8rem', marginBottom: '0.3rem', display: 'block', animation: isRecording ? 'pulse 1.5s infinite' : 'none' }}>
                {isRecording ? 'stop_circle' : isPlaying ? 'pause_circle' : form.audio ? 'play_circle' : 'mic'}
              </span>
              <span style={{ fontSize: '0.78rem', color: isPlaying ? 'var(--primary)' : 'var(--on-surface-variant)', lineHeight: 1.3, display: 'block', fontWeight: isPlaying ? 700 : 400 }}>
                {isRecording ? 'Recording...' : isPlaying ? 'Playing Audio' : form.audio ? 'Tap to Preview' : 'Tap to record'}
              </span>
            </div>
            {form.audio && (
              <span 
                className="material-icons" 
                style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '1.2rem', color: '#e53e3e', cursor: 'pointer', background: 'white', borderRadius: '50%' }} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
                  update('audio', false); 
                  audioRef.current = null;
                }}
              >
                cancel
              </span>
            )}
          </div>

        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn--ghost" onClick={() => setStep(1)} style={{ fontSize: '0.85rem' }}>← Back</button>
        <button className="btn btn--primary" disabled={!form.title || !form.description} onClick={() => setStep(3)} style={{ fontSize: '0.85rem', opacity: form.title && form.description ? 1 : 0.5 }}>
          Next Step <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>chevron_right</span>
        </button>
      </div>
    </>
  )

  /* ─── Step 3: Budget & Time ─── */
  const Step3 = (
    <>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>Budget & Time</h2>
      <div style={{ background: 'rgba(221,107,32,0.08)', border: '1px solid rgba(221,107,32,0.3)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', marginBottom: '1.4rem', fontSize: '0.78rem', color: '#dd6b20', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <span className="material-icons" style={{ fontSize: '1rem', flexShrink: 0 }}>tips_and_updates</span>
        <span><strong>Pro Tip:</strong> Avg price in your area: ₹800–₹1200. Setting a fair budget attracts top-rated professionals faster.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Min Budget (₹)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 500" value={form.budgetMin} onChange={e => update('budgetMin', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
        </div>
        <div>
          <label style={labelStyle}>Max Budget (₹)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 1500" value={form.budgetMax} onChange={e => update('budgetMax', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Timeline Preference</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { value: 'asap', label: '🚨 ASAP' },
            { value: 'thisweek', label: '📅 This Week' },
            { value: 'flexible', label: '🗓 Flexible' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => update('timeline', opt.value)}
              style={{
                padding: '0.45rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                border: form.timeline === opt.value ? '2px solid var(--primary)' : '1.5px solid var(--outline-variant)',
                background: form.timeline === opt.value ? 'var(--primary)' : 'transparent',
                color: form.timeline === opt.value ? 'white' : 'var(--on-surface)',
                transition: 'all 0.2s',
              }}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {form.timeline !== 'flexible' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Preferred Date</label>
          <input style={inputStyle} type="date" value={form.date} onChange={e => update('date', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
        </div>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
        Your request will be visible to our verified network of 250+ local professionals. You can cancel or edit at any time before hiring.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn--ghost" onClick={() => setStep(2)} style={{ fontSize: '0.85rem' }}>← Back</button>
        <button className="btn btn--primary" disabled={!form.budgetMin || !form.budgetMax} onClick={() => setStep(4)} style={{ fontSize: '0.85rem', opacity: form.budgetMin && form.budgetMax ? 1 : 0.5 }}>
          Next Step <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>chevron_right</span>
        </button>
      </div>
    </>
  )

  /* ─── Step 4: Location ─── */
  const Step4 = (
    <>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>Where do you need help?</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '1.4rem' }}>
        ~23 providers will receive your request. Top-rated professionals are active in your selected radius.
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Your Address / Area *</label>
        <div style={{ position: 'relative' }}>
          <span className="material-icons" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.1rem' }}>location_on</span>
          <input style={{ ...inputStyle, paddingLeft: '2.4rem', paddingRight: '6.5rem' }} placeholder="e.g. Sector 21, Gurgaon"
            value={form.location} onChange={e => update('location', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          <button 
            type="button" 
            onClick={fetchCurrentLocation}
            disabled={isLocating}
            style={{ 
              position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
              background: 'var(--primary-container)', color: 'var(--primary)', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem', fontSize: '0.7rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <span className="material-icons" style={{ fontSize: '0.9rem' }}>{isLocating ? 'sync' : 'my_location'}</span>
            {isLocating ? 'Scanning...' : 'Near Me'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.2rem' }}>
        <label style={labelStyle}>Search Radius: {form.radius} km</label>
        <input type="range" min="1" max="20" value={form.radius} onChange={e => update('radius', e.target.value)} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
          <span>1 km</span><span>20 km</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,32,69,0.06) 0%, rgba(26,54,93,0.1) 100%)',
        borderRadius: 'var(--radius-lg)', height: '160px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.2rem',
        border: '1px solid var(--outline-variant)',
      }}>
        <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>map</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Map preview · {form.location}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>Radius: {form.radius} km</span>
      </div>

      {/* Privacy note */}
      <div style={{ background: 'rgba(0,32,69,0.04)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', marginBottom: '1.4rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1rem', flexShrink: 0 }}>verified_user</span>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>Verified Secure · Architect-Grade Privacy</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>Location accuracy ensures LocalServices matches you with the highest-tier professionals in our curated network.</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn--ghost" onClick={() => setStep(3)} style={{ fontSize: '0.85rem' }}>← Back</button>
        <button className="btn btn--primary" disabled={!form.location} onClick={() => setStep(5)} style={{ fontSize: '0.85rem', opacity: form.location ? 1 : 0.5 }}>
          Review Request <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>chevron_right</span>
        </button>
      </div>
    </>
  )

  /* ─── Step 5: Review & Confirm ─── */
  const Step5 = (
    <>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Review & Confirm</h2>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', overflow: 'hidden', marginBottom: '1.2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', padding: '1.2rem 1.5rem' }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{form.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>
            {[form.timeline === 'flexible' ? 'Flexible schedule' : `Preferred: ${form.date}`, form.location].join(' · ')}
          </p>
        </div>
        <div style={{ padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {[
            { icon: 'category', label: 'Service', value: form.service },
            { icon: 'description', label: 'Description', value: form.description },
            { icon: 'payments', label: 'Budget', value: `₹${Number(form.budgetMin).toLocaleString()} – ₹${Number(form.budgetMax).toLocaleString()}` },
            { icon: 'schedule', label: 'Timeline', value: form.timeline === 'asap' ? 'ASAP' : form.timeline === 'thisweek' ? 'This Week' : 'Flexible' },
            { icon: 'location_on', label: 'Location', value: `${form.location} (${form.radius} km radius)` },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
              <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1rem', marginTop: '1px', flexShrink: 0 }}>{row.icon}</span>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginBottom: '0.1rem' }}>{row.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--on-surface)', fontWeight: 500 }}>{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Shield */}
      <div style={{ background: 'rgba(0,32,69,0.05)', border: '1px solid rgba(0,32,69,0.15)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
        <span className="material-icons" style={{ color: '#f6ad55', fontSize: '1.5rem' }}>verified</span>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>The Verification Shield</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>Your request will be prioritized and visible to verified top-tier professionals only.</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn--ghost" onClick={() => setStep(4)} style={{ fontSize: '0.85rem' }}>← Back</button>
        <button
          className="btn btn--primary"
          disabled={isPublishing}
          onClick={async () => {
            setIsPublishing(true)
            try {
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) throw new Error('User not found')

              // Geocode the location to get lat/lng
              let latitude = null, longitude = null
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`)
                const geoData = await geoRes.json()
                if (geoData && geoData.length > 0) {
                  latitude = parseFloat(geoData[0].lat)
                  longitude = parseFloat(geoData[0].lon)
                }
              } catch (geoErr) {
                console.warn('Geocoding failed, posting without coordinates:', geoErr)
              }

              const { error } = await supabase.from('jobs').insert([{
                consumer_id: user.id,
                title: form.title,
                description: form.description,
                category: form.service,
                location: form.location,
                budget: parseFloat(form.budgetMax) || 0,
                status: 'pending',
                latitude,
                longitude
              }])

              if (error) throw error
              setStep(6)
            } catch (err) {
              console.error('Error publishing job:', err)
              alert('Failed to publish request. Please try again.')
            } finally {
              setIsPublishing(false)
            }
          }}
          style={{ fontSize: '0.85rem', background: 'linear-gradient(135deg, #dd6b20, #e53e3e)', border: 'none', fontWeight: 700, padding: '0.6rem 1.4rem', opacity: isPublishing ? 0.7 : 1 }}
        >
          <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>
            {isPublishing ? 'sync' : 'send'}
          </span>
          {isPublishing ? 'Publishing...' : 'Publish Request'}
        </button>
      </div>
    </>
  )

  /* ─── Step 6: Waiting for Bids ─── */
  const [dots, setDots] = useState(0)
  useEffect(() => {
    if (step !== 6) return
    const id = setInterval(() => setDots(d => (d + 1) % 4), 600)
    return () => clearInterval(id)
  }, [step])

  const Step6 = (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {/* Success animation */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(56,161,105,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
        border: '2px solid #38a169',
      }}>
        <span className="material-icons" style={{ color: '#38a169', fontSize: '2.2rem' }}>check_circle</span>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>Request Posted Successfully! 🎉</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
        Finding the best professionals near you{'.'.repeat(dots + 1)}
      </p>

      {/* Scanning animation */}
      <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', justifyContent: 'center' }}>
          <span className="material-icons" style={{ color: '#38a169', fontSize: '1rem' }}>radar</span>
          <span style={{ fontSize: '0.8rem', color: '#38a169', fontWeight: 700 }}>System scanning live availability</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Matching your location', done: true },
            { label: 'Filtering verified providers', done: true },
            { label: `Notifying ~23 professionals (${form.radius} km)`, done: true },
            { label: 'Collecting bids…', done: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
              <span className="material-icons" style={{ fontSize: '1rem', color: item.done ? '#38a169' : 'var(--outline-variant)' }}>
                {item.done ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span style={{ color: item.done ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{item.label}</span>
            </div>
          ))}
        </div>
        {/* shimmer strip */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%',
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          animation: 'shimmer 1.5s infinite',
        }} />
      </div>

      {/* Request summary pill */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', border: '1px solid var(--outline-variant)', textAlign: 'left', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Your Request</div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{form.title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{form.service} · ₹{Number(form.budgetMin).toLocaleString()}–₹{Number(form.budgetMax).toLocaleString()} · {form.location}</div>
      </div>

      {/* Bottom nav tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid var(--outline-variant)', paddingTop: '1.2rem' }}>
        {[
          { icon: 'pending_actions', label: 'Activity' },
          { icon: 'gavel', label: 'Bids' },
          { icon: 'payments', label: 'Payments' },
          { icon: 'person', label: 'Profile' },
        ].map(tab => (
          <div key={tab.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', color: tab.label === 'Bids' ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '0.65rem', fontWeight: tab.label === 'Bids' ? 700 : 400 }}>
            <span className="material-icons" style={{ fontSize: '1.2rem', color: tab.label === 'Bids' ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{tab.icon}</span>
            {tab.label}
          </div>
        ))}
      </div>

      <button className="btn btn--outline" onClick={onClose} style={{ marginTop: '1.2rem', width: '100%' }}>
        Done — Back to Dashboard
      </button>
    </div>
  )

  const STEP_CONTENT = [null, Step1, Step2, Step3, Step4, Step5, Step6]

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
      <ModalShell step={step} onClose={step === 6 ? onClose : undefined}>
        {STEP_CONTENT[step]}
      </ModalShell>
    </>
  )
}
