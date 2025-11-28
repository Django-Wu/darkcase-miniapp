import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Carousel } from '../components/ui/Carousel'
import { CardPoster } from '../components/ui/CardPoster'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { Button } from '../components/ui/Button'
import { Case, Category } from '../types'
import { translateStatus } from '../utils/translations'
import { useAppStore } from '../store/useAppStore'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useRecommendations } from '../hooks/useRecommendations'
import { useHapticFeedback } from '../hooks/useHapticFeedback'
import { apiClient } from '../services/api'
// Lazy load mock data only when needed
let mockCases: any[] = []
let mockCategories: any[] = []

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [featuredCase, setFeaturedCase] = useState<Case | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [shortCases, setShortCases] = useState<Case[]>([])
  const [allCases, setAllCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const { watchHistory } = useAppStore()
  const { impact } = useHapticFeedback()
  
  // Загрузка данных при монтировании
  useEffect(() => {
    // Динамически загружаем mock данные только если нужны
    const loadMockData = async () => {
      try {
        const mockDataModule = await import('../data/mockData')
        mockCases = mockDataModule.mockCases
        mockCategories = mockDataModule.mockCategories
        
        // Показываем mock данные сразу для оптимистичного рендеринга
        setFeaturedCase(mockCases[0] || null)
        setCategories(mockCategories)
        setAllCases(mockCases)
        const shorts = mockCases.filter((c) => {
          const durationMatch = c.duration?.match(/(\d+)/)
          const duration = durationMatch ? parseInt(durationMatch[1]) : 0
          return duration > 0 && duration <= 10
        })
        setShortCases(shorts.slice(0, 5))
        setUseMockData(true)
      } catch (err) {
        console.warn('Failed to load mock data:', err)
      }
    }
    
    loadMockData()
    
    // Затем загружаем реальные данные
    loadData()
  }, [])
  
  // Получаем рекомендации на основе истории просмотра (только после загрузки данных)
  const recommendations = useRecommendations(allCases, 10)
  
  const loadData = async () => {
    try {
      setInitialLoading(true)
      setError(null)
      
      // Параллельная загрузка всех данных включая историю
      const [featuredResponse, categoriesResponse, casesResponse, historyResponse] = await Promise.allSettled([
        apiClient.getFeaturedCase(),
        apiClient.getCategories(),
        apiClient.getCases({ limit: 20 }),
        apiClient.getWatchHistory().catch(() => ({ data: null, error: null })), // Не критично
      ])
      
      // Обрабатываем результаты Promise.allSettled
      const featuredResult = featuredResponse.status === 'fulfilled' ? featuredResponse.value : { data: null, error: 'Failed' }
      const categoriesResult = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value : { data: null, error: 'Failed' }
      const casesResult = casesResponse.status === 'fulfilled' ? casesResponse.value : { data: null, error: 'Failed' }
      const historyResult = historyResponse.status === 'fulfilled' ? historyResponse.value : { data: null, error: null }
      
      // Проверяем, есть ли данные с API
      const hasApiData = 
        (featuredResult.data || categoriesResult.data || casesResult.data?.data?.length) &&
        !featuredResult.error && !categoriesResult.error && !casesResult.error
      
      if (hasApiData) {
        // Используем данные с API
        setUseMockData(false)
        
        if (featuredResult.data) {
          setFeaturedCase(featuredResult.data)
        }
        
        if (categoriesResult.data && categoriesResult.data.length > 0) {
          setCategories(categoriesResult.data)
        }
        
        // Сохраняем все кейсы для рекомендаций
        if (casesResult.data?.data && casesResult.data.data.length > 0) {
          setAllCases(casesResult.data.data)
          
          // Фильтруем короткие видео (до 10 минут)
          const shorts = casesResult.data.data.filter((c) => {
            const durationMatch = c.duration?.match(/(\d+)/)
            const duration = durationMatch ? parseInt(durationMatch[1]) : 0
            return duration > 0 && duration <= 10
          })
          setShortCases(shorts.slice(0, 5))
        } else if (categoriesResult.data) {
          // Собираем все кейсы из категорий
          const allCasesFromCategories = categoriesResult.data.flatMap((cat: Category) => cat.cases || cat.movies || [])
          if (allCasesFromCategories.length > 0) {
            setAllCases(allCasesFromCategories)
          }
        }
      } else {
        // Оставляем mock данные, которые уже показаны
        console.warn('API недоступен или вернул пустые данные, используем mock данные')
      }
      
      // История просмотра синхронизируется автоматически через useSync хук
      // Не нужно вручную обновлять здесь
    } catch (err) {
      console.error('Error loading data:', err)
      // Mock данные уже показаны, просто оставляем их
      setError('Используются локальные данные. API недоступен.')
    } finally {
      setInitialLoading(false)
    }
  }
  
  const handleCaseClick = (caseItem: Case) => {
    navigate(`/detail/${caseItem.id}`)
  }
  
  const handleRefresh = async () => {
    setLoading(true)
    await loadData()
    setLoading(false)
  }
  
  const { refreshIndicator } = usePullToRefresh({ onRefresh: handleRefresh })
  
  // Получаем кейсы с историей просмотра
  const continueWatching = React.useMemo(() => {
    const historyEntries = Object.entries(watchHistory)
      .sort((a, b) => b[1].lastWatched - a[1].lastWatched)
      .slice(0, 6)
      .map(([id]) => id)
    
    // Получаем кейсы из категорий или используем mock данные
    const allCases: Case[] = categories.length > 0 
      ? categories.flatMap(cat => cat.cases || cat.movies || [])
      : mockCases
    
    return allCases.filter((c) => historyEntries.includes(c.id))
  }, [watchHistory, categories])
  
  // Если нет данных даже после загрузки, показываем ошибку только если это не mock режим
  if (error && initialLoading && !useMockData) {
    return (
      <div className="h-screen pb-20 flex items-center justify-center">
        <EmptyState
          icon="⚠️"
          title="Ошибка загрузки"
          message={error}
        />
      </div>
    )
  }
  
  return (
    <div ref={containerRef} className="h-screen pb-20 overflow-y-auto relative">
      {/* Кнопка профиля в правом верхнем углу */}
      <button
        onClick={() => {
          impact('light')
          navigate('/profile')
        }}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all duration-200"
        style={{ 
          top: 'max(calc(16px + env(safe-area-inset-top, 0px)), 48px)',
          right: '16px'
        }}
        aria-label="Профиль"
      >
        <User size={20} strokeWidth={2} />
      </button>
      {/* Pull-to-refresh indicator */}
      {refreshIndicator.visible && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-darkcase-black/90 backdrop-blur-sm transition-all duration-300"
          style={{
            height: `${Math.min(refreshIndicator.progress * 80, 80)}px`,
            opacity: refreshIndicator.progress,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            {refreshIndicator.progress >= 1 ? (
              <>
                <div className="w-6 h-6 border-2 border-darkcase-crimson border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-darkcase-crimson font-medium">Обновление...</span>
              </>
            ) : (
              <>
                <div 
                  className="w-6 h-6 border-2 border-darkcase-crimson/50 border-t-darkcase-crimson rounded-full transition-transform"
                  style={{ transform: `rotate(${refreshIndicator.progress * 360}deg)` }}
                />
                <span className="text-xs text-white/60 font-medium">
                  {refreshIndicator.progress >= 0.8 ? 'Отпустите для обновления' : 'Потяните для обновления'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      {initialLoading ? (
        <div className="relative h-96 mb-6 overflow-hidden">
          <SkeletonLoader type="banner" />
        </div>
      ) : featuredCase ? (
        <motion.div 
          className="relative h-96 mb-6 overflow-hidden"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Preload hero image */}
          <link rel="preload" as="image" href={featuredCase.backdrop} />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${featuredCase.backdrop})`,
            }}
          >
            <div className="absolute inset-0 hero-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-darkcase-crimson/10 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-glow drop-shadow-2xl">
              {featuredCase.title}
            </h1>
            <p className="text-white/90 text-xs sm:text-sm mb-4 line-clamp-2 drop-shadow-lg">
              {featuredCase.description}
            </p>
            <div className="flex items-center gap-2 mb-3 text-xs text-white/80 flex-wrap">
              <span className="px-2 py-1 rounded bg-darkcase-darkGray/50 backdrop-blur-sm">
                {featuredCase.country}
              </span>
              <span>•</span>
              <span>{featuredCase.year}</span>
              <span>•</span>
              <span className={
                featuredCase.status === 'Solved' ? 'badge-solved' : 
                featuredCase.status === 'Unsolved' ? 'badge-unsolved' : 
                'badge-cold'
              }>
                {translateStatus(featuredCase.status)}
              </span>
            </div>
            <motion.div 
              className="flex gap-2 sm:gap-3 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  impact('medium')
                  navigate(`/player/${featuredCase.id}`)
                }}
                className="shadow-blood-lg text-sm sm:text-base"
              >
                ▶ Смотреть
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  impact('light')
                  navigate(`/detail/${featuredCase.id}`)
                }}
                className="text-sm sm:text-base"
              >
                ℹ Подробнее
              </Button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
      
      {/* Shorts Section */}
      {!initialLoading && shortCases.length > 0 && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3 px-4">
            <h2 className="text-xl font-bold text-white text-glow">Короткие видео</h2>
            <button
              onClick={() => {
                impact('light')
                navigate('/shorts')
              }}
              className="text-darkcase-crimson text-sm font-medium hover:underline transition-colors"
            >
              Все →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
            {shortCases.map((caseItem) => (
              <CardPoster
                key={caseItem.id}
                movie={caseItem}
                onClick={() => handleCaseClick(caseItem)}
                size="md"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Continue Watching */}
      {initialLoading ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-4">
            <SkeletonLoader type="title" className="w-40" />
            <div className="h-px flex-1 bg-gradient-to-r from-darkcase-crimson/50 to-transparent" />
          </div>
          <div className="flex gap-3 overflow-x-auto px-4">
            <SkeletonLoader type="card" count={5} />
          </div>
        </div>
      ) : continueWatching.length > 0 && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3 px-4">
            <h2 className="text-xl font-bold text-white text-glow">Продолжить просмотр</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-darkcase-crimson/50 to-transparent" />
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
            {continueWatching.map((caseItem) => {
              const progress = watchHistory[caseItem.id]?.progress || 0
              return (
                <div key={caseItem.id} className="flex-shrink-0">
                  <div className="relative">
                    <CardPoster
                      movie={caseItem}
                      onClick={() => handleCaseClick(caseItem)}
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
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
      
      {/* Categories */}
      {initialLoading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-4">
                <SkeletonLoader type="title" className="w-32" />
                <div className="h-px flex-1 bg-gradient-to-r from-darkcase-crimson/30 to-transparent" />
              </div>
              <div className="flex gap-3 overflow-x-auto px-4">
                <SkeletonLoader type="card" count={5} />
              </div>
            </div>
          ))}
        </>
      ) : (
        categories.length > 0 ? (
          categories.map((category, index) => (
            <Carousel
              key={category.id}
              title={category.name}
              items={category.cases || category.movies || []}
              onItemClick={handleCaseClick}
              loading={loading}
              autoScroll={index === 0}
              autoScrollInterval={6000}
            />
          ))
        ) : (
          // Fallback: если нет категорий, показываем mock категории
          mockCategories.map((category, index) => (
            <Carousel
              key={category.id}
              title={category.name}
              items={category.cases || category.movies || []}
              onItemClick={handleCaseClick}
              loading={loading}
              autoScroll={index === 0}
              autoScrollInterval={6000}
            />
          ))
        )
      )}
      
      {/* Индикатор использования mock данных (только в dev режиме) */}
      {useMockData && import.meta.env.DEV && (
        <div className="fixed bottom-20 right-4 bg-yellow-500/90 text-black text-xs px-3 py-2 rounded-lg z-50">
          ⚠️ Используются mock данные
        </div>
      )}
    </div>
  )
}
