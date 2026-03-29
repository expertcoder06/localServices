import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      const userId = data.user.id;
      
      // Check if user is an admin
      const { data: admin } = await supabase.from('admin').select('id').eq('id', userId).maybeSingle();
      if (admin) {
        navigate('/admin');
      } else {
        // Not an admin, sign out and show error
        await supabase.auth.signOut();
        setError('Access Denied. You are not an administrator.');
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface)' }}>
      <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-fixed-dim)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>Admin Portal</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--secondary)', fontSize: '0.875rem' }}>Secure Login for System Administrators</p>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem', background: 'var(--error-container)', borderRadius: 'var(--radius-sm)', fontWeight: '500' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-highest)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-highest)' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'var(--primary)', 
                color: 'var(--on-primary)', 
                borderRadius: 'var(--radius-sm)', 
                fontWeight: 'bold',
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
            }}
            className="neon-glow-hover"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
