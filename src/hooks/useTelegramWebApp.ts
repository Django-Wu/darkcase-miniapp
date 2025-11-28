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
      
      // Prevent body from scrolling (but allow inner containers)
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      
      // Handle viewport changes
      if (tg.onEvent) {
        tg.onEvent('viewportChanged', () => {
          tg.expand()
          if (tg.setVerticalPadding) {
            tg.setVerticalPadding(0)
          }
        })
      }
    }
  }, [])
  
  return window.Telegram?.WebApp || null
}

