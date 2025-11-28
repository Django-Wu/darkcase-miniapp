import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

/**
 * Хук для автоматической синхронизации данных с сервером
 * - Синхронизация при изменении данных
 * - Периодическая синхронизация в фоне
 * - Синхронизация при возврате приложения в фокус
 */
export const useSync = () => {
  const { syncWithServer, favorites, watchHistory, isAuthenticated } = useAppStore()
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncRef = useRef<number>(0)
  const isSyncingRef = useRef<boolean>(false)

  // Функция синхронизации с debounce
  const sync = async (immediate = false, showIndicator = true) => {
    if (!isAuthenticated) return
    if (isSyncingRef.current && !immediate) return

    const now = Date.now()
    // Не синхронизируем чаще чем раз в 5 секунд (увеличено с 2 секунд)
    if (!immediate && now - lastSyncRef.current < 5000) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      syncTimeoutRef.current = setTimeout(() => sync(false, showIndicator), 5000 - (now - lastSyncRef.current))
      return
    }

    isSyncingRef.current = true
    lastSyncRef.current = now

    try {
      await syncWithServer()
    } catch (error) {
      console.warn('Sync failed:', error)
    } finally {
      isSyncingRef.current = false
    }
  }

  // Синхронизация при изменении избранного или истории
  // Используем useRef для отслеживания предыдущих значений, чтобы не триггерить на изменения от синхронизации
  const prevFavoritesRef = useRef<string[]>([])
  const prevWatchHistoryRef = useRef<Record<string, { progress: number; lastWatched: number }>>({})
  
  useEffect(() => {
    if (!isAuthenticated) return

    // Проверяем, действительно ли данные изменились (не от синхронизации)
    const favoritesChanged = JSON.stringify(favorites.sort()) !== JSON.stringify(prevFavoritesRef.current.sort())
    const historyChanged = JSON.stringify(watchHistory) !== JSON.stringify(prevWatchHistoryRef.current)
    
    // Обновляем предыдущие значения
    prevFavoritesRef.current = favorites
    prevWatchHistoryRef.current = watchHistory

    // Синхронизируем только если данные действительно изменились пользователем
    if (favoritesChanged || historyChanged) {
      // Debounce синхронизации при изменениях (увеличено с 1 до 5 секунд)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(() => {
        sync(false, false) // Не показываем индикатор для автоматических синхронизаций
      }, 5000) // Синхронизируем через 5 секунд после изменения

      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }
      }
    }
  }, [favorites, watchHistory, isAuthenticated])

  // Периодическая синхронизация в фоне (каждые 5 минут)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      sync(false, false) // Не показываем индикатор для фоновых синхронизаций
    }, 5 * 60 * 1000) // 5 минут

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Синхронизация при возврате приложения в фокус
  useEffect(() => {
    if (!isAuthenticated) return

    const handleFocus = () => {
      // Синхронизируем сразу при возврате в фокус
      sync(true)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sync(true)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated])

  // Синхронизация при монтировании
  useEffect(() => {
    if (isAuthenticated) {
      sync(true)
    }
  }, [isAuthenticated])
}

