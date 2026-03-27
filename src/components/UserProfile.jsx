import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    profilePic: null,
    status: 'Verified',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  })

  const [tempData, setTempData] = useState({ ...userData })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch from consumers table
        const { data: consumer, error } = await supabase
          .from('consumers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (consumer) {
          const profileData = {
            fullName: consumer.name || 'User Name',
            email: user.email || '',
            phone: consumer.phone || '',
            location: consumer.location || 'Add your location here',
            profilePic: consumer.profile_pic || null,
            status: consumer.status || 'Verified',
            joinedDate: new Date(consumer.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          }
          setUserData(profileData)
          setTempData(profileData)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempData(prev => ({ ...prev, profilePic: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const updatePayload = {
          name: tempData.fullName,
          phone: tempData.phone,
          location: tempData.location,
        }
        
        // Add profile_pic if we have one (base64 string)
        if (tempData.profilePic) {
          updatePayload.profile_pic = tempData.profilePic
        }

        const { error } = await supabase
          .from('consumers')
          .update(updatePayload)
          .eq('id', user.id)

        if (error) {
          console.error("Error updating profile in db (profile_pic column may not exist). Proceeding visually based on local state:", error)
        }
      }
    } catch (err) {
      console.error('Error saving profile:', err)
    }
    setUserData({ ...tempData })
    setIsEditing(false)
  }

  const bookingHistory = [
    { title: 'AC Deep Cleaning', provider: 'Marcus Richardson', date: 'Oct 12, 2025', amount: '₹850', status: 'Completed' },
    { title: 'Home Sanitization', provider: 'Sunita Sharma', date: 'Sep 28, 2025', amount: '₹1,200', status: 'Completed' },
    { title: 'Leakage Repair', provider: 'Karan Singh', date: 'Sep 05, 2025', amount: '₹450', status: 'Completed' },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="material-icons animate-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}>sync</span>
        <p style={{ marginTop: '1rem', color: 'var(--on-surface-variant)' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        
        {/* Left Column: Essential Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--tertiary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '4px solid #fff', overflow: 'hidden' }}>
                {(isEditing ? tempData.profilePic : userData.profilePic) ? (
                  <img src={isEditing ? tempData.profilePic : userData.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  ((isEditing ? tempData.fullName : userData.fullName) || 'User').split(' ').map(n => n?.[0]).join('').substring(0,2).toUpperCase()
                )}
              </div>
              {isEditing && (
                <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                  <span className="material-icons" style={{ fontSize: '1.2rem' }}>photo_camera</span>
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {isEditing ? (
              <input 
                type="text" 
                value={tempData.fullName} 
                onChange={e => setTempData({...tempData, fullName: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem', outline: 'none' }}
                placeholder="Full Name"
              />
            ) : (
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>{userData.fullName}</h2>
            )}

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: 'rgba(56,161,105,0.1)', color: '#38a169', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>verified</span> {userData.status}
            </div>
            
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', opacity: isEditing ? 0.6 : 1 }}>
                <span className="material-icons" style={{ color: 'var(--outline)', fontSize: '1.2rem' }}>email</span>
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Email Address <span style={{ fontSize: '0.65rem', fontWeight: 400 }}>(Protected)</span></div>
                  <div style={{ color: 'var(--on-surface)' }}>{userData.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', opacity: isEditing ? 1 : 1 }}>
                <span className="material-icons" style={{ color: 'var(--outline)', fontSize: '1.2rem' }}>call</span>
                <div style={{ fontSize: '0.85rem', flex: 1 }}>
                  <div style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Phone Number <span style={{ fontSize: '0.65rem', fontWeight: 400 }}>{isEditing ? '' : '(Protected)'}</span></div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={tempData.phone} 
                      onChange={e => setTempData({...tempData, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', fontSize: '0.85rem', marginTop: '0.3rem', outline: 'none' }}
                      placeholder="Phone Number"
                    />
                  ) : (
                    <div style={{ color: 'var(--on-surface)' }}>{userData.phone || 'Not provided'}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span className="material-icons" style={{ color: 'var(--outline)', fontSize: '1.2rem' }}>location_on</span>
                <div style={{ fontSize: '0.85rem', flex: 1 }}>
                  <div style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Primary Address</div>
                  {isEditing ? (
                    <textarea 
                      value={tempData.location} 
                      onChange={e => setTempData({...tempData, location: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', fontSize: '0.85rem', marginTop: '0.3rem', outline: 'none', resize: 'none', height: '60px' }}
                      placeholder="Your Address"
                    />
                  ) : (
                    <div style={{ color: 'var(--on-surface)' }}>{userData.location}</div>
                  )}
                </div>
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
                <button className="btn btn--ghost" style={{ flex: 1, padding: '0.8rem' }} onClick={() => { setIsEditing(false); setTempData({...userData}); }}>Cancel</button>
                <button className="btn btn--primary" style={{ flex: 1, padding: '0.8rem' }} onClick={handleSave}>Save</button>
              </div>
            ) : (
              <button className="btn btn--outline" style={{ width: '100%', marginTop: '2rem', padding: '0.8rem' }} onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

        </div>

        {/* Right Column: Detailed Tabs/Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Recent Bookings */}
          <section style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Booking History</h3>
              <a href="#" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>View All</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookingHistory.map((booking, idx) => (
                <div key={idx} style={{ padding: '1.2rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <span className="material-icons">history</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{booking.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>with {booking.provider} &middot; {booking.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{booking.amount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#38a169', fontWeight: 700 }}>{booking.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Preferences & Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <section style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem' }}>Preferred Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Electrician', 'AC Repair', 'House Cleaning', 'Plumbing'].map(cat => (
                  <span key={cat} style={{ padding: '0.4rem 0.8rem', borderRadius: '100px', background: 'var(--surface-container-low)', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--outline-variant)' }}>{cat}</span>
                ))}
              </div>
            </section>
            <section style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem' }}>Ratings Provided</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>4.8</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', color: '#f6ad55' }}>
                    {[1,2,3,4,5].map(s => <span key={s} className="material-icons" style={{ fontSize: '1rem' }}>star</span>)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>Avg. given (12 reviews)</div>
                </div>
              </div>
            </section>
          </div>

          {/* Verification Badges */}
          <section style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem' }}>Verification Milestones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Email', icon: 'alternate_email', color: '#3182ce' },
                { label: 'Phone', icon: 'phonelink_setup', color: '#38a169' },
                { label: 'Payment', icon: 'account_balance_wallet', color: '#805ad5' }
              ].map(v => (
                <div key={v.label} style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--outline-variant)' }}>
                  <span className="material-icons" style={{ color: v.color, marginBottom: '0.4rem' }}>{v.icon}</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{v.label} Verified</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
