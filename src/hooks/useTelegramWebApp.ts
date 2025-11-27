import { useEffect } from 'react'

export const useTelegramWebApp = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Ensure WebApp is ready
      tg.ready()
      tg.expand()
      
      // Set background color
      tg.setBackgroundColor('#000000')
      tg.setHeaderColor('secondary_bg_color')
      
      // Prevent page scrolling
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [])
  
  return window.Telegram?.WebApp || null
}

