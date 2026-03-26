import { useState, useEffect } from 'react'


const MILESTONES = [
  { label: 'Job Accepted', status: 'done', time: '09:00 AM' },
  { label: 'Arrived & Started', status: 'active', time: 'Now' },
  { label: 'Job Completed', status: 'upcoming', time: '--' },
  { label: 'Payment Released', status: 'upcoming', time: '--' },
]

const WALLET_TRANSACTIONS = [
  { label: 'AC Repair – Priya K.', amount: '+₹1,200', time: 'Today, 8:00 AM', type: 'credit' },
  { label: 'Plumbing – Rahul M.', amount: '+₹650', time: 'Yesterday', type: 'credit' },
  { label: 'Platform fee (2.5%)', amount: '−₹48', time: 'Yesterday', type: 'debit' },
  { label: 'Withdrawal to bank', amount: '−₹5,000', time: 'Mar 24', type: 'debit' },
  { label: 'Electrician – Meera', amount: '+₹2,100', time: 'Mar 23', type: 'credit' },
]

export default function JobExecutionWallet({ job, onBack }) {
  const [walletBalance] = useState(34450)
  const [pendingEarning] = useState(job?.bidPrice ?? job?.budgetMin ?? 800)
  const [isAccepted, setIsAccepted] = useState(false)


  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>

      {/* Left: Job Execution */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: '1px solid var(--outline-variant)', borderRadius: '50%',
              width: '36px', height: '36px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)' }}>arrow_back</span>
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{job?.title ?? 'Smart Home System Installation'}</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
              <span className="material-icons" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '2px' }}>location_on</span>
              {job?.address ?? 'Sector 21, Gurgaon'} · Bid: ₹{(job?.bidPrice ?? job?.budgetMin ?? 800).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bid Status or Execution Content */}
        {!isAccepted ? (
          <section style={{
            background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem',
            border: '2px dashed var(--outline-variant)', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(214,158,46,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="material-icons" style={{ color: '#d69e2e', fontSize: '2.5rem' }}>hourglass_empty</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Bid Status: Pending Approval</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', maxWidth: '350px', lineHeight: 1.6 }}>
                Your bid of <strong>₹{pendingEarning.toLocaleString()}</strong> has been submitted. The customer is currently reviewing proposals.
              </p>
            </div>
            <div style={{ padding: '0.8rem 1.2rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px', color: 'var(--primary)' }}>info</span>
              Bids usually get accepted within <strong>2-4 hours</strong>.
            </div>
            
            {/* Simulation Button for Demo */}
            <button 
              className="btn btn--secondary" 
              style={{ marginTop: '1rem', background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}
              onClick={() => setIsAccepted(true)}
            >
              Simulate Acceptance (Demo)
            </button>
          </section>
        ) : (
          <>
            {/* Client Card */}
            <section style={{
              background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.2rem 1.5rem',
              border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(49,130,206,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                color: '#3182ce', fontSize: '1rem', flexShrink: 0,
              }}>{job?.customerName?.charAt(0) || 'S'}{job?.customerName?.split(' ')[1]?.charAt(0) || 'J'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job?.customerName || 'Sarah Jenkins'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Verified Client · Rated 4.8 ★</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn--ghost" style={{ borderRadius: '50%', padding: '0.4rem', border: '1px solid var(--outline-variant)' }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem' }}>chat</span>
                </button>
                <button className="btn btn--ghost" style={{ borderRadius: '50%', padding: '0.4rem', border: '1px solid var(--outline-variant)' }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem' }}>call</span>
                </button>
              </div>
            </section>

            {/* Milestone Tracker */}
            <section style={{
              background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem',
              border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>linear_scale</span>
                Job Milestones
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {MILESTONES.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: m.status === 'done' ? '#38a169' : m.status === 'active' ? 'var(--primary)' : 'var(--outline-variant)',
                        flexShrink: 0,
                      }}>
                        {m.status === 'done' && <span className="material-icons" style={{ color: 'white', fontSize: '0.85rem' }}>check</span>}
                        {m.status === 'active' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                      </div>
                      {i < MILESTONES.length - 1 && (
                        <div style={{
                          width: '2px', height: '28px',
                          background: m.status === 'done' ? '#38a169' : 'var(--outline-variant)',
                        }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < MILESTONES.length - 1 ? '0.5rem' : 0 }}>
                      <div style={{
                        fontSize: '0.85rem', fontWeight: m.status === 'active' ? 700 : 500,
                        color: m.status === 'upcoming' ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                      }}>{m.label}</div>
                      <div style={{ fontSize: '0.7rem', color: m.status === 'active' ? 'var(--primary)' : 'var(--outline)', fontWeight: m.status === 'active' ? 600 : 400 }}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Mark Complete Button */}
            <button
              className="btn btn--primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, marginTop: '1rem' }}
              onClick={onBack}
            >
              <span className="material-icons" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }}>check_circle</span>
              Mark Job as Complete
            </button>
          </>
        )}
      </div>

      {/* Right: Wallet */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        {/* Wallet Balance */}
        <section style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem', color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="material-icons" style={{ color: '#f6ad55', fontSize: '1.2rem' }}>account_balance_wallet</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>₹{walletBalance.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>+₹{pendingEarning.toLocaleString()} pending from this job</div>

          <div style={{
            marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)',
          }}>
            <span className="material-icons" style={{ fontSize: '1rem', color: '#f6ad55' }}>auto_awesome</span>
            <span>₹{pendingEarning} added to wallet on completion</span>
          </div>

          <button className="btn" style={{
            marginTop: '1rem', width: '100%', padding: '0.5rem',
            background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.82rem',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(8px)',
          }}>
            <span className="material-icons" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: '4px' }}>north_east</span>
            Withdraw Funds
          </button>
        </section>

        {/* AI Encouragement */}
        <section style={{
          background: 'rgba(221,107,32,0.07)', border: '1.5px dashed #dd6b20',
          borderRadius: 'var(--radius-xl)', padding: '1.2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="material-icons" style={{ color: '#dd6b20', fontSize: '1.1rem' }}>tips_and_updates</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dd6b20' }}>AI Coach</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
            "Keep up the great work! You're in the <strong style={{ color: 'var(--primary)' }}>Top 5%</strong> of providers this week. Completing this job on time boosts your rating by an estimated <strong style={{ color: '#38a169' }}>+0.1 ★</strong>."
          </p>
        </section>

        {/* Earnings Quick Stats */}
        <section style={{
          background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.2rem 1.5rem',
          border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.9rem' }}>Today's Earnings</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            {[
              { label: 'Completed', value: '₹1,850', color: '#38a169' },
              { label: 'Pending', value: `₹${pendingEarning.toLocaleString()}`, color: '#d69e2e' },
            ].map(e => (
              <div key={e.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: e.color }}>{e.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{e.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Wallet Transactions */}
        <section style={{
          background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.2rem 1.5rem',
          border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)',
          flex: 1,
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.9rem' }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {WALLET_TRANSACTIONS.map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: tx.type === 'credit' ? 'rgba(56,161,105,0.12)' : 'rgba(229,62,62,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ fontSize: '0.9rem', color: tx.type === 'credit' ? '#38a169' : '#e53e3e' }}>
                    {tx.type === 'credit' ? 'south_west' : 'north_east'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)' }}>{tx.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--outline)' }}>{tx.time}</div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: tx.type === 'credit' ? '#38a169' : '#e53e3e', flexShrink: 0 }}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
