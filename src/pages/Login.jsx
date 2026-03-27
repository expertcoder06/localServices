import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
   const [resending, setResending] = useState(false);
   const [resendSuccess, setResendSuccess] = useState(false);
   const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
   const [otp, setOtp] = useState(['', '', '', '', '', '']);
   const [generatedOtp, setGeneratedOtp] = useState('');
   const [otpStep, setOtpStep] = useState(1); // 1: Email, 2: OTP
   const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendSuccess(false);
    setError(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: { emailRedirectTo: `${window.location.origin}/verified-success` }
    });
    setResending(false);
    if (error) {
      setError(error.message);
    } else {
      setResendSuccess(true);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        setError("Please verify your email first.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
    } else {
      redirectUserByRole(data.user.id);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");
    setLoading(true);
    setError(null);

    try {
      // 1. Check if user exists first
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (!profile) throw new Error("Account not found. Please sign up first.");
      
      // 2. Generate and Send OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setOtpStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const redirectUserByRole = async (userId) => {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (profile && profile.role === 'client') return navigate('/dashboard');
    if (profile && profile.role === 'provider') {
      const { data: prov } = await supabase.from('service_providers').select('status').eq('id', userId).maybeSingle();
      if (prov && (prov.status === 'pending' || prov.status === 'rejected')) navigate('/pending-approval');
      else navigate('/provider-dashboard');
      return;
    }
    navigate('/dashboard'); // Fallback
  };

  const handleOtpLoginVerify = async (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered !== generatedOtp) return setError("Invalid OTP.");

    setLoading(true);
    try {
      // Find the user by email to get their ID
      const { data: userRecord } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (!userRecord) throw new Error("Account not found.");

      // For this demo, we'll inform them and mock the reset link
      setError("Success! Code verified. Please reset your password or navigate to dashboard.");
      setTimeout(() => redirectUserByRole(userRecord.id), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>Welcome Back</h2>
        
        {error && (
          <div style={{ marginBottom: '1rem', textAlign: 'center', padding: '1rem', background: '#ffe4e6', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--error)', fontWeight: 500, marginBottom: error.includes('verify your email') ? '0.5rem' : '0' }}>{error}</div>
            {error.includes('verify your email') && (
              <button 
                type="button" 
                onClick={handleResend} 
                disabled={resending}
                style={{
                  background: 'none', border: 'none', color: 'var(--tertiary)', textDecoration: 'underline', 
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        )}
        {resendSuccess && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem', background: '#e6ffed', borderRadius: 'var(--radius-sm)' }}>Verification email sent successfully!</div>}
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button" 
            onClick={() => { setLoginMode('password'); setError(null); }}
            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: loginMode === 'password' ? 'var(--primary)' : 'transparent', color: loginMode === 'password' ? 'white' : 'var(--secondary)', border: '1px solid var(--outline-variant)' }}
          >Password</button>
          <button 
            type="button" 
            onClick={() => { setLoginMode('otp'); setOtpStep(1); setError(null); }}
            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: loginMode === 'otp' ? 'var(--primary)' : 'transparent', color: loginMode === 'otp' ? 'white' : 'var(--secondary)', border: '1px solid var(--outline-variant)' }}
          >OTP Login</button>
        </div>

        {loginMode === 'password' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>Password</label>
                <button type="button" onClick={() => setLoginMode('otp')} style={{ background: 'none', border: 'none', color: 'var(--tertiary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>Forgot Password?</button>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem' }}
              className="neon-glow-hover"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={otpStep === 1 ? handleSendOtp : handleOtpLoginVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {otpStep === 1 ? (
              <>
                <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}>Enter your email to receive a login code.</p>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                  {loading ? 'Sending...' : 'Send Login Code'}
                </button>
              </>
            ) : (
              <>
                <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}>Enter the 6-digit code sent to your email.</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  {otp.map((data, index) => (
                    <input
                      key={index} type="text" maxLength="1" value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onFocus={(e) => e.target.select()}
                      style={{ width: '2.5rem', height: '3rem', textAlign: 'center', fontSize: '1.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container)' }}
                      required
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading} style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button type="button" onClick={() => setOtpStep(1)} style={{ background: 'none', border: 'none', color: 'var(--tertiary)', fontWeight: 'bold', cursor: 'pointer' }}>Change Email</button>
              </>
            )}
          </form>
        )}
        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--tertiary)', fontWeight: 'bold' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
