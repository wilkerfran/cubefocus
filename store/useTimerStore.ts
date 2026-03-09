import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Mode = 'pomodoro' | 'short' | 'long'

export interface Settings {
  // Timer
  pomoDuration:   number  // minutes
  shortDuration:  number
  longDuration:   number
  autoStartBreak: boolean
  autoStartPomo:  boolean
  longBreakEvery: number
  // Task
  autoCheck:      boolean
  checkToBottom:  boolean
  // Sound
  alarmSound:     string
  alarmVolume:    number
  alarmRepeat:    number
  focusSound:     string
  focusVolume:    number
  // Theme
  colorTheme:     string
  hourFormat:     '12' | '24'
  darkOnRun:      boolean
  smallWindow:    boolean
  // Notification
  reminder:       number
  mobileAlarm:    boolean
}

export const DEFAULT_SETTINGS: Settings = {
  pomoDuration:   25,
  shortDuration:  5,
  longDuration:   15,
  autoStartBreak: false,
  autoStartPomo:  false,
  longBreakEvery: 4,
  autoCheck:      false,
  checkToBottom:  false,
  alarmSound:     'Bell',
  alarmVolume:    50,
  alarmRepeat:    1,
  focusSound:     'None',
  focusVolume:    50,
  colorTheme:     '#e05c5c',
  hourFormat:     '24',
  darkOnRun:      false,
  smallWindow:    false,
  reminder:       0,
  mobileAlarm:    false,
}

export function getDuration(settings: Settings, mode: Mode): number {
  if (mode === 'pomodoro') return settings.pomoDuration * 60
  if (mode === 'short')    return settings.shortDuration * 60
  return settings.longDuration * 60
}

interface Todo {
  id: string
  text: string
  done: boolean
}

interface TimerState {
  mode:      Mode
  timeLeft:  number
  isRunning: boolean
  settings:  Settings
  todos:     Todo[]

  setMode:         (mode: Mode) => void
  setTimeLeft:     (t: number) => void
  toggleRunning:   () => void
  applySettings:   (s: Settings) => void
  addTodo:         (text: string) => void
  toggleTodo:      (id: string) => void
  removeTodo:      (id: string) => void
  clearDoneTodos:  () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode:      'pomodoro',
      timeLeft:  DEFAULT_SETTINGS.pomoDuration * 60,
      isRunning: false,
      settings:  DEFAULT_SETTINGS,
      todos:     [],

      setMode: (mode) =>
        set((s) => ({
          mode,
          timeLeft:  getDuration(s.settings, mode),
          isRunning: false,
        })),

      setTimeLeft: (timeLeft) => set({ timeLeft }),

      toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),

      applySettings: (newSettings) =>
        set((s) => ({
          settings: newSettings,
          // reset timer with new duration for current mode
          timeLeft:  getDuration(newSettings, s.mode),
          isRunning: false,
        })),

      addTodo: (text) =>
        set((s) => ({
          todos: get().settings.checkToBottom
            ? [...s.todos, { id: crypto.randomUUID(), text, done: false }]
            : [{ id: crypto.randomUUID(), text, done: false }, ...s.todos],
        })),

      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),

      removeTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      clearDoneTodos: () =>
        set((s) => ({ todos: s.todos.filter((t) => !t.done) })),
    }),
    { name: 'cubefocus-store' }
  )
)

// Legacy export so existing imports still work
export const DURATIONS = {
  pomodoro: DEFAULT_SETTINGS.pomoDuration * 60,
  short:    DEFAULT_SETTINGS.shortDuration * 60,
  long:     DEFAULT_SETTINGS.longDuration * 60,
}