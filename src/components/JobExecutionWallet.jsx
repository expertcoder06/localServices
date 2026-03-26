import { useState, useEffect } from 'react'

const CHECKLIST = [
  { id: 1, label: 'Site assessment & client brief', done: true },
  { id: 2, label: 'Unpack & inspect all equipment', done: true },
  { id: 3, label: 'Install smart hub & wiring', done: true },
  { id: 4, label: 'Configure lighting zones', done: false },
  { id: 5, label: 'Connect HVAC & thermostat', done: false },
  { id: 6, label: 'Test all automations end-to-end', done: false },
  { id: 7, label: 'Client walkthrough & sign-off', done: false },
]

const MILESTONES = [
  { label: 'Job Accepted', status: 'done', time: '09:00 AM' },
  { label: 'En Route', status: 'done', time: '09:15 AM' },
  { label: 'Arrived & Started', status: 'done', time: '09:30 AM' },
  { label: 'In Progress', status: 'active', time: 'Now' },
  { label: 'Pending Completion', status: 'upcoming', time: '--' },
  { label: 'Payment Released', status: 'upcoming', time: '--' },
]

const WALLET_TRANSACTIONS = [
  { label: 'AC Repair – Priya K.', amount: '+₹1,200', time: 'Today, 8:00 AM', type: 'credit' },
  { label: 'Plumbing – Rahul M.', amount: '+₹650', time: 'Yesterday', type: 'credit' },
  { label: 'Platform fee (2.5%)', amount: '−₹48', time: 'Yesterday', type: 'debit' },
  { label: 'Withdrawal to bank', amount: '−₹5,000', time: 'Mar 24', type: 'debit' },
  { label: 'Electrician – Meera', amount: '+₹2,100', time: 'Mar 23', type: 'credit' },
]

function useTimer(initial = 5085) {
  const [seconds, setSeconds] = useState(initial)
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function JobExecutionWallet({ job, onBack }) {
  const timer = useTimer()
  const [checklist, setChecklist] = useState(CHECKLIST)
  const [walletBalance] = useState(34450)
  const [pendingEarning] = useState(job?.bidPrice ?? job?.budgetMin ?? 800)

  const doneCount = checklist.filter(c => c.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c))
  }

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
          <div style={{
            marginLeft: 'auto', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            borderRadius: 'var(--radius-lg)', padding: '0.6rem 1.2rem', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Duration</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>{timer}</div>
          </div>
        </div>

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
          }}>SJ</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Sarah Jenkins</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Client · Verified ID · Rated 4.8 ★</div>
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

        {/* Service Checklist */}
        <section style={{
          background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem',
          border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>fact_check</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>Service Checklist</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{doneCount}/{checklist.length} done</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', borderRadius: '6px', background: 'var(--outline-variant)', overflow: 'hidden', marginBottom: '1.2rem' }}>
            <div style={{
              height: '100%', borderRadius: '6px', background: 'linear-gradient(90deg, var(--primary), #38a169)',
              width: `${progress}%`, transition: 'width 0.4s ease',
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: item.done ? 'rgba(56,161,105,0.06)' : 'transparent',
                  border: item.done ? '1px solid rgba(56,161,105,0.2)' : '1px solid transparent',
                }}
              >
                <span className="material-icons" style={{
                  color: item.done ? '#38a169' : 'var(--outline-variant)',
                  fontSize: '1.2rem', transition: 'color 0.2s', flexShrink: 0,
                }}>
                  {item.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span style={{
                  fontSize: '0.85rem', color: item.done ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                  textDecoration: item.done ? 'line-through' : 'none', transition: 'color 0.2s',
                }}>{item.label}</span>
              </div>
            ))}
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

        {/* Mark Complete Button */}
        <button
          className="btn btn--primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
          onClick={onBack}
        >
          <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px' }}>task_alt</span>
          Mark Job as Complete
        </button>
      </div>
    </div>
  )
}
