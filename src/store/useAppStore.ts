import { create } from 'zustand'

interface AppState {
  isAuthenticated: boolean
  currentUser: {
    name: string
    email: string
    avatar?: string
  } | null
  setAuthenticated: (value: boolean) => void
  setUser: (user: AppState['currentUser']) => void
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ currentUser: user }),
}))

