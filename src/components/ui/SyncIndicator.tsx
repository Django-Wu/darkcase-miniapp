import React from 'react'
import { useAppStore } from '../../store/useAppStore'

/**
 * Индикатор синхронизации данных
 * Показывает статус синхронизации в углу экрана
 */
export const SyncIndicator: React.FC = () => {
  const { isSyncing, lastSyncTime } = useAppStore()
  const [show, setShow] = React.useState(false)
  const lastShownTimeRef = React.useRef<number>(0)
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    // Очищаем предыдущий таймер
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }

    if (isSyncing) {
      setShow(true)
      lastShownTimeRef.current = Date.now()
    } else if (lastSyncTime > 0) {
      // Показываем индикатор только если прошло больше 5 секунд с последнего показа
      // Это предотвращает постоянное мигание при частых синхронизациях
      const timeSinceLastShow = Date.now() - lastShownTimeRef.current
      if (timeSinceLastShow > 5000) {
        setShow(true)
        lastShownTimeRef.current = Date.now()
        // Автоматически скрываем через 2 секунды
        hideTimerRef.current = setTimeout(() => {
          setShow(false)
          hideTimerRef.current = null
        }, 2000)
      } else {
        // Если не показываем, убеждаемся что индикатор скрыт
        setShow(false)
      }
    } else {
      // Если нет данных синхронизации, скрываем индикатор
      setShow(false)
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [isSyncing, lastSyncTime])

  if (!show) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-darkcase-mediumGray/50">
      {isSyncing ? (
        <>
          <div className="w-4 h-4 border-2 border-darkcase-crimson border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-white/80">Синхронизация...</span>
        </>
      ) : (
        <>
          <div className="w-4 h-4 bg-darkcase-solved rounded-full flex items-center justify-center">
            <span className="text-xs">✓</span>
          </div>
          <span className="text-xs text-white/80">Синхронизировано</span>
        </>
      )}
    </div>
  )
}

