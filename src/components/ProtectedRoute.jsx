import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async (session) => {
      if (!session) {
        navigate('/login');
        setLoading(false);
        return;
      }



      if (requireAdmin) {
        const { data: admin } = await supabase
          .from('admin')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (!admin) {
          navigate('/dashboard'); // or anywhere else for unauthorized
          setLoading(false);
          return;
        }
      }
      
      setAuthenticated(true);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      checkUser(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireAdmin]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return authenticated ? children : null;
}
