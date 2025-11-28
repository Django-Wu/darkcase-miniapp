import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from '../components/ui/Loader'
import { useAppStore } from '../store/useAppStore'

export const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const { initializeFromTelegram, isAuthenticated, setUser } = useAppStore()

  useEffect(() => {
    // Автоматическая авторизация через Telegram
    const initAuth = () => {
      try {
        initializeFromTelegram()
      } catch (error) {
        console.warn('Failed to initialize from Telegram:', error)
      }
      
      // Небольшая задержка для плавности
      setTimeout(() => {
        try {
          const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
          const { isAuthenticated: auth } = useAppStore.getState()
          
          if (auth || tgUser) {
            navigate('/', { replace: true })
          } else {
            // Если нет данных Telegram, создаём гостевого пользователя
            setUser({
              id: Date.now(),
              first_name: 'Гость',
              username: 'guest',
            })
            navigate('/', { replace: true })
          }
        } catch (error) {
          console.error('Error in auth init:', error)
          // В случае ошибки все равно переходим на главную
          setUser({
            id: Date.now(),
            first_name: 'Гость',
            username: 'guest',
          })
          navigate('/', { replace: true })
        }
      }, 1000)
    }

    initAuth()
  }, [navigate, initializeFromTelegram, isAuthenticated, setUser])

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-darkcase-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-darkcase-crimson/5 via-transparent to-darkcase-red/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-darkcase-crimson/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-darkcase-red/5 rounded-full blur-3xl" />
      
      <div className="text-center relative z-10">
        <h1 className="text-5xl font-bold text-darkcase-crimson mb-4 text-glow-strong drop-shadow-2xl">
          DarkCase
        </h1>
        <p className="text-netflix-lightGray mb-8 text-lg">Загрузка...</p>
        <Loader size="lg" />
      </div>
    </div>
  )
}
