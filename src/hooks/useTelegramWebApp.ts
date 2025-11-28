import { useEffect } from 'react'

export const useTelegramWebApp = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Ensure WebApp is ready and expanded
      tg.ready()
      tg.expand()
      
      // Set background color
      tg.setBackgroundColor('#000000')
      tg.setHeaderColor('secondary_bg_color')
      
      // Set vertical padding to 0 for fullscreen
      if (tg.setVerticalPadding) {
        tg.setVerticalPadding(0)
      }
      
      // Prevent swipe-down to close
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation()
      }
      
      // Prevent body from scrolling (but allow inner containers)
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overscrollBehavior = 'none'
      document.documentElement.style.overscrollBehavior = 'none'
      
      // Handle viewport changes - always re-expand
      if (tg.onEvent) {
        tg.onEvent('viewportChanged', () => {
          tg.expand()
          if (tg.setVerticalPadding) {
            tg.setVerticalPadding(0)
          }
        })
        
        // Re-expand if collapsed
        tg.onEvent('expand', () => {
          tg.expand()
          if (tg.setVerticalPadding) {
            tg.setVerticalPadding(0)
          }
        })
      }
      
      // Force expand on resize
      const handleResize = () => {
        tg.expand()
        if (tg.setVerticalPadding) {
          tg.setVerticalPadding(0)
        }
      }
      
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])
  
  return window.Telegram?.WebApp || null
}

