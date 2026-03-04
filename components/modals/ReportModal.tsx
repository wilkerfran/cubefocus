'use client'
import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  accent: string
}

const MOCK_RANKING = [
  { pos: 1, name: 'johny', time: '108:45' },
  { pos: 2, name: 'Melchizedek.', time: '99:54' },
  { pos: 3, name: 'ngockhanh nguyentran', time: '96:31' },
  { pos: 4, name: 'Mayank', time: '89:01' },
  { pos: 5, name: 'Janani R', time: '88:26' },
  { pos: 6, name: 'Jeon Harry', time: '86:43' },
  { pos: 7, name: 'Kappanana', time: '85:51' },
  { pos: 8, name: 'Nguyễn Đức Dư Official', time: '80:38' },
  { pos: 9, name: 'Dr Gangwar', time: '79:58' },
  { pos: 10, name: 'Dev Kumar', time: '78:43' },
  { pos: 11, name: 'Darrien Sequera', time: '77:58' },
  { pos: 12, name: 'flowermordi', time: '75:35' },
  { pos: 13, name: 'radha', time: '75:15' },
  { pos: 14, name: 'João Fonseca', time: '74:60' },
  { pos: 15, name: 'Kaye Diane Bejer', time: '74:33' },
  { pos: 16, name: 'Sierra Peters', time: '73:29' },
  { pos: 17, name: 'Mykyta Krainik', time: '73:18' },
  { pos: 18, name: 'JESUS IS GOD', time: '73:01' },
  { pos: 19, name: 'Siddhant[CEE 2082]', time: '70:33' },
  { pos: 20, name: 'Pomofocus User', time: '70:21' },
  { pos: 21, name: 'Bhumi', time: '69:38' },
  { pos: 22, name: 'RITIKa SINhA', time: '68:53' },
  { pos: 23, name: 'Ayush Nigam', time: '68:49' },
  { pos: 24, name: 'Nehal Singhal', time: '68:27' },
  { pos: 25, name: 'William Potter', time: '67:59' },
]

type Tab = 'summary' | 'details' | 'ranking'

export default function ReportModal({ open, onClose, accent }: Props) {
  const [tab, setTab] = useState<Tab>('summary')
  const [weekFilter, setWeekFilter] = useState<'week' | 'month' | 'year'>('week')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#18181f] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-lg font-bold tracking-wider text-white/90">REPORT</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 px-6">
          {(['summary', 'details', 'ranking'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold capitalize tracking-wide transition-all border-b-2 -mb-px ${
                tab === t ? 'border-current text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
              style={tab === t ? { color: accent, borderColor: accent } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'summary' && <SummaryTab accent={accent} weekFilter={weekFilter} setWeekFilter={setWeekFilter} />}
          {tab === 'details' && <DetailsTab accent={accent} />}
          {tab === 'ranking' && <RankingTab accent={accent} />}
        </div>
      </div>
    </div>
  )
}

/* ─── SUMMARY ─── */
function SummaryTab({ accent, weekFilter, setWeekFilter }: { accent: string; weekFilter: 'week' | 'month' | 'year'; setWeekFilter: (v: 'week' | 'month' | 'year') => void }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Activity Summary */}
      <Section title="Activity Summary">
        <p className="text-xs text-white/30 mb-4 italic">* This report will be available when you are logged in</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'hours focused', value: '--' },
            { label: 'days accessed', value: '--' },
            { label: 'day streak', value: '--' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/8">
              <div className="text-3xl font-bold text-white/20 mb-1">{s.value}</div>
              <div className="text-xs text-white/40 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Focus Hours Chart */}
      <Section title="Focus Hours">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-white/30 italic">* This report will be available when you are logged in</p>
          <div className="flex bg-white/5 rounded-full p-0.5 text-xs">
            {(['week', 'month', 'year'] as const).map(f => (
              <button
                key={f}
                onClick={() => setWeekFilter(f)}
                className={`px-3 py-1 rounded-full capitalize transition-all ${weekFilter === f ? 'text-[#0f0f13] font-semibold' : 'text-white/40'}`}
                style={weekFilter === f ? { backgroundColor: accent } : {}}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mock bar chart */}
        <div className="h-32 flex items-end gap-1.5 px-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-white/5 rounded-t-sm" style={{ height: '100%' }}>
                <div className="w-full rounded-t-sm opacity-20" style={{ height: '0%', backgroundColor: accent }} />
              </div>
              <span className="text-[10px] text-white/30">{d}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-4 rounded-xl overflow-hidden border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">PROJECT</th>
                <th className="text-right px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">TIME (HH:MM)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/8">
                <td className="px-4 py-3 text-white/50 text-sm">—</td>
                <td className="px-4 py-3 text-right text-white/50 font-mono">00:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Edit total */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {(['week', 'month', 'year'] as const).map(f => (
              <span key={f} className="px-2.5 py-0.5 rounded-full text-xs bg-white/8 text-white/40 capitalize">{f}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/15 rounded-lg px-3 py-1.5">Edit</button>
          <span className="text-sm text-white/50 font-mono">total <span className="font-bold text-white/70">00</span></span>
        </div>
      </div>
    </div>
  )
}

/* ─── DETAILS ─── */
function DetailsTab({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Focus Time Detail">
        <p className="text-xs text-white/30 italic mb-4">* This report will be available when you are logged in</p>
        <div className="rounded-xl overflow-hidden border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider w-8">#</th>
                <th className="text-left px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">DATE</th>
                <th className="text-left px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">PROJECT / TASK</th>
                <th className="text-right px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">MINUTES</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/8 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white/30 text-xs">1</td>
                <td className="px-4 py-3 text-white/40 text-xs">—</td>
                <td className="px-4 py-3 text-white/50 text-xs truncate max-w-[180px]">An online Pomodoro Timer</td>
                <td className="px-4 py-3 text-right text-white/40 font-mono text-xs">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/8 text-center text-white/30 text-sm">
          Log in to unlock detailed focus history, project tracking, and CSV export.
        </div>
      </Section>
    </div>
  )
}

/* ─── RANKING ─── */
function RankingTab({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 tracking-wide">Focus Time This Week</h3>
        <span className="text-xs text-white/30 italic">Resets every Monday</span>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider w-10">#</th>
              <th className="text-left px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">USER</th>
              <th className="text-right px-4 py-2.5 text-white/40 font-semibold text-xs tracking-wider">TIME (HH:MM)</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RANKING.map((row, i) => (
              <tr
                key={row.pos}
                className={`border-t border-white/8 hover:bg-white/3 transition-colors ${i < 3 ? 'bg-white/2' : ''}`}
              >
                <td className="px-4 py-2.5">
                  {row.pos <= 3 ? (
                    <span className="text-sm font-bold" style={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][row.pos - 1] }}>
                      {row.pos}
                    </span>
                  ) : (
                    <span className="text-xs text-white/30">{row.pos}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-white/70 text-sm truncate max-w-[220px]">{row.name}</td>
                <td className="px-4 py-2.5 text-right font-mono text-sm" style={{ color: row.pos <= 3 ? accent : undefined }}>
                  <span className={row.pos > 3 ? 'text-white/50' : ''}>{row.time}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/20 text-center italic">Sign in to appear on the leaderboard</p>
    </div>
  )
}

/* ─── Helper ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase mb-3">{title}</h3>
      {children}
    </div>
  )
}