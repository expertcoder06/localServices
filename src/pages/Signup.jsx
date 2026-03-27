import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/locationService';
import FaceVerification from '../components/FaceVerification';
import { loadModels, extractEmbeddingFromImage, calculateSimilarity } from '../utils/faceService';



const Signup = () => {
  const [role, setRole] = useState(null); // 'consumer' | 'provider'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [faceData, setFaceData] = useState(null); // { embedding, photo, similarity }
  const [uploadedEmbedding, setUploadedEmbedding] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'processing', 'success', 'error'


  
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
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });

    if (name === 'photo' && selectedFiles[0]) {
      handleUploadedPhoto(selectedFiles[0]);
    }
  };

  const handleUploadedPhoto = async (file) => {
    setUploadStatus('processing');
    try {
      await loadModels(); // ensure models are loaded
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const embedding = await extractEmbeddingFromImage(img);
        if (embedding) {
          setUploadedEmbedding(embedding);
          setUploadStatus('success');
        } else {
          setUploadStatus('error');
          setError("No face detected in the uploaded photo. Please try a clearer image.");
        }
      };
    } catch (err) {
      setUploadStatus('error');
      console.error(err);
    }
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

  // Stage 1: Register User Directly (No OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      
      const userId = authData.user.id;
      let aadhar_url = '', pan_url = '', photo_url = '';

      // 2. Upload documents securely if provider
      if (role === 'provider') {
        if (!faceData) {
          throw new Error("Live face verification is required for service providers.");
        }
        
        if (faceData.similarity < 70) {
          throw new Error("Identity match failed. The uploaded photo and live scan do not appear to be the same person.");
        }


        if (files.aadhar) aadhar_url = await uploadFile(files.aadhar, `${userId}/aadhar_${files.aadhar.name}`);
        if (files.pan) pan_url = await uploadFile(files.pan, `${userId}/pan_${files.pan.name}`);
        
        // Use the photo from face verification
        const facePhotoFile = await (await fetch(faceData.photo)).blob();
        photo_url = await uploadFile(facePhotoFile, `${userId}/face_verified.jpg`);
        
        // 3a. Insert into service_providers
        const { error: dbError } = await supabase.from('service_providers').insert({
          id: userId,
          name: formData.name, email: formData.email, phone: formData.phone,
          country: formData.country, state: formData.state, city: formData.city,
          address: formData.address,
          aadhar_url, pan_url, photo_url,
          face_embedding: faceData.embedding,
          is_face_verified: true,
          status: 'pending'
        });

        if (dbError) throw dbError;

        setSuccessMsg("Welcome to Local Services! We are reviewing your profile and will contact you shortly. Thank you.");
      } else {
        // 3b. Insert into consumers
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
          {step === 3 ? 'Check Your Email' : 'Create Account'}
        </h2>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: '#ffe4e6', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>{error}</div>}

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
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Identity Verification</label>
                    {!faceData ? (
                      <button 
                        type="button" 
                        onClick={() => setShowFaceVerification(true)}
                        style={{ width: '100%', padding: '0.75rem', background: 'var(--tertiary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Start Face Verification & Photo Capture
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid #10b981' }}>
                        <img src={faceData.photo} alt="Verified Face" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>✅ Face Verified Successfully</span>
                          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Match Score: {Math.round(faceData.similarity)}%</span>
                        </div>
                        <button type="button" onClick={() => setShowFaceVerification(true)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.8rem' }}>Retake</button>
                      </div>

                    )}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Registration Photo (for Comparison)</label>
                    <input 
                      type="file" 
                      name="photo" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      required 
                      style={{ width: '100%' }} 
                    />
                    {uploadStatus === 'processing' && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Analyzing photo...</p>}
                    {uploadStatus === 'success' && <p style={{ fontSize: '0.8rem', color: '#10b981' }}>✅ Photo analysis complete. You can now start live verification.</p>}
                    {uploadStatus === 'error' && <p style={{ fontSize: '0.8rem', color: 'var(--error)' }}>❌ Could not detect a face. Please use a clearer photo.</p>}
                  </div>
                </div>


              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: '1rem', flex: 1, background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                Back
              </button>
              <button type="submit" disabled={loading} style={{ padding: '1rem', flex: 2, background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }} className="neon-glow-hover">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>

      {showFaceVerification && (
        <FaceVerification 
          onVerified={(data) => {
            let similarity = 100;
            if (uploadedEmbedding) {
              similarity = calculateSimilarity(data.embedding, uploadedEmbedding);
            }
            setFaceData({ ...data, similarity });
            setShowFaceVerification(false);
          }}
          onCancel={() => setShowFaceVerification(false)}
        />
      )}

    </div>

  );
};

export default Signup;
