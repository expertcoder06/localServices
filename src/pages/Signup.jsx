import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/locationService';

const Signup = () => {
  const [role, setRole] = useState(null); // 'consumer' | 'provider'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
   const [otp, setOtp] = useState(['', '', '', '', '', '']);
   const [generatedOtp, setGeneratedOtp] = useState('');
   const [showExistenceWarning, setShowExistenceWarning] = useState(false);
   
   const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    country: '', state: '', city: '', town_village: '', pin: '', address: ''
  });

  // Files State for Providers
  const [files, setFiles] = useState({ aadhar: null, pan: null, photo: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError(null);

    // 1. Validate Form First
    if (role === 'provider' && (!files.aadhar || !files.pan || !files.photo)) {
      setError("Please upload all provider documents.");
      setLoading(false);
      return;
    }

    // 2. Check if user already exists in our system (consumers or service_providers)
    try {
      const table = role === 'consumer' ? 'consumers' : 'service_providers';
      const { data: existing, error: checkError } = await supabase
        .from(table)
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existing) {
        setShowExistenceWarning(true);
        setError(`An account with this email already exists as a ${role}.`);
        setLoading(false);
        return;
      }
    } catch (err) {
      // If error is not a 'not found', it might be a real system error
      if (err.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Check existing error:", err);
      }
    }

    try {
      // 3. Generate a 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      
      // 3. Send that code via our Node.js server
      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: code }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Error sending email');
      }

      // 4. Move to OTP step without registering the user yet
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to send OTP email. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user via Auth now that OTP is verified
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      const userId = authData.user.id;
      let aadhar_url = '', pan_url = '', photo_url = '';

      // 2. Upload documents and create profiles
      if (role === 'provider') {
        if (files.aadhar) aadhar_url = await uploadFile(files.aadhar, `${userId}/aadhar_${files.aadhar.name}`);
        if (files.pan) pan_url = await uploadFile(files.pan, `${userId}/pan_${files.pan.name}`);
        if (files.photo) photo_url = await uploadFile(files.photo, `${userId}/photo_${files.photo.name}`);
        
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId, name: formData.name, role: 'provider'
        });
        if (profileError) throw profileError;

        const { error: dbError } = await supabase.from('service_providers').insert({
          id: userId,
          name: formData.name, email: formData.email, phone: formData.phone,
          country: formData.country, state: formData.state, city: formData.city,
          address: formData.address,
          aadhar_url, pan_url, photo_url,
          status: 'pending'
        });
        if (dbError) throw dbError;

        setSuccessMsg("Registration successful! Your provider profile is pending review.");
      } else {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId, name: formData.name, role: 'client'
        });
        if (profileError) throw profileError;

        const { error: dbError } = await supabase.from('consumers').insert({
          id: userId,
          name: formData.name, email: formData.email, phone: formData.phone,
          country: formData.country, state: formData.state, city: formData.city,
          town_village: formData.town_village, pin: formData.pin
        });
        if (dbError) throw dbError;

        setSuccessMsg(`Welcome ${role === 'consumer' ? 'Consumer' : 'Provider'}! Redirecting to your dashboard...`);

        // 3. Log them in directly or redirect to dashboard
        setTimeout(() => {
          if (role === 'provider') navigate('/provider-dashboard');
          else navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>Create Account</h2>
        
         {error && (
           <div style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: '#ffe4e6', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>
             {error}
             {showExistenceWarning && (
               <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                 <button type="button" onClick={() => navigate('/login')} style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.86rem' }}>Log in Instead</button>
                 <button type="button" onClick={() => { setShowExistenceWarning(false); setError(null); }} style={{ background: '#64748b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.86rem' }}>Try Different Email</button>
               </div>
             )}
           </div>
         )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--secondary)' }}>I am joining as a...</h3>
            <button 
              onClick={() => { setRole('consumer'); setStep(2); }}
              style={{ padding: '1.5rem', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600, border: '2px solid transparent', color: 'var(--on-surface)' }}
              className="neon-glow-hover"
            >
              Consumer
            </button>
            <button 
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
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
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }} />
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
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600 }}>Professional Facial Photo</label>
                    <input type="file" name="photo" accept="image/*" onChange={handleFileChange} required style={{ width: '100%' }} />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: '1rem', flex: 1, background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                Back
              </button>
              <button type="submit" disabled={loading} style={{ padding: '1rem', flex: 2, background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }} className="neon-glow-hover">
                {loading ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>Verify Your Email</h3>
            <p style={{ textAlign: 'center', color: 'var(--secondary)' }}>
              We have sent an OTP to <strong>{formData.email}</strong>. Please enter it below to verify your account.
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '3rem', height: '3.5rem', textAlign: 'center', fontSize: '1.5rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container)', color: 'var(--on-surface)'
                  }}
                  required
                />
              ))}
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }} className="neon-glow-hover">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
               <button type="button" onClick={async () => {
                 setLoading(true);
                 setError(null);
                 const code = Math.floor(100000 + Math.random() * 900000).toString();
                 setGeneratedOtp(code);
                 
                 try {
                   const response = await fetch('http://localhost:5000/send-otp', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ email: formData.email, otp: code }),
                   });
                   const result = await response.json();
                   if (result.success) {
                     alert("OTP resent to your email.");
                   } else {
                     setError(result.message);
                   }
                 } catch (err) {
                   setError("Failed to resend OTP. Is the email server running?");
                 } finally {
                   setLoading(false);
                 }
               }} style={{ background: 'none', border: 'none', color: 'var(--tertiary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>
                 Resend OTP
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
