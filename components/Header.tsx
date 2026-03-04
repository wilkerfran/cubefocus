'use client'
import { useState } from 'react'
import ReportModal from './modals/ReportModal'
import SettingsModal from './modals/Settingsmodal'

const MODE_COLORS: Record<string, string> = {
  pomodoro: '#e05c5c',
  short: '#5ce0a8',
  long: '#5c9ee0',
}

interface Props {
  mode: string
}

export default function Header({ mode }: Props) {
  const [reportOpen, setReportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const accent = MODE_COLORS[mode] ?? '#e05c5c'

  return (
    <>
      <header className="w-full border-b border-white/8 bg-[#0f0f13]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: accent }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-base font-bold tracking-wider text-white/90">
              CUBE<span style={{ color: accent }}>FOCUS</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <NavBtn icon={<ReportIcon />} label="Report" onClick={() => setReportOpen(true)} />
            <NavBtn icon={<SettingsIcon />} label="Settings" onClick={() => setSettingsOpen(true)} />
            <button className="ml-2 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-[#0f0f13] transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: accent }}>
              <UserIcon />
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} accent={accent} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} accent={accent} />
    </>
  )
}

function NavBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/8 transition-all"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function ReportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="11" height="11" rx="1.5"/>
      <line x1="5" y1="5.5" x2="10" y2="5.5"/>
      <line x1="5" y1="7.5" x2="10" y2="7.5"/>
      <line x1="5" y1="9.5" x2="8" y2="9.5"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7.5" cy="7.5" r="2"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3 3l1 1M11 11l1 1M11 3l-1 1M3 11l1-1"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="4" r="2.5"/>
      <path d="M1.5 12c0-2.761 2.239-5 5-5s5 2.239 5 5"/>
    </svg>
  )
}