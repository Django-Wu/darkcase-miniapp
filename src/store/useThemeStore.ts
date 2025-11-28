import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeVariant = 'dark' | 'darker' | 'blood'

interface ThemeState {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        // Применяем тему к document
        document.documentElement.setAttribute('data-theme', theme)
      },
    }),
    {
      name: 'darkcase-theme',
    }
  )
)

