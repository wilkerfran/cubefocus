import { create } from 'zustand'

type Mode = 'pomodoro' | 'short' | 'long'

interface TimerState {
  mode: Mode
  timeLeft: number
  isRunning: boolean
  todos: { id: string; text: string; done: boolean }[]
  setMode: (mode: Mode) => void
  setTimeLeft: (t: number) => void
  toggleRunning: () => void
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
}

const DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

export const useTimerStore = create<TimerState>((set) => ({
  mode: 'pomodoro',
  timeLeft: DURATIONS.pomodoro,
  isRunning: false,
  todos: [],
  setMode: (mode) => set({ mode, timeLeft: DURATIONS[mode], isRunning: false }),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),
  addTodo: (text) =>
    set((s) => ({
      todos: [...s.todos, { id: crypto.randomUUID(), text, done: false }],
    })),
  toggleTodo: (id) =>
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),
  removeTodo: (id) =>
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
}))

export { DURATIONS }