import { create } from 'zustand'
import { TelegramUser } from '../types/telegram'
import { Case } from '../types'

interface AppState {
  isAuthenticated: boolean
  currentUser: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    photoUrl?: string
    isPremium?: boolean
  } | null
  favorites: string[]
  watchHistory: Record<string, { progress: number; lastWatched: number }>
  lastSyncTime: number
  isSyncing: boolean
  setAuthenticated: (value: boolean) => void
  setUser: (user: TelegramUser | null) => void
  initializeFromTelegram: () => void
  addToFavorites: (caseId: string) => Promise<void>
  removeFromFavorites: (caseId: string) => Promise<void>
  isFavorite: (caseId: string) => boolean
  updateWatchProgress: (caseId: string, progress: number) => Promise<void>
  getWatchProgress: (caseId: string) => number
  syncWithServer: () => Promise<void>
  syncFavorites: () => Promise<void>
  syncWatchHistory: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      favorites: [],
      watchHistory: {},
      lastSyncTime: 0,
      isSyncing: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => {
        if (user) {
          set({
            currentUser: {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              photoUrl: user.photo_url,
              isPremium: user.is_premium,
            },
            isAuthenticated: true,
          })
        } else {
          set({ currentUser: null, isAuthenticated: false })
        }
      },
      initializeFromTelegram: () => {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
          const tgUser = window.Telegram.WebApp.initDataUnsafe.user
          set({
            currentUser: {
              id: tgUser.id,
              firstName: tgUser.first_name,
              lastName: tgUser.last_name,
              username: tgUser.username,
              photoUrl: tgUser.photo_url,
              isPremium: tgUser.is_premium,
            },
            isAuthenticated: true,
          })
        }
      },
      addToFavorites: async (caseId) => {
        const state = get()
        if (state.favorites.includes(caseId)) {
          return // Уже в избранном
        }

        // Оптимистичное обновление UI
        set((state) => ({
          favorites: [...state.favorites, caseId],
        }))

        // Синхронизация с сервером
        try {
          const { apiClient } = await import('../services/api')
          await apiClient.addToFavorites(caseId)
        } catch (err) {
          console.warn('Failed to add to favorites on server:', err)
          // Откатываем изменение при ошибке
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== caseId),
          }))
        }
      },
      removeFromFavorites: async (caseId) => {
        const state = get()
        const wasInFavorites = state.favorites.includes(caseId)

        // Оптимистичное обновление UI
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== caseId),
        }))

        // Синхронизация с сервером
        try {
          const { apiClient } = await import('../services/api')
          await apiClient.removeFromFavorites(caseId)
        } catch (err) {
          console.warn('Failed to remove from favorites on server:', err)
          // Восстанавливаем при ошибке
          if (wasInFavorites) {
            set((state) => ({
              favorites: [...state.favorites, caseId],
            }))
          }
        }
      },
      isFavorite: (caseId) => {
        return get().favorites.includes(caseId)
      },
      updateWatchProgress: async (caseId, progress) => {
        const currentTime = Date.now()
        
        // Оптимистичное обновление UI
        set((state) => ({
          watchHistory: {
            ...state.watchHistory,
            [caseId]: {
              progress,
              lastWatched: currentTime,
            },
          },
        }))

        // Синхронизация с сервером (debounced)
        // Не блокируем UI, синхронизация происходит в фоне
        try {
          const { apiClient } = await import('../services/api')
          // Синхронизируем только при значительных изменениях или периодически
          await apiClient.updateWatchProgress(caseId, progress)
        } catch (err) {
          console.warn('Failed to update watch progress on server:', err)
          // Не откатываем, так как локальное сохранение важнее
        }
      },
      getWatchProgress: (caseId) => {
        return get().watchHistory[caseId]?.progress || 0
      },
      syncWithServer: async () => {
        const state = get()
        if (!state.isAuthenticated || state.isSyncing) {
          return
        }

        set({ isSyncing: true })

        try {
          // Импортируем динамически, чтобы избежать circular dependency
          const { apiClient } = await import('../services/api')
          
          // Двусторонняя синхронизация: получаем данные с сервера и мерджим с локальными
          const [favoritesResponse, historyResponse] = await Promise.allSettled([
            apiClient.getFavorites(),
            apiClient.getWatchHistory(),
          ])

          // Синхронизация избранного с merge
          if (favoritesResponse.status === 'fulfilled' && favoritesResponse.value.data) {
            const serverFavorites = favoritesResponse.value.data.map((c: Case) => c.id)
            const localFavorites = state.favorites
            
            // Объединяем: берем все с сервера + локальные, которые еще не синхронизированы
            const mergedFavorites = Array.from(new Set([...serverFavorites, ...localFavorites]))
            
            // Обновляем только если данные действительно изменились (предотвращаем бесконечный цикл)
            const favoritesChanged = JSON.stringify(mergedFavorites.sort()) !== JSON.stringify(localFavorites.sort())
            if (favoritesChanged) {
              set({ favorites: mergedFavorites })
            }
          }
          
          // Синхронизация истории просмотра с merge (приоритет у более свежих данных)
          if (historyResponse.status === 'fulfilled' && historyResponse.value.data) {
            const serverHistory: Record<string, { progress: number; lastWatched: number }> = {}
            historyResponse.value.data.forEach((caseItem: Case & { progress?: number; last_watched?: string }) => {
              if (caseItem.progress !== undefined) {
                const serverTime = caseItem.last_watched ? new Date(caseItem.last_watched).getTime() : 0
                serverHistory[caseItem.id] = {
                  progress: caseItem.progress,
                  lastWatched: serverTime,
                }
              }
            })

            // Мерджим: берем более свежие данные (по lastWatched)
            const mergedHistory: Record<string, { progress: number; lastWatched: number }> = {}
            
            // Добавляем все с сервера
            Object.entries(serverHistory).forEach(([id, data]) => {
              mergedHistory[id] = data
            })
            
            // Добавляем локальные, если они новее или отсутствуют на сервере
            Object.entries(state.watchHistory).forEach(([id, localData]) => {
              const serverData = serverHistory[id]
              if (!serverData || localData.lastWatched > serverData.lastWatched) {
                mergedHistory[id] = localData
              }
            })

            // Обновляем только если данные действительно изменились (предотвращаем бесконечный цикл)
            const historyChanged = JSON.stringify(mergedHistory) !== JSON.stringify(state.watchHistory)
            if (historyChanged) {
              set({ watchHistory: mergedHistory })
            }
          }

          set({ lastSyncTime: Date.now() })
        } catch (err) {
          console.warn('Failed to sync with server:', err)
        } finally {
          set({ isSyncing: false })
        }
      },
      syncFavorites: async () => {
        const state = get()
        if (!state.isAuthenticated) return

        try {
          const { apiClient } = await import('../services/api')
          
          // Отправляем локальные изменения на сервер
          for (const caseId of state.favorites) {
            try {
              await apiClient.addToFavorites(caseId)
            } catch (err) {
              // Игнорируем ошибки для отдельных элементов
            }
          }

          // Получаем актуальные данные с сервера
          const response = await apiClient.getFavorites()
          if (response.data) {
            set({ favorites: response.data.map((c: Case) => c.id) })
          }
        } catch (err) {
          console.warn('Failed to sync favorites:', err)
        }
      },
      syncWatchHistory: async () => {
        const state = get()
        if (!state.isAuthenticated) return

        try {
          const { apiClient } = await import('../services/api')
          
          // Отправляем локальные изменения на сервер
          for (const [caseId, data] of Object.entries(state.watchHistory)) {
            try {
              await apiClient.updateWatchProgress(caseId, data.progress)
            } catch (err) {
              // Игнорируем ошибки для отдельных элементов
            }
          }

          // Получаем актуальные данные с сервера
          const response = await apiClient.getWatchHistory()
          if (response.data) {
            const history: Record<string, { progress: number; lastWatched: number }> = {}
            response.data.forEach((caseItem: Case & { progress?: number; last_watched?: string }) => {
              if (caseItem.progress !== undefined) {
                history[caseItem.id] = {
                  progress: caseItem.progress,
                  lastWatched: caseItem.last_watched ? new Date(caseItem.last_watched).getTime() : Date.now(),
                }
              }
            })
            set({ watchHistory: history })
          }
        } catch (err) {
          console.warn('Failed to sync watch history:', err)
        }
      },
    })
)

// Сохранение в localStorage
if (typeof window !== 'undefined') {
  useAppStore.subscribe((state) => {
    localStorage.setItem('darkcase-favorites', JSON.stringify(state.favorites))
    localStorage.setItem('darkcase-watchHistory', JSON.stringify(state.watchHistory))
  })
  
  // Загрузка из localStorage при инициализации
  const savedFavorites = localStorage.getItem('darkcase-favorites')
  const savedHistory = localStorage.getItem('darkcase-watchHistory')
  if (savedFavorites) {
    useAppStore.setState({ favorites: JSON.parse(savedFavorites) })
  }
  if (savedHistory) {
    useAppStore.setState({ watchHistory: JSON.parse(savedHistory) })
  }
}

