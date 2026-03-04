'use client'
import { useState } from 'react'
import { useTimerStore, DURATIONS } from '@/store/useTimerStore'

interface Props {
  open: boolean
  onClose: () => void
  accent: string
}

export default function SettingsModal({ open, onClose, accent }: Props) {
  const [pomoDuration, setPomoDuration] = useState(25)
  const [shortDuration, setShortDuration] = useState(5)
  const [longDuration, setLongDuration] = useState(15)
  const [autoStart, setAutoStart] = useState(false)
  const [sound, setSound] = useState('bell')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#18181f] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-lg font-bold tracking-wider text-white/90">SETTINGS</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Timer durations */}
          <Section title="Timer (minutes)">
            <div className="grid grid-cols-3 gap-3">
              <DurationInput label="Pomodoro" value={pomoDuration} onChange={setPomoDuration} accent={accent} />
              <DurationInput label="Short Break" value={shortDuration} onChange={setShortDuration} accent={accent} />
              <DurationInput label="Long Break" value={longDuration} onChange={setLongDuration} accent={accent} />
            </div>
          </Section>

          {/* Auto start */}
          <Section title="Behavior">
            <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
              <div>
                <p className="text-sm text-white/80 font-medium">Auto-start next session</p>
                <p className="text-xs text-white/30 mt-0.5">Automatically start timer after a break</p>
              </div>
              <Toggle value={autoStart} onChange={setAutoStart} accent={accent} />
            </div>
          </Section>

          {/* Sound */}
          <Section title="Alarm Sound">
            <div className="grid grid-cols-3 gap-2">
              {['bell', 'digital', 'kitchen'].map(s => (
                <button
                  key={s}
                  onClick={() => setSound(s)}
                  className={`px-3 py-2.5 rounded-xl text-sm capitalize font-medium transition-all border ${
                    sound === s ? 'text-[#0f0f13] border-transparent' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                  }`}
                  style={sound === s ? { backgroundColor: accent } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </Section>

          {/* Save */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] text-[#0f0f13]"
            style={{ backgroundColor: accent }}
          >
            SAVE SETTINGS
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase mb-3">{title}</h3>
      {children}
    </div>
  )
}

function DurationInput({ label, value, onChange, accent }: { label: string; value: number; onChange: (v: number) => void; accent: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/40 text-center">{label}</label>
      <div className="flex items-center bg-white/5 rounded-xl border border-white/8 overflow-hidden">
        <button onClick={() => onChange(Math.max(1, value - 1))} className="px-3 py-2.5 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors text-lg font-bold">−</button>
        <span className="flex-1 text-center text-white/80 font-mono font-bold text-sm">{value}</span>
        <button onClick={() => onChange(Math.min(99, value + 1))} className="px-3 py-2.5 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors text-lg font-bold">+</button>
      </div>
    </div>
  )
}

function Toggle({ value, onChange, accent }: { value: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 border border-white/10"
      style={{ backgroundColor: value ? accent : 'rgba(255,255,255,0.08)' }}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}