'use client'
import { useState } from 'react'
import { useTimerStore, Settings, DEFAULT_SETTINGS } from '@/store/useTimerStore'

interface Props {
  open: boolean
  onClose: () => void
  accent: string
}

const COLOR_THEMES = [
  { name: 'Tomato', color: '#e05c5c' },
  { name: 'Mint',   color: '#5ce0a8' },
  { name: 'Sky',    color: '#5c9ee0' },
  { name: 'Violet', color: '#9b7fe8' },
  { name: 'Amber',  color: '#e0a85c' },
  { name: 'Rose',   color: '#e05c9b' },
]

const ALARM_SOUNDS = ['Bell', 'Digital', 'Kitchen', 'Bird', 'Chime']
const FOCUS_SOUNDS = ['None', 'Rain', 'Forest', 'Cafe', 'Lo-fi']

export default function SettingsModal({ open, onClose, accent }: Props) {
  const { settings, applySettings } = useTimerStore()

  // Draft is initialised from store once — the parent passes key={open ? 'open' : 'closed'}
  // so React remounts this component each time the modal opens, giving us a fresh state.
  const [draft, setDraft] = useState<Settings>(settings)

  if (!open) return null

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    applySettings(draft)
    onClose()
  }

  const handleReset = () => setDraft(DEFAULT_SETTINGS)

  // Use draft colorTheme as live accent inside modal
  const liveAccent = draft.colorTheme

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[88vh] bg-[#18181f] rounded-2xl shadow-2xl border border-white/10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-lg font-bold tracking-wider text-white/90">SETTINGS</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Reset
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-7">

          {/* ── TIMER ── */}
          <Section title="Timer">
            <div className="flex flex-col gap-4">
              <SubLabel>Time (minutes)</SubLabel>
              <div className="grid grid-cols-3 gap-3">
                <DurationInput label="Pomodoro"    value={draft.pomoDuration}  onChange={v => set('pomoDuration', v)}  accent={liveAccent} />
                <DurationInput label="Short Break" value={draft.shortDuration} onChange={v => set('shortDuration', v)} accent={liveAccent} />
                <DurationInput label="Long Break"  value={draft.longDuration}  onChange={v => set('longDuration', v)}  accent={liveAccent} />
              </div>
              <Divider />
              <ToggleRow label="Auto Start Breaks"    value={draft.autoStartBreak} onChange={v => set('autoStartBreak', v)} accent={liveAccent} />
              <ToggleRow label="Auto Start Pomodoros" value={draft.autoStartPomo}  onChange={v => set('autoStartPomo', v)}  accent={liveAccent} />
              <Divider />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-white/70">Long Break interval</span>
                  <p className="text-xs text-white/30 mt-0.5">Pomodoros before a long break</p>
                </div>
                <Counter value={draft.longBreakEvery} min={1} max={10} onChange={v => set('longBreakEvery', v)} />
              </div>
            </div>
          </Section>

          {/* ── TASK ── */}
          <Section title="Task">
            <div className="flex flex-col gap-3">
              <ToggleRow
                label="Auto Check Tasks"
                sub="Automatically complete tasks when pomodoro ends"
                value={draft.autoCheck}
                onChange={v => set('autoCheck', v)}
                accent={liveAccent}
              />
              <ToggleRow
                label="Check to Bottom"
                sub="Move completed tasks to the bottom of the list"
                value={draft.checkToBottom}
                onChange={v => set('checkToBottom', v)}
                accent={liveAccent}
              />
            </div>
          </Section>

          {/* ── SOUND ── */}
          <Section title="Sound">
            <div className="flex flex-col gap-5">
              <div>
                <SubLabel>Alarm Sound</SubLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {ALARM_SOUNDS.map(s => (
                    <ChipBtn key={s} label={s} active={draft.alarmSound === s} accent={liveAccent} onClick={() => set('alarmSound', s)} />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <VolumeSlider value={draft.alarmVolume} onChange={v => set('alarmVolume', v)} accent={liveAccent} />
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-white/40">repeat</span>
                    <Counter value={draft.alarmRepeat} min={1} max={9} onChange={v => set('alarmRepeat', v)} small />
                  </div>
                </div>
              </div>
              <Divider />
              <div>
                <SubLabel>Focus Sound</SubLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {FOCUS_SOUNDS.map(s => (
                    <ChipBtn key={s} label={s} active={draft.focusSound === s} accent={liveAccent} onClick={() => set('focusSound', s)} />
                  ))}
                </div>
                <VolumeSlider value={draft.focusVolume} onChange={v => set('focusVolume', v)} accent={liveAccent} />
              </div>
            </div>
          </Section>

          {/* ── THEME ── */}
          <Section title="Theme">
            <div className="flex flex-col gap-4">
              <div>
                <SubLabel>Color Themes</SubLabel>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {COLOR_THEMES.map(t => (
                    <button
                      key={t.color}
                      title={t.name}
                      onClick={() => set('colorTheme', t.color)}
                      className="w-9 h-9 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: t.color,
                        outline: draft.colorTheme === t.color ? `3px solid ${t.color}` : '3px solid transparent',
                        outlineOffset: '3px',
                      }}
                    >
                      {draft.colorTheme === t.color && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7l3 3 6-6" stroke="#0f0f13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <Divider />
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Hour Format</span>
                <div className="flex bg-white/5 rounded-full p-0.5 border border-white/8">
                  {(['12', '24'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => set('hourFormat', f)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={draft.hourFormat === f ? { backgroundColor: liveAccent, color: '#0f0f13' } : { color: 'rgba(255,255,255,0.4)' }}
                    >
                      {f}h
                    </button>
                  ))}
                </div>
              </div>
              <ToggleRow
                label="Dark Mode when running"
                sub="Dims the interface while the timer is active"
                value={draft.darkOnRun}
                onChange={v => set('darkOnRun', v)}
                accent={liveAccent}
              />
              <ToggleRow
                label="Small Window"
                sub="Compact layout for minimal distraction"
                value={draft.smallWindow}
                onChange={v => set('smallWindow', v)}
                accent={liveAccent}
              />
            </div>
          </Section>

          {/* ── NOTIFICATION ── */}
          <Section title="Notification">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-white/70">Reminder</span>
                  <p className="text-xs text-white/30 mt-0.5">Notify before session ends</p>
                </div>
                <div className="flex items-center gap-2">
                  <Counter value={draft.reminder} min={0} max={30} onChange={v => set('reminder', v)} />
                  <span className="text-xs text-white/40">min</span>
                </div>
              </div>
              <Divider />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm text-white/70">Mobile Alarm</span>
                    <p className="text-xs text-white/30 mt-0.5">Push notification on your device</p>
                  </div>
                  <Toggle value={draft.mobileAlarm} onChange={v => set('mobileAlarm', v)} accent={liveAccent} />
                </div>
                <button className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-white/40 hover:text-white/70 hover:border-white/35 transition-all flex items-center justify-center gap-2">
                  <span className="text-lg leading-none font-bold" style={{ color: liveAccent }}>+</span>
                  Add this device
                </button>
              </div>
            </div>
          </Section>

          {/* ── INTEGRATION ── */}
          <Section title="Integration">
            <div className="flex flex-col gap-3">
              <IntegrationRow name="Todoist" description="Load tasks from your Todoist account" icon="📋" accent={liveAccent} />
              <IntegrationRow name="Webhook" description="Connect to other apps (Zapier, IFTTT, etc)" icon="🔗" accent={liveAccent} locked />
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white/40 bg-white/5 border border-white/8 hover:text-white/70 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] text-[#0f0f13]"
            style={{ backgroundColor: liveAccent }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase">{title}</h3>
        <div className="flex-1 h-px bg-white/8" />
      </div>
      {children}
    </div>
  )
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{children}</p>
}

function Divider() {
  return <div className="h-px bg-white/8" />
}

function ToggleRow({ label, sub, value, onChange, accent }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; accent: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div>
        <span className="text-sm text-white/70">{label}</span>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
      <Toggle value={value} onChange={onChange} accent={accent} />
    </div>
  )
}

function Toggle({ value, onChange, accent }: { value: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
      style={{ backgroundColor: value ? accent : 'rgba(255,255,255,0.10)' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  )
}

function DurationInput({ label, value, onChange, accent }: { label: string; value: number; onChange: (v: number) => void; accent: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/40 text-center leading-tight">{label}</label>
      <div className="flex items-center bg-white/5 rounded-xl border border-white/8 overflow-hidden focus-within:border-white/30 transition-colors">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="px-2.5 py-2 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors font-bold shrink-0"
        >−</button>
        <input
          type="number"
          min={1}
          max={99}
          value={value}
          onChange={e => {
            const n = parseInt(e.target.value, 10)
            if (!isNaN(n)) onChange(Math.min(99, Math.max(1, n)))
          }}
          onFocus={e => e.target.select()}
          className="flex-1 w-0 min-w-0 text-center text-white/90 font-mono font-bold text-sm bg-transparent outline-none py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ caretColor: accent }}
        />
        <button
          onClick={() => onChange(Math.min(99, value + 1))}
          className="px-2.5 py-2 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors font-bold shrink-0"
        >+</button>
      </div>
    </div>
  )
}

function Counter({ value, min, max, onChange, small }: { value: number; min: number; max: number; onChange: (v: number) => void; small?: boolean }) {
  const px = small ? 'px-2 py-1.5' : 'px-3 py-2'
  return (
    <div className="flex items-center bg-white/5 rounded-xl border border-white/8 overflow-hidden">
      <button onClick={() => onChange(Math.max(min, value - 1))} className={`${px} text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors font-bold`}>−</button>
      <span className={`${small ? 'w-6' : 'w-8'} text-center text-white/80 font-mono font-bold text-sm`}>
        {value === 0 && min === 0 ? '—' : value}
      </span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className={`${px} text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors font-bold`}>+</button>
    </div>
  )
}

function ChipBtn({ label, active, accent, onClick }: { label: string; active: boolean; accent: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
      style={active
        ? { backgroundColor: accent, color: '#0f0f13', borderColor: 'transparent' }
        : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }
      }
    >
      {label}
    </button>
  )
}

function VolumeSlider({ value, onChange, accent }: { value: number; onChange: (v: number) => void; accent: string }) {
  return (
    <div className="flex items-center gap-3">
      <svg className="w-4 h-4 text-white/30 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 6H1v4h2l4 3V3L3 6zM10 5a4 4 0 010 6M13 3a7 7 0 010 10"/>
      </svg>
      <div className="relative flex-1 h-1.5 rounded-full bg-white/10 cursor-pointer">
        <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: accent }} />
        <input
          type="range" min={0} max={100} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-xs text-white/40 w-8 text-right font-mono">{value}</span>
    </div>
  )
}

function IntegrationRow({ name, description, icon, accent, locked }: { name: string; description: string; icon: string; accent: string; locked?: boolean }) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm text-white/80 font-medium flex items-center gap-2">
            {name}
            {locked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/30 font-semibold tracking-wider">PRO</span>}
          </p>
          <p className="text-xs text-white/30 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        className="text-xs px-3 py-1.5 rounded-lg border transition-all"
        style={locked
          ? { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' }
          : { borderColor: accent, color: accent }
        }
        disabled={locked}
      >
        {locked ? 'Upgrade' : 'Connect'}
      </button>
    </div>
  )
}