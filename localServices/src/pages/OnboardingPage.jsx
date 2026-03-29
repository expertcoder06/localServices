import { useNavigate } from 'react-router-dom'

export default function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-container-low)',
      padding: 'var(--space-6)'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-12) var(--space-8)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>Welcome to LOCAL-SERVICES</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-8)' }}>
          How would you like to use our platform today?
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {/* Client Option */}
          <div 
            onClick={() => navigate('/dashboard')}
            style={{
              cursor: 'pointer',
              border: '2px solid var(--outline-variant)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'var(--surface-container)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--outline-variant)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>person_search</span>
            <h3 style={{ marginBottom: '0.5rem' }}>I am a Client</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>I want to hire trusted local professionals for my needs.</p>
          </div>

          {/* Provider Option */}
          <div 
            onClick={() => navigate('/provider-dashboard')}
            style={{
              cursor: 'pointer',
              border: '2px solid var(--outline-variant)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--tertiary)';
              e.currentTarget.style.backgroundColor = 'rgba(221,107,32,0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--outline-variant)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--tertiary)', marginBottom: '1rem' }}>handyman</span>
            <h3 style={{ marginBottom: '0.5rem' }}>I am a Provider</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>I want to offer my services and grow my business.</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="btn btn--ghost" 
          style={{ marginTop: 'var(--space-8)' }}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
