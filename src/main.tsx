import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Telegram WebApp API initialization
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        setBackgroundColor: (color: string) => void
        setHeaderColor: (color: string) => void
        enableClosingConfirmation?: () => void
        setVerticalPadding?: (padding: number) => void
        onEvent?: (event: string, callback: () => void) => void
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
      }
    }
  }
}

// Initialize Telegram WebApp immediately for fullscreen
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp
  
  // Critical: ready() must be called first
  tg.ready()
  
  // Expand to fullscreen immediately
  tg.expand()
  
  // Set colors
  tg.setBackgroundColor('#000000')
  tg.setHeaderColor('secondary_bg_color')
  
  // Remove all padding for true fullscreen
  if (tg.setVerticalPadding) {
    tg.setVerticalPadding(0)
  }
  
  // Prevent swipe-down to close (only close button works)
  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation()
  }
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  
  // Disable overscroll/bounce effects
  document.body.style.overscrollBehavior = 'none'
  document.documentElement.style.overscrollBehavior = 'none'
  
  // Listen to theme changes
  if (tg.onEvent) {
    const updateTheme = () => {
      const isDark = tg.colorScheme === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.style.backgroundColor = '#000000'
    }
    
    updateTheme()
    tg.onEvent('themeChanged', updateTheme)
    
    // Handle viewport changes - always expand and remove padding
    tg.onEvent('viewportChanged', () => {
      tg.expand()
      if (tg.setVerticalPadding) {
        tg.setVerticalPadding(0)
      }
    })
    
    // Re-expand if user tries to collapse
    tg.onEvent('expand', () => {
      tg.expand()
      if (tg.setVerticalPadding) {
        tg.setVerticalPadding(0)
      }
    })
  }
  
  // Force expand on any resize
  window.addEventListener('resize', () => {
    tg.expand()
    if (tg.setVerticalPadding) {
      tg.setVerticalPadding(0)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

