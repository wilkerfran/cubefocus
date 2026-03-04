'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useTimerStore, DURATIONS } from '@/store/useTimerStore'

const CubeScene = dynamic(() => import('@/components/CubeScene'), { ssr: false })

const MODE_COLORS: Record<string, string> = {
  pomodoro: '#e05c5c',
  short: '#5ce0a8',
  long: '#5c9ee0',
}

const MODE_LABELS: Record<string, string> = {
  pomodoro: 'Pomodoro',
  short: 'Short Break',
  long: 'Long Break',
}

export default function Home() {
  const { mode, timeLeft, isRunning, setMode, setTimeLeft, toggleRunning, todos, addTodo, toggleTodo, removeTodo } = useTimerStore()
  const [input, setInput] = useState('')

  // Timer tick
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, timeLeft])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / DURATIONS[mode]

  const handleAdd = () => {
    if (input.trim()) {
      addTodo(input.trim())
      setInput('')
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f13] text-white flex flex-col items-center py-8 px-4">
      {/* Header */}
      <h1 className="text-3xl font-bold tracking-widest mb-6 text-white/90">
        CUBE<span className="text-[#e05c5c]">FOCUS</span>
      </h1>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6 bg-white/5 rounded-full p-1">
        {Object.entries(MODE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key as 'pomodoro' | 'short' | 'long')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === key ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'
            }`}
            style={mode === key ? { backgroundColor: MODE_COLORS[key] } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cube */}
      {/* Cube — sem overlay, o tempo está na face */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        <CubeScene
          progress={progress}
          isRunning={isRunning}
          modeColor={MODE_COLORS[mode]}
          timeLabel={`${mins}:${secs}`}
          mode={MODE_LABELS[mode]}
        />
      </div>

      {/* Start/Pause */}
      <button
        onClick={toggleRunning}
        className="mt-6 px-12 py-3 rounded-full font-bold text-lg tracking-widest transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: MODE_COLORS[mode], color: '#0f0f13' }}
      >
        {isRunning ? 'PAUSE' : 'START'}
      </button>

      {/* Divider */}
      <div className="w-full max-w-md h-px bg-white/10 my-8" />

      {/* Todo input */}
      <div className="w-full max-w-md">
        <h2 className="text-sm font-semibold tracking-widest text-white/40 mb-3">TAREFAS</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Adicionar tarefa..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 placeholder-white/20 transition-all"
          />
          <button
            onClick={handleAdd}
            className="px-5 rounded-xl font-bold text-lg transition-all hover:scale-105"
            style={{ backgroundColor: MODE_COLORS[mode], color: '#0f0f13' }}
          >
            +
          </button>
        </div>

        {/* Todo list */}
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 group"
            >
              <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    todo.done ? 'border-transparent' : 'border-white/30'
                  }`}
                  style={todo.done ? { backgroundColor: MODE_COLORS[mode] } : {}}
                />
              </button>
              <span className={`flex-1 text-sm ${todo.done ? 'line-through text-white/30' : 'text-white/80'}`}>
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}