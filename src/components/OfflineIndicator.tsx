import React, { useState, useEffect } from 'react'

/**
 * Индикатор офлайн режима
 * Показывает уведомление когда пользователь находится в офлайн режиме
 */
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showNotification) return null

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isOnline
          ? 'bg-darkcase-solved/90 text-white'
          : 'bg-yellow-600/90 text-white'
      } ${showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{isOnline ? '✅' : '⚠️'}</span>
        <span className="text-sm font-medium">
          {isOnline ? 'Подключение восстановлено' : 'Офлайн режим - используются кэшированные данные'}
        </span>
      </div>
    </div>
  )
}

