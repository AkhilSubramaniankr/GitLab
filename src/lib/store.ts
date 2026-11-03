'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewId =
  | 'dashboard'
  | 'day1' | 'day2' | 'day3' | 'day4' | 'day5'
  | 'day6' | 'day7' | 'day8' | 'day9' | 'day10'
  | 'labs' | 'practice' | 'progress' | 'glossary'

interface ProgressState {
  completedLessons: Record<string, boolean>
  quizScores: Record<string, { score: number; total: number; attempts: number }>
  exercisesCompleted: Record<string, boolean>
  capstoneTasks: Record<string, boolean>
}

interface AppState {
  currentView: ViewId
  sidebarOpen: boolean
  searchQuery: string
  progress: ProgressState
  setView: (view: ViewId) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (q: string) => void
  toggleLesson: (id: string) => void
  markLessonComplete: (id: string) => void
  recordQuiz: (id: string, score: number, total: number) => void
  toggleExercise: (id: string) => void
  toggleCapstoneTask: (id: string) => void
  resetProgress: () => void
}

const emptyProgress: ProgressState = {
  completedLessons: {},
  quizScores: {},
  exercisesCompleted: {},
  capstoneTasks: {},
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      sidebarOpen: false,  // default closed on mobile; AppShell opens on desktop via effect
      searchQuery: '',
      progress: emptyProgress,
      setView: (view) => set({ currentView: view }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleLesson: (id) =>
        set((s) => ({
          progress: {
            ...s.progress,
            completedLessons: {
              ...s.progress.completedLessons,
              [id]: !s.progress.completedLessons[id],
            },
          },
        })),
      markLessonComplete: (id) =>
        set((s) => ({
          progress: {
            ...s.progress,
            completedLessons: { ...s.progress.completedLessons, [id]: true },
          },
        })),
      recordQuiz: (id, score, total) =>
        set((s) => {
          const prev = s.progress.quizScores[id]
          return {
            progress: {
              ...s.progress,
              quizScores: {
                ...s.progress.quizScores,
                [id]: {
                  score: Math.max(score, prev?.score ?? 0),
                  total,
                  attempts: (prev?.attempts ?? 0) + 1,
                },
              },
            },
          }
        }),
      toggleExercise: (id) =>
        set((s) => ({
          progress: {
            ...s.progress,
            exercisesCompleted: {
              ...s.progress.exercisesCompleted,
              [id]: !s.progress.exercisesCompleted[id],
            },
          },
        })),
      toggleCapstoneTask: (id) =>
        set((s) => ({
          progress: {
            ...s.progress,
            capstoneTasks: {
              ...s.progress.capstoneTasks,
              [id]: !s.progress.capstoneTasks[id],
            },
          },
        })),
      resetProgress: () => set({ progress: emptyProgress }),
    }),
    {
      name: 'copilot-da-progress',
      partialize: (s) => ({ progress: s.progress }),
    }
  )
)
