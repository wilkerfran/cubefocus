'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store/useTimerStore'
import Header from '@/components/Header'

const CubeScene = dynamic(() => import('@/components/CubeScene'), { ssr: false })

const MODE_COLORS: Record<string, string> = {
  pomodoro: '#e05c5c',
  short:    '#5ce0a8',
  long:     '#5c9ee0',
}

const MODE_LABELS: Record<string, string> = {
  pomodoro: 'Pomodoro',
  short:    'Short Break',
  long:     'Long Break',
}

const MODE_ORDER: Array<'pomodoro' | 'short' | 'long'> = ['pomodoro', 'short', 'long']

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5l10 5.5-10 5.5V2.5z"/>
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1"/>
      <rect x="9" y="2" width="4" height="12" rx="1"/>
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M3 3.5l8 5.5-8 5.5V3.5z"/>
      <rect x="13" y="3.5" width="2.5" height="11" rx="1.25"/>
    </svg>
  )
}

export default function Home() {
  const {
    mode, timeLeft, isRunning, settings,
    setMode, setTimeLeft, toggleRunning,
    todos, addTodo, toggleTodo, removeTodo, clearDoneTodos,
  } = useTimerStore()

  const [input, setInput] = useState('')

  const modeAccent = settings.colorTheme !== '#e05c5c'
    ? settings.colorTheme
    : MODE_COLORS[mode]

  // Timer tick
  useEffect(() => {
    if (!isRunning) return
    if (timeLeft <= 0) {
      if (mode === 'pomodoro' && settings.autoStartBreak) {
        setMode('short')
        setTimeout(() => useTimerStore.getState().toggleRunning(), 500)
      } else if (mode !== 'pomodoro' && settings.autoStartPomo) {
        setMode('pomodoro')
        setTimeout(() => useTimerStore.getState().toggleRunning(), 500)
      }
      return
    }
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, timeLeft, mode, settings.autoStartBreak, settings.autoStartPomo])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  const getDuration = (m: string) => {
    if (m === 'pomodoro') return settings.pomoDuration * 60
    if (m === 'short')    return settings.shortDuration * 60
    return settings.longDuration * 60
  }
  const progress = 1 - timeLeft / getDuration(mode)

  // Skip to next mode in cycle: pomodoro → short → long → pomodoro
  const handleSkip = () => {
    const idx = MODE_ORDER.indexOf(mode)
    const next = MODE_ORDER[(idx + 1) % MODE_ORDER.length]
    setMode(next)
  }

  const nextModeLabel = () => {
    const idx = MODE_ORDER.indexOf(mode)
    return MODE_LABELS[MODE_ORDER[(idx + 1) % MODE_ORDER.length]]
  }

  const handleAdd = () => {
    if (input.trim()) {
      addTodo(input.trim())
      setInput('')
    }
  }

  const hasDone = todos.some(t => t.done)
  const isDimmed = isRunning && settings.darkOnRun

  return (
    <>
      <Header mode={mode} />
      <main
        className="min-h-screen text-white flex flex-col items-center py-8 px-4 transition-colors duration-700"
        style={{ backgroundColor: isDimmed ? '#08080b' : '#0f0f13' }}
      >
        {/* Mode tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 rounded-full p-1">
          {Object.entries(MODE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key as 'pomodoro' | 'short' | 'long')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                mode === key ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'
              }`}
              style={mode === key ? { backgroundColor: modeAccent } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cube */}
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          <CubeScene
            progress={progress}
            isRunning={isRunning}
            modeColor={modeAccent}
            timeLabel={`${mins}:${secs}`}
            mode={MODE_LABELS[mode]}
          />
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-4">

          {/* Spacer to balance layout */}
          <div className="w-11 h-11" />

          {/* Start / Pause button */}
          <button
            onClick={toggleRunning}
            className="flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-full font-bold text-base tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            style={{
              backgroundColor: modeAccent,
              color: '#0f0f13',
              minWidth: '160px',
              boxShadow: `0 4px 24px ${modeAccent}44`,
            }}
          >
            {isRunning ? <PauseIcon /> : <PlayIcon />}
            {isRunning ? 'PAUSE' : 'START'}
          </button>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            title={`Skip to ${nextModeLabel()}`}
            className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 active:scale-95 group relative"
            style={{
              borderColor: `${modeAccent}60`,
              color: modeAccent,
              backgroundColor: `${modeAccent}10`,
            }}
          >
            <SkipIcon />
            {/* Tooltip */}
            <span
              className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap px-2 py-1 rounded-md bg-black/80 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              {nextModeLabel()}
            </span>
          </button>

        </div>

        {/* Divider */}
        <div className="w-full max-w-md h-px bg-white/10 my-8" />

        {/* Todo section */}
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-widest text-white/40">TASKS</h2>
            {hasDone && (
              <button
                onClick={clearDoneTodos}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Clear done
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Add a task..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 placeholder-white/20 transition-all"
            />
            <button
              onClick={handleAdd}
              className="px-5 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: modeAccent, color: '#0f0f13' }}
            >
              +
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 group"
              >
                <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                  <div
                    className="w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center"
                    style={todo.done
                      ? { backgroundColor: modeAccent, borderColor: 'transparent' }
                      : { borderColor: 'rgba(255,255,255,0.3)' }
                    }
                  >
                    {todo.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#0f0f13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
                <span className={`flex-1 text-sm ${todo.done ? 'line-through text-white/25' : 'text-white/80'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all text-xl leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {todos.length === 0 && (
            <p className="text-center text-white/20 text-sm py-6">No tasks yet. Add one above ↑</p>
          )}
        </div>
      </main>
    </>
  )
}