import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }
const DAY_COLORS = {
  Monday: '#3182ce', Tuesday: '#805ad5', Wednesday: '#38a169',
  Thursday: '#dd6b20', Friday: '#e53e3e', Saturday: '#319795', Sunday: '#d69e2e'
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hh = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}

function getTodayDay() {
  const d = new Date().getDay() // 0 = Sunday
  return DAYS[d === 0 ? 6 : d - 1]
}

/**
 * ProviderScheduleBar
 * Shows schedule for a single provider (when used in profile modal)
 * OR all providers when used standalone (in customer dashboard schedule tab)
 */
export default function ProviderScheduleBar({ providerId = null, compact = false }) {
  const [providers, setProviders] = useState([]) // all or single
  const [loading, setLoading] = useState(true)
  const [today] = useState(getTodayDay())

  useEffect(() => {
    async function fetchSchedules() {
      let query = supabase
        .from('service_providers')
        .select('id, name, categories, city, state, availability_schedule, status, rating, trust_score')
        .eq('status', 'approved')
        .not('availability_schedule', 'is', null)

      if (providerId) {
        query = query.eq('id', providerId)
      }

      const { data, error } = await query
      if (!error && data) {
        const filtered = data.filter(p =>
          p.availability_schedule && Array.isArray(p.availability_schedule) && p.availability_schedule.length > 0
        )
        setProviders(filtered)
      }
      setLoading(false)
    }

    fetchSchedules()

    // Real-time subscription
    const channel = supabase
      .channel('provider_schedules_customer')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'service_providers'
      }, () => {
        fetchSchedules()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [providerId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
        <span className="material-icons" style={{ animation: 'spin 1s linear infinite', display: 'block', fontSize: '1.5rem', margin: '0 auto 0.5rem' }}>sync</span>
        {!compact && 'Loading provider schedules...'}
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '1rem' : '3rem', color: 'var(--on-surface-variant)' }}>
        <span className="material-icons" style={{ fontSize: compact ? '1.5rem' : '3rem', display: 'block', marginBottom: '0.5rem', color: 'var(--outline-variant)' }}>
          event_busy
        </span>
        <p style={{ fontSize: compact ? '0.8rem' : '0.95rem' }}>
          {providerId ? 'This provider has not set their availability yet.' : 'No providers have set their availability yet.'}
        </p>
      </div>
    )
  }

  // Single provider compact view (for profile modal)
  if (providerId && compact) {
    const provider = providers[0]
    return <SingleProviderSchedule provider={provider} today={today} compact />
  }

  // All providers view (schedule tab in customer dashboard)
  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>
          <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)', fontSize: '1.5rem' }}>calendar_month</span>
          Provider Availability
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
          Real-time schedules from {providers.length} provider{providers.length !== 1 ? 's' : ''} ·{' '}
          <strong style={{ color: '#38a169' }}>Today: {today}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {providers.map(provider => (
          <SingleProviderSchedule key={provider.id} provider={provider} today={today} />
        ))}
      </div>
    </div>
  )
}

function SingleProviderSchedule({ provider, today, compact = false }) {
  const initials = provider.name
    ? provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'
  const AVATAR_COLORS = ['#d69e2e', '#805ad5', '#38a169', '#319795', '#e53e3e', '#3182ce', '#dd6b20']
  const avatarColor = AVATAR_COLORS[provider.name?.charCodeAt(0) % AVATAR_COLORS.length] || '#3182ce'

  const todaySchedule = provider.availability_schedule?.find(s => s.day === today)
  const isAvailableToday = todaySchedule && todaySchedule.slots?.length > 0

  if (compact) {
    return (
      <div style={{ background: '#f7f9fc', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem', color: 'var(--primary)' }}>event_available</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>Weekly Availability</span>
          {isAvailableToday ? (
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(56,161,105,0.12)', color: '#38a169', padding: '0.15rem 0.5rem', borderRadius: '100px', fontWeight: 700 }}>
              Available Today
            </span>
          ) : (
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(229,62,62,0.1)', color: '#e53e3e', padding: '0.15rem 0.5rem', borderRadius: '100px', fontWeight: 700 }}>
              Off Today
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {DAYS.map(day => {
            const ds = provider.availability_schedule?.find(s => s.day === day)
            const isToday = day === today
            return (
              <div key={day} style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)',
                background: ds ? `color-mix(in srgb, ${DAY_COLORS[day]} 12%, white)` : '#f0f0f0',
                border: isToday ? `2px solid ${ds ? DAY_COLORS[day] : '#ccc'}` : `1px solid ${ds ? 'color-mix(in srgb, ' + DAY_COLORS[day] + ' 30%, white)' : '#e0e0e0'}`,
                opacity: ds ? 1 : 0.45,
                minWidth: '52px'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: ds ? DAY_COLORS[day] : '#aaa', marginBottom: '0.2rem' }}>
                  {DAY_SHORT[day]}{isToday ? ' ●' : ''}
                </div>
                {ds ? ds.slots.slice(0, 1).map((slot, i) => (
                  <div key={i} style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>
                    {formatTime(slot.from)}<br />{formatTime(slot.to)}
                  </div>
                )) : (
                  <div style={{ fontSize: '0.62rem', color: '#bbb' }}>Off</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Full card view
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem',
      border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Provider header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: `color-mix(in srgb, ${avatarColor} 15%, white)`,
          border: `2px solid ${avatarColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.85rem', color: avatarColor, flexShrink: 0
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{provider.name}</h3>
            {isAvailableToday && (
              <span style={{
                fontSize: '0.65rem', background: 'rgba(56,161,105,0.1)', color: '#38a169',
                padding: '0.15rem 0.6rem', borderRadius: '100px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '3px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38a169', animation: 'pulse 1.5s infinite' }}></span>
                Available Today
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
            {(provider.categories || []).slice(0, 2).join(', ') || 'Service Provider'} ·{' '}
            {provider.city ? `${provider.city}, ${provider.state}` : 'Nearby'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {provider.rating && (
            <div style={{ fontSize: '0.8rem', color: '#d69e2e', fontWeight: 700 }}>
              ★ {Number(provider.rating).toFixed(1)}
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
            Trust: {Number(provider.trust_score || 0).toFixed(1)}/10
          </div>
        </div>
      </div>

      {/* Week schedule grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
        {DAYS.map(day => {
          const ds = provider.availability_schedule?.find(s => s.day === day)
          const isToday = day === today
          return (
            <div key={day} style={{
              borderRadius: 'var(--radius-md)', padding: '0.6rem 0.4rem',
              textAlign: 'center',
              background: ds
                ? `color-mix(in srgb, ${DAY_COLORS[day]} 10%, white)`
                : '#f7f7f7',
              border: isToday
                ? `2px solid ${ds ? DAY_COLORS[day] : '#ccc'}`
                : `1px solid ${ds ? 'color-mix(in srgb, ' + DAY_COLORS[day] + ' 25%, white)' : '#eee'}`,
              opacity: ds ? 1 : 0.5,
              transition: 'all 0.15s',
              position: 'relative'
            }}>
              {isToday && (
                <div style={{
                  position: 'absolute', top: '2px', right: '4px', width: '5px', height: '5px',
                  borderRadius: '50%', background: ds ? DAY_COLORS[day] : '#aaa'
                }} />
              )}
              <div style={{
                fontSize: '0.65rem', fontWeight: 800,
                color: ds ? DAY_COLORS[day] : '#bbb',
                marginBottom: '0.3rem'
              }}>
                {DAY_SHORT[day]}
              </div>
              {ds ? (
                ds.slots.map((slot, i) => (
                  <div key={i} style={{ fontSize: '0.58rem', color: 'var(--on-surface)', lineHeight: 1.4, fontWeight: 600 }}>
                    {formatTime(slot.from)}<br />{formatTime(slot.to)}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.6rem', color: '#bbb', fontWeight: 600 }}>Off</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Today's detail */}
      {isAvailableToday && (
        <div style={{
          marginTop: '1rem', background: 'rgba(56,161,105,0.06)', borderRadius: 'var(--radius-md)',
          padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
          border: '1px solid rgba(56,161,105,0.15)'
        }}>
          <span className="material-icons" style={{ color: '#38a169', fontSize: '1rem' }}>today</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38a169' }}>
            Today's hours: {todaySchedule.slots.map(s => `${formatTime(s.from)} – ${formatTime(s.to)}`).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
