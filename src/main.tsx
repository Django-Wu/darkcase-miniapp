import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useAppStore } from './store/useAppStore'
import { useThemeStore } from './store/useThemeStore'

// Telegram WebApp API initialization
// Types are defined in src/types/telegram.d.ts

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
  
  // Устанавливаем padding для SafeArea через Telegram API
  // SafeArea будет обрабатываться через CSS env(safe-area-inset-top)
  // Не устанавливаем setVerticalPadding(0), чтобы Telegram мог управлять safe area
  
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

// Инициализация пользователя из Telegram (безопасно)
try {
  useAppStore.getState().initializeFromTelegram()
} catch (error) {
  console.warn('Failed to initialize from Telegram:', error)
}

// Инициализация темы
try {
  const theme = useThemeStore.getState().theme
  document.documentElement.setAttribute('data-theme', theme)
} catch (error) {
  console.warn('Failed to initialize theme:', error)
}

// Синхронизация данных с сервером при загрузке
// Теперь синхронизация происходит автоматически через useSync хук в App.tsx
// Но для быстрой загрузки данных при старте делаем начальную синхронизацию
setTimeout(() => {
  useAppStore.getState().syncWithServer().catch((err) => {
    console.warn('Failed to sync with server:', err)
  })
}, 500)

// Регистрация Service Worker для офлайн режима
// vite-plugin-pwa автоматически регистрирует Service Worker при сборке
// В dev режиме Service Worker отключен для избежания проблем
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Используем workbox-window для управления Service Worker
  import('workbox-window').then(({ Workbox }) => {
    const wb = new Workbox('/sw.js', { type: 'module' })
    
    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('🔄 New Service Worker available')
        // Можно показать уведомление пользователю о доступном обновлении
      } else {
        console.log('✅ Service Worker installed')
      }
    })
    
    wb.addEventListener('waiting', () => {
      console.log('⏳ Service Worker waiting to activate')
      // Можно показать кнопку "Обновить" пользователю
      // Автоматически обновляем при следующей загрузке
      wb.messageSkipWaiting()
    })
    
    wb.addEventListener('controlling', () => {
      console.log('✅ Service Worker is controlling the page')
      window.location.reload()
    })
    
    // Регистрируем Service Worker
    wb.register().catch((error) => {
      console.warn('⚠️ Service Worker registration failed:', error)
    })
  }).catch((error) => {
    console.warn('⚠️ Failed to load workbox-window:', error)
    // Fallback: простая регистрация Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error)
        })
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

