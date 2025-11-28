import { useCallback } from 'react'

/**
 * Хук для использования haptic feedback через Telegram WebApp API
 */
export const useHapticFeedback = () => {
  const trigger = useCallback((type: 'impact' | 'notification' | 'selection' = 'impact', style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      const haptic = window.Telegram.WebApp.HapticFeedback
      
      try {
        switch (type) {
          case 'impact':
            haptic.impactOccurred(style)
            break
          case 'notification':
            haptic.notificationOccurred(style === 'light' ? 'success' : style === 'medium' ? 'warning' : 'error')
            break
          case 'selection':
            haptic.selectionChanged()
            break
        }
      } catch (error) {
        // Fallback для браузеров без поддержки haptic feedback
        console.debug('Haptic feedback not available:', error)
      }
    }
  }, [])

  return {
    impact: useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      trigger('impact', style)
    }, [trigger]),
    notification: useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
      trigger('notification', style)
    }, [trigger]),
    selection: useCallback(() => {
      trigger('selection')
    }, [trigger]),
  }
}

