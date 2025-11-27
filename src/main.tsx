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

// Initialize Telegram WebApp
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp
  
  // Initialize WebApp
  tg.ready()
  tg.expand()
  
  // Set colors
  tg.setBackgroundColor('#000000')
  tg.setHeaderColor('secondary_bg_color')
  
  // Enable closing confirmation
  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation()
  }
  
  // Set viewport settings
  if (tg.setVerticalPadding) {
    tg.setVerticalPadding(0)
  }
  
  // Listen to theme changes
  if (tg.onEvent) {
    const updateTheme = () => {
      const isDark = tg.colorScheme === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.style.backgroundColor = isDark ? '#000000' : '#FFFFFF'
    }
    
    updateTheme()
    tg.onEvent('themeChanged', updateTheme)
    
    // Handle viewport changes
    tg.onEvent('viewportChanged', () => {
      tg.expand()
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

