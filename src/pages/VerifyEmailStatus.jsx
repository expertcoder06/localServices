import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const VerifyEmailStatus = () => {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const navigate = useNavigate();

  useEffect(() => {
    // When Supabase redirects here after email verification, it usually appends a #access_token=... to the URL.
    // Supabase client automatically handles logging the user in.
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setStatus('error');
        return;
      }

      if (session) {
        setStatus('success');
      } else {
        // Just in case it hasn't processed the token yet, wait a bit and recheck
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (delayedSession) {
            setStatus('success');
          } else {
            setStatus('error');
          }
        }, 1500);
      }
    };

    checkSession();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <h2 style={{ color: 'var(--primary)' }}>Verifying your email...</h2>
            <p style={{ marginTop: '1.5rem', color: 'var(--secondary)' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 style={{ color: 'var(--primary)' }}>सफलता / Success!</h2>
            <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--secondary)', lineHeight: 1.6 }}>
              Your email has been successfully verified. You can now access your account.
            </p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                marginTop: '2rem', padding: '1rem 2rem', background: 'var(--primary)', color: 'var(--on-primary)', 
                borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer'
              }}
              className="neon-glow-hover"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ color: 'var(--error)' }}>Verification Failed</h2>
            <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--secondary)', lineHeight: 1.6 }}>
              The verification link is invalid or has expired. Please try logging in to resend the verification email.
            </p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: '2rem', color: 'var(--tertiary)', fontWeight: 'bold', textDecoration: 'none' }}>
              Return to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailStatus;
