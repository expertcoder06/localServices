import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }
const DAY_COLORS = {
  Monday: '#3182ce', Tuesday: '#805ad5', Wednesday: '#38a169',
  Thursday: '#dd6b20', Friday: '#e53e3e', Saturday: '#319795', Sunday: '#d69e2e'
}

const TIME_OPTIONS = []
for (let h = 0; h < 24; h++) {
  for (let m of [0, 30]) {
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    const label = h === 0 ? `12:${mm} AM` : h < 12 ? `${h}:${mm} AM` : h === 12 ? `12:${mm} PM` : `${h - 12}:${mm} PM`
    TIME_OPTIONS.push({ value: `${hh}:${mm}`, label })
  }
}

function TimeSelect({ value, onChange, style }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)',
        padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--on-surface)',
        background: '#fff', cursor: 'pointer', outline: 'none', ...style
      }}
    >
      {TIME_OPTIONS.map(t => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  )
}

export default function ProviderAvailabilitySchedule() {
  const [schedule, setSchedule] = useState([]) // [{day, slots:[{from, to}]}]
  const [selectedDays, setSelectedDays] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  // Fetch existing schedule from DB
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('service_providers')
        .select('availability_schedule')
        .eq('id', user.id)
        .maybeSingle()

      if (data?.availability_schedule && Array.isArray(data.availability_schedule) && data.availability_schedule.length > 0) {
        setSchedule(data.availability_schedule)
        setSelectedDays(new Set(data.availability_schedule.map(s => s.day)))
      }
      setLoading(false)
    }
    load()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`provider_schedule_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'service_providers',
        filter: `id=eq.${userId}`
      }, payload => {
        const newSched = payload.new?.availability_schedule
        if (newSched && Array.isArray(newSched)) {
          setSchedule(newSched)
          setSelectedDays(new Set(newSched.map(s => s.day)))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId])

  const toggleDay = (day) => {
    const next = new Set(selectedDays)
    if (next.has(day)) {
      next.delete(day)
      setSchedule(prev => prev.filter(s => s.day !== day))
    } else {
      next.add(day)
      setSchedule(prev => {
        if (prev.find(s => s.day === day)) return prev
        return [...prev, { day, slots: [{ from: '09:00', to: '17:00' }] }]
      })
    }
    setSelectedDays(next)
  }

  const addSlot = (day) => {
    setSchedule(prev => prev.map(s =>
      s.day === day ? { ...s, slots: [...s.slots, { from: '09:00', to: '17:00' }] } : s
    ))
  }

  const removeSlot = (day, idx) => {
    setSchedule(prev => prev.map(s =>
      s.day === day
        ? { ...s, slots: s.slots.filter((_, i) => i !== idx) }
        : s
    ).filter(s => s.slots.length > 0 || !selectedDays.has(s.day)))
  }

  const updateSlot = (day, idx, field, val) => {
    setSchedule(prev => prev.map(s =>
      s.day === day
        ? { ...s, slots: s.slots.map((slot, i) => i === idx ? { ...slot, [field]: val } : slot) }
        : s
    ))
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    const { error } = await supabase
      .from('service_providers')
      .update({ availability_schedule: schedule })
      .eq('id', userId)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const orderedSchedule = DAYS
    .filter(d => selectedDays.has(d))
    .map(d => schedule.find(s => s.day === d))
    .filter(Boolean)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--on-surface-variant)' }}>
        <span className="material-icons" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'block', marginBottom: '1rem' }}>sync</span>
        Loading your schedule...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem' }}>
              <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)', fontSize: '1.6rem' }}>event_available</span>
              Availability Schedule
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
              Set your weekly availability so customers can see when you're free.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || selectedDays.size === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: saved ? '#38a169' : 'var(--primary)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1.4rem', fontSize: '0.9rem', fontWeight: 700,
              cursor: saving || selectedDays.size === 0 ? 'not-allowed' : 'pointer',
              opacity: saving || selectedDays.size === 0 ? 0.7 : 1,
              transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(26,54,93,0.25)'
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>
              {saved ? 'check_circle' : saving ? 'sync' : 'save'}
            </span>
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem',
        border: '1px solid var(--outline-variant)', marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Select Working Days
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '100px',
                border: selectedDays.has(day) ? `2px solid ${DAY_COLORS[day]}` : '2px solid var(--outline-variant)',
                background: selectedDays.has(day) ? `color-mix(in srgb, ${DAY_COLORS[day]} 12%, white)` : '#f9f9f9',
                color: selectedDays.has(day) ? DAY_COLORS[day] : 'var(--on-surface-variant)',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.18s ease',
                transform: selectedDays.has(day) ? 'translateY(-1px)' : 'none',
                boxShadow: selectedDays.has(day) ? `0 3px 10px color-mix(in srgb, ${DAY_COLORS[day]} 30%, transparent)` : 'none',
              }}
            >
              {DAY_SHORT[day]}
              {selectedDays.has(day) && (
                <span className="material-icons" style={{ fontSize: '0.9rem', marginLeft: '4px', verticalAlign: 'middle' }}>check</span>
              )}
            </button>
          ))}
        </div>
        {selectedDays.size === 0 && (
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--outline)', fontStyle: 'italic' }}>
            💡 Click days above to mark them as working days
          </p>
        )}
      </div>

      {/* Time Slots per Day */}
      {orderedSchedule.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orderedSchedule.map(daySchedule => (
            <div key={daySchedule.day} style={{
              background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem',
              border: `1px solid color-mix(in srgb, ${DAY_COLORS[daySchedule.day]} 30%, var(--outline-variant))`,
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid ${DAY_COLORS[daySchedule.day]}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: `color-mix(in srgb, ${DAY_COLORS[daySchedule.day]} 15%, white)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${DAY_COLORS[daySchedule.day]}`
                  }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: DAY_COLORS[daySchedule.day] }}>
                      {DAY_SHORT[daySchedule.day]}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{daySchedule.day}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                      {daySchedule.slots.length} time slot{daySchedule.slots.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => addSlot(daySchedule.day)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent',
                      border: `1px solid ${DAY_COLORS[daySchedule.day]}`, color: DAY_COLORS[daySchedule.day],
                      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '0.9rem' }}>add</span>
                    Add Slot
                  </button>
                  <button
                    onClick={() => toggleDay(daySchedule.day)}
                    style={{
                      background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.3)',
                      color: '#e53e3e', borderRadius: 'var(--radius-sm)', padding: '0.3rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}
                    title="Remove this day"
                  >
                    <span className="material-icons" style={{ fontSize: '1rem' }}>close</span>
                  </button>
                </div>
              </div>

              {/* Slots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {daySchedule.slots.map((slot, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 1rem',
                  }}>
                    <span className="material-icons" style={{ fontSize: '1rem', color: DAY_COLORS[daySchedule.day] }}>schedule</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>From</span>
                    <TimeSelect
                      value={slot.from}
                      onChange={val => updateSlot(daySchedule.day, idx, 'from', val)}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>To</span>
                    <TimeSelect
                      value={slot.to}
                      onChange={val => updateSlot(daySchedule.day, idx, 'to', val)}
                    />
                    <div style={{ flex: 1 }} />
                    <span style={{
                      fontSize: '0.7rem', background: `color-mix(in srgb, ${DAY_COLORS[daySchedule.day]} 10%, white)`,
                      color: DAY_COLORS[daySchedule.day], padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: 700
                    }}>
                      {getTimeDiff(slot.from, slot.to)}
                    </span>
                    {daySchedule.slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(daySchedule.day, idx)}
                        style={{
                          background: 'none', border: 'none', color: '#e53e3e',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: '1rem' }}>remove_circle_outline</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Summary */}
      {orderedSchedule.length > 0 && (
        <div style={{
          marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem', color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="material-icons" style={{ color: '#f6ad55' }}>auto_awesome</span>
            <h3 style={{ color: 'white', fontSize: '1rem' }}>Weekly Summary</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {orderedSchedule.map(ds => (
              <div key={ds.day} style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f6ad55', marginBottom: '0.2rem' }}>
                  {DAY_SHORT[ds.day]}
                </div>
                {ds.slots.map((slot, i) => (
                  <div key={i} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)' }}>
                    {formatTime(slot.from)} – {formatTime(slot.to)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {orderedSchedule.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem', background: '#fff',
          borderRadius: 'var(--radius-xl)', border: '2px dashed var(--outline-variant)',
          color: 'var(--on-surface-variant)'
        }}>
          <span className="material-icons" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: 'var(--outline-variant)' }}>
            event_busy
          </span>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No days selected yet</p>
          <p style={{ fontSize: '0.82rem' }}>Select working days above to set your time slots</p>
        </div>
      )}
    </div>
  )
}

function getTimeDiff(from, to) {
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  let mins = (th * 60 + tm) - (fh * 60 + fm)
  if (mins <= 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hh = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}
