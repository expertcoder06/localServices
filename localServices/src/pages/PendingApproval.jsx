import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function PendingApproval() {
  const [status, setStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data: provider } = await supabase.from('service_providers').select('status, rejection_reason').eq('id', user.id).maybeSingle();
      if (provider) {
        setStatus(provider.status);
        setRejectionReason(provider.rejection_reason);
      }
      setLoading(false);
    };
    fetchStatus();
  }, [navigate]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', backgroundColor: 'var(--surface)' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-lg)' }}>
        {status === 'rejected' ? (
          <>
            <h2 style={{ color: 'var(--error)' }}>Application Rejected</h2>
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--error-container)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--on-error-container)', fontWeight: 500 }}>
                Your profile has been rejected.
              </p>
              <p style={{ marginTop: '0.75rem', fontSize: '1rem', color: 'var(--on-error-container)', fontStyle: 'italic' }}>
                Reason: "{rejectionReason || 'No specific reason provided'}"
              </p>
            </div>
            <p style={{ marginTop: '1.5rem', color: 'var(--secondary)' }}>
              Please review your details and try re-registering.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link to="/signup" className="btn btn--primary" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold' }}>
                Back to Re-register
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ color: 'var(--primary)' }}>Application Received</h2>
            <p style={{ marginTop: '1.5rem', fontSize: '1.25rem', color: 'var(--secondary)', fontWeight: 500, lineHeight: 1.6 }}>
              Welcome to LOCAL-SERVICES, the new era of opportunities. We are reviewing your profile and will contact you shortly. Thank you!
            </p>
            <div style={{ marginTop: '2rem' }}>
              <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} className="btn btn--outline" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--outline)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Logout for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
