import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  admin: {
    id: string
    username: string
    email?: string
  } | null
  login: (token: string, admin: AuthState['admin']) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      login: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'darkcase-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

