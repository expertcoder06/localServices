import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/locationService';
import axios from 'axios';

const Signup = () => {
  const [role, setRole] = useState(null); // 'consumer' | 'provider'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [serverOtp, setServerOtp] = useState(null);
  const [userOtp, setUserOtp] = useState('');

  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    country: '', state: '', city: '', town_village: '', pin: '', address: '',
    service_name: '', custom_service_name: ''
  });

  // Files State for Providers
  const [files, setFiles] = useState({ aadhar: null, pan: null, photo: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });
  };

  const handleGetLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setFormData({ ...formData, country: loc.country, state: loc.state, city: loc.city });
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const { error } = await supabase.storage.from('provider_documents').upload(path, file);
    if (error) throw error;
    return supabase.storage.from('provider_documents').getPublicUrl(path).data.publicUrl;
  };

  const completeRegistration = async () => {
    try {
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const userId = authData.user.id;
      let aadhar_url = '', pan_url = '', photo_url = '';

      if (role === 'provider') {
        if (files.aadhar) aadhar_url = await uploadFile(files.aadhar, `${userId}/aadhar_${files.aadhar.name}`);
        if (files.pan) pan_url = await uploadFile(files.pan, `${userId}/pan_${files.pan.name}`);
        if (files.photo) photo_url = await uploadFile(files.photo, `${userId}/photo_${files.photo.name}`);

        const finalServiceName = formData.service_name === 'Other' ? formData.custom_service_name : formData.service_name;

        const { error: dbError } = await supabase.from('service_providers').insert({
          id: userId,
          name: formData.name, email: formData.email, phone: formData.phone,
          country: formData.country, state: formData.state, city: formData.city,
          address: formData.address,
          service_name: finalServiceName,
          aadhar_url, pan_url, photo_url,
          status: 'pending'
        });

        if (dbError) throw dbError;

        setSuccessMsg("Welcome to Local Services! We are reviewing your profile and will contact you shortly. Thank you.");
      } else {
        const { error: dbError } = await supabase.from('consumers').insert({
          id: userId,
          name: formData.name, email: formData.email, phone: formData.phone,
          country: formData.country, state: formData.state, city: formData.city,
          town_village: formData.town_village, pin: formData.pin
        });
        if (dbError) throw dbError;

        setSuccessMsg("Congratulations, your registration is complete! Navigating to login...");
        setTimeout(() => navigate('/login'), 3500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(generatedOtp);
    
    try {
      const response = await axios.post('http://localhost:5000/send-otp', { email: formData.email, otp: generatedOtp });
      
      if (response.status !== 200) {
        throw new Error("Failed to send verification email");
      }
      setStep(3); // Go to OTP verification step
    } catch (err) {
      console.error("Email API Error:", err);
      setError("Could not connect to email server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (userOtp !== serverOtp) {
      return setError("Invalid OTP. Please try again.");
    }
    setError(null);
    setStep(4); // Advance to full form
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError(null);
    await completeRegistration();
  };

  if (successMsg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ color: 'var(--primary)' }}>{role === 'consumer' ? 'Success!' : 'Application Received'}</h2>
          <p style={{ marginTop: '1.5rem', fontSize: '1.25rem', color: 'var(--secondary)', fontWeight: 500, lineHeight: 1.6 }}>{successMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="glass-card custom-scrollbar" style={{ padding: '2.5rem', width: '100%', maxWidth: '650px', borderRadius: 'var(--radius-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>
          Create Account
        </h2>

        {error && <div style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: '#ffe4e6', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>{error}</div>}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--secondary)' }}>I am joining as a...</h3>
            <button
               // Both roles now go to email/OTP collection first (step 2)
              onClick={() => { setRole('consumer'); setStep(2); }}
              style={{ padding: '1.5rem', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600, border: '2px solid transparent', color: 'var(--on-surface)' }}
              className="neon-glow-hover"
            >
              Consumer
            </button>
            <button
               // Both roles now go to email/OTP collection first (step 2)
              onClick={() => { setRole('provider'); setStep(2); }}
              style={{ padding: '1.5rem', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600, border: '2px solid transparent', color: 'var(--on-surface)' }}
              className="neon-glow-hover"
            >
              Service Provider
            </button>
            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--tertiary)', fontWeight: 'bold' }}>Log in</Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
               <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>email</span>
               <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--on-surface)' }}>Email Verification</h3>
               <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', margin: 0 }}>
                 Please enter your email address. We will send you a one-time password to verify your account.
               </p>
            </div>
            <div>
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="yourname@example.com"
                style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', fontSize: '1.1rem' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: '1rem', flex: 1, background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                Back
              </button>
              <button type="submit" disabled={loading} style={{ padding: '1rem', flex: 2, background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }} className="neon-glow-hover">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required readOnly style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', opacity: 0.6 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>Location Details</h4>
                <button type="button" onClick={handleGetLocation} style={{ padding: '0.5rem 1rem', background: 'var(--tertiary)', color: 'var(--on-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600 }}>
                  📍 Current Location
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
                <input type="text" name="state" placeholder="State/Region" value={formData.state} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
                <input type="text" name="city" placeholder="City/District" value={formData.city} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
              </div>
            </div>

            {role === 'consumer' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Town or Village</label>
                  <input type="text" name="town_village" value={formData.town_village} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Pin Code</label>
                  <input type="text" name="pin" value={formData.pin} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
                </div>
              </div>
            )}

            {role === 'provider' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Operating Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', resize: 'vertical' }} />
                </div>

                <div style={{ padding: '1.25rem', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary)', marginBottom: '1rem' }}>Service Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Specific Service Name</label>
                      <select 
                        name="service_name" 
                        value={formData.service_name} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', background: '#fff' }}
                      >
                        <option value="" disabled>Select your core service</option>
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
                        <option value="Other">Other (Specify below)</option>
                      </select>
                    </div>

                    {formData.service_name === 'Other' && (
                      <div className="fade-in">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Custom Service Name</label>
                        <input 
                          type="text" 
                          name="custom_service_name" 
                          placeholder="E.g., Custom Aquarium Maintenance" 
                          value={formData.custom_service_name} 
                          onChange={handleChange} 
                          required={formData.service_name === 'Other'} 
                          style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', outline: 'none', background: '#fff' }} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary)' }}>Verification Documents</h4>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600 }}>Aadhar Card Image</label>
                    <input type="file" name="aadhar" accept="image/*,.pdf" onChange={handleFileChange} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600 }}>PAN Card Image</label>
                    <input type="file" name="pan" accept="image/*,.pdf" onChange={handleFileChange} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600 }}>Profile Photo</label>
                    <input type="file" name="photo" accept="image/*" onChange={handleFileChange} required style={{ width: '100%' }} />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setStep(3)} style={{ padding: '1rem', flex: 1, background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                Back
              </button>
              <button type="submit" disabled={loading} style={{ padding: '1rem', flex: 2, background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }} className="neon-glow-hover">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
               <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>mark_email_read</span>
               <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--on-surface)' }}>Enter OTP</h3>
               <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', margin: 0 }}>
                 We sent a verification code to <strong>{formData.email}</strong>
               </p>
            </div>
            <div>
              <input 
                type="text" 
                value={userOtp} 
                onChange={(e) => setUserOtp(e.target.value)} 
                required 
                maxLength={6}
                placeholder="000000"
                style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--primary)', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 'bold' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(2)} style={{ padding: '1rem', flex: 1, background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                Back
              </button>
              <button type="submit" disabled={loading} style={{ padding: '1rem', flex: 2, background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }} className="neon-glow-hover">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
