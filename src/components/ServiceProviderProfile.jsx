import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function ServiceProviderProfile({ provider = {}, isEditable = false }) {
  const [isSelfEditing, setIsSelfEditing] = useState(false)
  const [proData, setProData] = useState({
    businessName: 'Loading...',
    role: '',
    email: '',
    phone: '',
    location: '',
    logo: null,
    experience: '...',
    status: '...',
    rate: '...',
    categories: []
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        setProData({
          ...data,
          businessName: data.name || 'Not Set',
          role: data.service_name || 'General Provider',
          email: data.email,
          phone: data.phone || 'Enter Phone',
          location: data.location || (data.city ? `${data.city}, ${data.state}` : 'Add Location'),
          logo: data.photo_url,
          experience: data.experience || 'Not Specified',
          status: data.status === 'approved' ? 'Verified Platinum' : 'Pending Verification',
          rate: `₹${data.hourly_rate || 500} / hr`,
          categories: data.categories || []
        })
        setTempData({
          ...data,
          businessName: data.name || 'Not Set',
          role: data.service_name || 'General Provider',
          location: data.location || (data.city ? `${data.city}, ${data.state}` : 'Add Location'),
          logo: data.photo_url,
          hourly_rate: data.hourly_rate || 500
        })
      }
    }
    loadProfile()
  }, [])

  const [tempData, setTempData] = useState({ ...proData })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempData(prev => ({ ...prev, logo: reader.result, photo_url: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updates = {
        name: tempData.businessName,
        service_name: tempData.service_name || tempData.role,
        location: tempData.location,
        hourly_rate: parseInt(tempData.hourly_rate) || 500,
        photo_url: tempData.photo_url || tempData.logo
      }

      const { error } = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProData({ 
        ...proData, 
        ...tempData,
        businessName: tempData.businessName,
        role: tempData.service_name || tempData.role,
        rate: `₹${tempData.hourly_rate || 500} / hr`
      })
      setIsSelfEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert('Error updating profile: ' + err.message)
    }
  }

  // Specialized Trust Score Algorithm
  const calculateTrustScore = (rating, jobs, responseTimeStr) => {
    // 1. Avg. Rating (50% weight) - Max 5.0
    const ratingScore = (parseFloat(rating) / 5) * 10 * 0.5
    
    // 2. Completed Jobs (30% weight) - Benchmark: 100 jobs = 10/10
    const jobVolumeScore = Math.min(parseInt(jobs) / 100, 1) * 10 * 0.3
    
    // 3. Response Time (20% weight) - Benchmark: <15 mins = 10/10, >120 mins = 0/10
    const respMinutes = parseInt(responseTimeStr.split(' ')[0]) || 60
    const responseScore = Math.max(0, Math.min(10, (120 - respMinutes) / 10.5)) * 0.2
    
    return (ratingScore + jobVolumeScore + responseScore).toFixed(1)
  }

  const rawStats = {
    jobs: '432',
    rating: '4.9',
    responseTime: '15 mins'
  }

  const trustScore = calculateTrustScore(rawStats.rating, rawStats.jobs, rawStats.responseTime)

  const performanceStats = [
    { label: 'Completed Jobs', value: rawStats.jobs, icon: 'task_alt', color: '#38a169', bg: 'rgba(56,161,105,0.1)' },
    { label: 'Avg. Rating', value: rawStats.rating, icon: 'star', color: '#f6ad55', bg: 'rgba(246,173,85,0.1)' },
    { label: 'Response Time', value: rawStats.responseTime, icon: 'speed', color: '#3182ce', bg: 'rgba(49,130,206,0.1)' },
    { label: 'Trust Score', value: trustScore, icon: 'verified_user', color: '#805ad5', bg: 'rgba(128,90,213,0.1)' },
  ]

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeInUp 0.5s ease-out', paddingBottom: '4rem' }}>
      
      {/* Header Profile Card */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid var(--outline-variant)', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
        <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
          <div style={{ width: '150px', height: '150px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800, color: 'white', boxShadow: '0 10px 30px rgba(26,54,93,0.2)', overflow: 'hidden' }}>
            {(isSelfEditing ? tempData.logo : proData.logo) ? <img src={isSelfEditing ? tempData.logo : proData.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isSelfEditing ? tempData.businessName : proData.businessName).split(' ').map(n=>n[0]).join('')}
          </div>
          {isSelfEditing && (
            <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '4px solid #fff', boxShadow: 'var(--shadow-md)' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>add_a_photo</span>
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isSelfEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={tempData.businessName} 
                    onChange={e => setTempData({...tempData, businessName: e.target.value})}
                    style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--on-surface)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', outline: 'none', width: '90%' }}
                  />
                  <select
                    value={tempData.service_name}
                    onChange={e => setTempData({...tempData, service_name: e.target.value})}
                    style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', outline: 'none', width: '90%', background: '#fff' }}
                  >
                    <option value="" disabled>Select Specific Service</option>
                    <option value="Plumbing Repair & Maintenance">Plumbing Repair & Maintenance</option>
                    <option value="Electrical Installation & Repair">Electrical Installation & Repair</option>
                    <option value="AC Servicing & Gas Refill">AC Servicing & Gas Refill</option>
                    <option value="Carpentry & Furniture Assembly">Carpentry & Furniture Assembly</option>
                    <option value="House Cleaning & Deep Cleaning">House Cleaning & Deep Cleaning</option>
                    <option value="Painting & Wall Decor">Painting & Wall Decor</option>
                    <option value="RO Water Purifier Repair">RO Water Purifier Repair</option>
                    <option value="Refrigerator Repair">Refrigerator Repair</option>
                    <option value="Washing Machine Repair">Washing Machine Repair</option>
                    <option value="Pest Control Services">Pest Control Services</option>
                    <option value="Other">Other (Specify)</option>
                  </select>
                  {tempData.service_name === 'Other' && (
                    <input 
                      type="text" 
                      placeholder="Enter custom service"
                      value={tempData.custom_service_name} 
                      onChange={e => setTempData({...tempData, custom_service_name: e.target.value})}
                      style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', outline: 'none', width: '90%' }}
                    />
                  )}
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.3rem' }}>{proData.businessName}</h1>
                  <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.8rem' }}>{proData.role} &middot; {proData.experience} Experience</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isSelfEditing ? (
                <>
                  <button className="btn btn--ghost" onClick={() => { setIsSelfEditing(false); setTempData({...proData}); }}>Cancel</button>
                  <button className="btn btn--primary" onClick={handleSave}>Save Profile</button>
                </>
              ) : (
                <>
                  <button className="btn btn--outline" style={{ padding: '0.6rem 1rem' }}>Share Profile</button>
                  {isEditable && <button className="btn btn--primary" style={{ padding: '0.6rem 1rem' }} onClick={() => setIsSelfEditing(true)}>Edit Details</button>}
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '100px', background: 'rgba(49,130,206,0.1)', color: '#3182ce', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>shield</span> Trust Badge
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '100px', background: 'rgba(56,161,105,0.1)', color: '#38a169', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>workspace_premium</span> {proData.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Left Col: Details & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {performanceStats.map(stat => (
              <div key={stat.label} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.2rem', border: '1px solid var(--outline-variant)', textAlign: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                  <span className="material-icons" style={{ color: stat.color, fontSize: '1.1rem' }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--on-surface)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* About & Services */}
          <section style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem' }}>Professional Overview</h3>
            {isSelfEditing ? (
              <textarea 
                value={tempData.experience + ' Experience specialized in HVAC...'} // Simulated edit of overview
                readOnly
                style={{ width: '100%', padding: '1rem', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '2rem', color: 'var(--on-surface-variant)', cursor: 'not-allowed' }}
                placeholder="Briefly describe your services..."
              />
            ) : (
              <p style={{ fontSize: '0.95rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Specializing in high-efficiency climate control systems and complex HVAC repairs. Over {proData.experience} of field experience serving residential and commercial clients across Gurgaon. Committed to providing transparent pricing and 100% satisfaction on every call.
              </p>
            )}

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Primary Services</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {(isSelfEditing ? tempData.categories : proData.categories).length > 0 ? (isSelfEditing ? tempData.categories : proData.categories).map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>check_circle</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat}</span>
                </div>
              )) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>check_circle</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{proData.role || 'General Service'}</span>
                </div>
              )}
            </div>
          </section>

          {/* Licenses */}
          <section style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Licenses & Certifications</h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', background: 'rgba(128,90,213,0.05)', borderRadius: 'var(--radius-lg)', border: '1px dashed #805ad5' }}>
              <span className="material-icons" style={{ fontSize: '3rem', color: '#805ad5', opacity: 0.6 }}>badge</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#805ad5', textTransform: 'uppercase' }}>Government Issued ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Master HVAC Certification</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>ID: {proData.license} &middot; Valid until Dec 2028</div>
              </div>
              <span style={{ color: '#38a169', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>verified</span> Verified
              </span>
            </div>
          </section>
        </div>

        {/* Right Col: Contact & Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Rate & Area Card */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 700, marginBottom: '0.4rem' }}>Standard Rate</div>
              {isSelfEditing ? (
                <input 
                  type="number" 
                  value={tempData.hourly_rate} 
                  onChange={e => setTempData({...tempData, hourly_rate: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '1.2rem', fontWeight: 800 }}
                />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{proData.rate}</div>
              )}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 700, marginBottom: '0.4rem' }}>Service Radius</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>my_location</span>
                15 km from Home Base
              </div>
            </div>
            <button className="btn btn--primary" style={{ width: '100%', padding: '0.8rem' }} disabled={isSelfEditing}>Book Now</button>
          </div>

          {/* Contact Details */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.2rem' }}>Contact Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', opacity: isSelfEditing ? 0.6 : 1 }}>
                <span className="material-icons" style={{ color: 'var(--outline)', fontSize: '1rem' }}>email</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{proData.email} {isSelfEditing && '(Protected)'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', opacity: isSelfEditing ? 0.6 : 1 }}>
                <span className="material-icons" style={{ color: 'var(--outline)', fontSize: '1rem' }}>call</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{proData.phone} {isSelfEditing && '(Protected)'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span className="material-icons" style={{ color: 'var(--outline)', fontSize: '1rem' }}>location_on</span>
                {isSelfEditing ? (
                  <textarea 
                    value={tempData.location} 
                    onChange={e => setTempData({...tempData, location: e.target.value})}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', height: '60px', outline: 'none' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{proData.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Provider Insights (Self View) */}
          {isEditable && (
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px dashed var(--outline-variant)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>Profile Health</h4>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-container-highest)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                <div style={{ width: '85%', height: '100%', background: '#38a169', borderRadius: '4px' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Your profile is 85% complete. Add a portfolio to reach 100%.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
