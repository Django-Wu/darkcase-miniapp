import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ProfileSection } from '../components/ui/ProfileSection'
import { SettingRow } from '../components/ui/SettingRow'
import { Button } from '../components/ui/Button'
import { CardPoster } from '../components/ui/CardPoster'
import { VirtualizedList } from '../components/ui/VirtualizedList'
import { Case } from '../types'
import { apiClient } from '../services/api'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { EmptyState } from '../components/ui/EmptyState'

export const Profile: React.FC = () => {
  const { currentUser, setAuthenticated, setUser, favorites, watchHistory } = useAppStore()
  const [favoriteCases, setFavoriteCases] = useState<Case[]>([])
  const [historyCases, setHistoryCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const favoritesContainerRef = useRef<HTMLDivElement>(null)
  const historyContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 32) // Учитываем padding
  
  useEffect(() => {
    loadUserData()
  }, [])

  // Обновляем ширину контейнера при изменении размера окна
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth - 32) // Учитываем padding px-4 (16px * 2)
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])
  
  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Загружаем избранное и историю с сервера
      const [favoritesResponse, historyResponse] = await Promise.all([
        apiClient.getFavorites(),
        apiClient.getWatchHistory(),
      ])
      
      if (favoritesResponse.data) {
        setFavoriteCases(favoritesResponse.data)
      }
      
      if (historyResponse.data) {
        // Сортируем по дате последнего просмотра
        const sorted = historyResponse.data.sort((a: Case & { progress?: number }, b: Case & { progress?: number }) => {
          const aTime = watchHistory[a.id]?.lastWatched || 0
          const bTime = watchHistory[b.id]?.lastWatched || 0
          return bTime - aTime
        })
        setHistoryCases(sorted.slice(0, 6))
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = () => {
    setAuthenticated(false)
    setUser(null)
    navigate('/onboarding')
  }
  
  const displayName = currentUser
    ? `${currentUser.firstName}${currentUser.lastName ? ` ${currentUser.lastName}` : ''}`
    : 'Пользователь'
  
  const displayUsername = currentUser?.username ? `@${currentUser.username}` : `ID: ${currentUser?.id || '—'}`
  
  return (
    <div className="h-screen pb-20 px-4 overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          {currentUser?.photoUrl ? (
            <img
              src={currentUser.photoUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-darkcase-crimson flex items-center justify-center text-3xl text-white">
              {currentUser?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-netflix-lightGray">{displayUsername}</p>
            {currentUser?.isPremium && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded">
                PREMIUM
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Saved Cases */}
      <ProfileSection title="Избранное">
        {loading ? (
          <div className="flex gap-3 overflow-x-auto">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : favoriteCases.length > 0 ? (
          <div ref={favoritesContainerRef}>
            <VirtualizedList
              items={favoriteCases}
              onItemClick={(item) => navigate(`/detail/${item.id}`)}
              itemWidth={128}
              itemHeight={192}
              containerHeight={192}
              containerWidth={containerWidth}
              gap={12}
              direction="horizontal"
              renderItem={(item) => (
                <CardPoster
                  movie={item}
                  onClick={() => navigate(`/detail/${item.id}`)}
                  size="md"
                />
              )}
            />
          </div>
        ) : (
          <EmptyState
            icon="❤️"
            title="Нет избранных кейсов"
            message="Добавьте кейсы в избранное, чтобы быстро к ним вернуться"
          />
        )}
      </ProfileSection>
      
      {/* Watch History */}
      <ProfileSection title="История просмотра">
        {loading ? (
          <div className="flex gap-3 overflow-x-auto">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : historyCases.length > 0 ? (
          <div ref={historyContainerRef}>
            <VirtualizedList
              items={historyCases}
              onItemClick={(item) => navigate(`/detail/${item.id}`)}
              itemWidth={128}
              itemHeight={192}
              containerHeight={192}
              containerWidth={containerWidth}
              gap={12}
              direction="horizontal"
              renderItem={(item) => {
                const progress = watchHistory[item.id]?.progress || 0
                return (
                  <div className="relative">
                    <CardPoster
                      movie={item}
                      onClick={() => navigate(`/detail/${item.id}`)}
                      size="md"
                    />
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-darkcase-darkGray/50 rounded-b-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-darkcase-crimson to-darkcase-red transition-all duration-500" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    )}
                  </div>
                )
              }}
            />
          </div>
        ) : (
          <EmptyState
            icon="📺"
            title="Нет истории просмотра"
            message="Начните смотреть кейсы, чтобы видеть их здесь"
          />
        )}
      </ProfileSection>
      
      {/* Account Settings */}
      <ProfileSection title="Аккаунт">
        <SettingRow
          title="Имя"
          value={currentUser?.firstName || '—'}
        />
        <SettingRow
          title="Username"
          value={currentUser?.username ? `@${currentUser.username}` : '—'}
        />
        <SettingRow
          title="Telegram ID"
          value={currentUser?.id?.toString() || '—'}
        />
        <SettingRow
          title="Premium статус"
          value={currentUser?.isPremium ? 'Активен' : 'Неактивен'}
        />
      </ProfileSection>
      
      {/* App Settings */}
      <ProfileSection title="Настройки приложения">
        <SettingRow
          title="Качество видео"
          value="Авто"
          onClick={() => {}}
        />
        <SettingRow
          title="Качество загрузки"
          value="Высокое"
          onClick={() => {}}
        />
        <SettingRow
          title="Тема"
          value="Темная"
          onClick={() => {}}
        />
        <SettingRow
          title="Язык"
          value="Русский"
          onClick={() => {}}
        />
      </ProfileSection>
      
      {/* Data */}
      <ProfileSection title="Данные">
        <SettingRow
          title="История просмотра"
          value={Object.keys(watchHistory).length > 0 ? 'Включена' : 'Выключена'}
          onClick={() => {}}
        />
        <SettingRow
          title="Использование данных"
          value="Стандартное"
          onClick={() => {}}
        />
      </ProfileSection>
      
      {/* Help & Support */}
      <ProfileSection title="Помощь и поддержка">
        <SettingRow
          title="Справка"
          onClick={() => {}}
        />
        <SettingRow
          title="О приложении"
          onClick={() => {}}
        />
      </ProfileSection>
      
      {/* Logout */}
      <div className="mb-8">
        <Button
          onClick={handleLogout}
          variant="secondary"
          fullWidth
          className="bg-darkcase-darkGray/50 hover:bg-darkcase-mediumGray/50"
        >
          Выйти
        </Button>
      </div>
    </div>
  )
}
