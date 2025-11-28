import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Case } from '../types'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { apiClient } from '../services/api'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

export const Shorts: React.FC = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shortCases, setShortCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)

  useEffect(() => {
    loadShorts()
  }, [])

  const loadShorts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getCases({ limit: 100 })
      
      if (response.error || !response.data?.data) {
        setError(response.error || 'Не удалось загрузить видео')
        return
      }
      
      // Фильтруем короткие кейсы (до 10 минут)
      const shorts = response.data.data.filter((c) => {
        const durationMatch = c.duration?.match(/(\d+)/)
        const duration = durationMatch ? parseInt(durationMatch[1]) : 0
        return duration > 0 && duration <= 10
      })
      
      setShortCases(shorts)
    } catch (err) {
      console.error('Error loading shorts:', err)
      setError('Не удалось загрузить видео')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!containerRef.current || shortCases.length === 0) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0 && currentIndex < shortCases.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY.current = e.changedTouches[0].clientY
      const diff = touchStartY.current - touchEndY.current

      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < shortCases.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        } else if (diff < 0 && currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1)
        }
      }
    }

    const container = containerRef.current
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentIndex, shortCases.length])

  if (loading) {
    return (
      <div className="h-screen bg-darkcase-black flex items-center justify-center">
        <SkeletonLoader type="banner" className="w-full h-full" />
      </div>
    )
  }

  if (error || shortCases.length === 0) {
    return (
      <div className="h-screen bg-darkcase-black flex items-center justify-center">
        <EmptyState
          icon="📹"
          title={error || 'Нет коротких видео'}
          message="Короткие видео появятся здесь"
        >
          <Button onClick={() => navigate('/')}>На главную</Button>
        </EmptyState>
      </div>
    )
  }

  const currentCase = shortCases[currentIndex]

  return (
    <div
      ref={containerRef}
      className="h-screen bg-darkcase-black overflow-hidden relative"
    >
      {/* Current Short */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
      >
        {shortCases.map((caseItem, index) => (
          <ShortCard
            key={caseItem.id}
            caseItem={caseItem}
            isActive={index === currentIndex}
            onDetailClick={() => navigate(`/detail/${caseItem.id}`)}
            onWatchClick={() => navigate(`/player/${caseItem.id}`)}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
        {shortCases.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all ${
              index === currentIndex
                ? 'h-8 bg-darkcase-crimson'
                : 'h-4 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Navigation Hint */}
      {currentIndex === 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm animate-bounce z-10">
          Прокрутите вниз для следующего видео
        </div>
      )}
    </div>
  )
}

interface ShortCardProps {
  caseItem: Case
  isActive: boolean
  onDetailClick: () => void
  onWatchClick: () => void
}

const ShortCard: React.FC<ShortCardProps> = ({
  caseItem,
  isActive,
  onDetailClick,
  onWatchClick,
}) => {
  return (
    <div className="h-screen w-full flex items-center justify-center relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${caseItem.backdrop || caseItem.poster})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-darkcase-black via-darkcase-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4 text-glow drop-shadow-2xl">
          {caseItem.title}
        </h2>
        <p className="text-white/90 text-sm mb-6 line-clamp-3 drop-shadow-lg">
          {caseItem.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-center gap-3 mb-6 text-xs text-white/80 flex-wrap">
          <span className="px-2 py-1 rounded bg-darkcase-darkGray/50 backdrop-blur-sm">
            {caseItem.country}
          </span>
          <span>•</span>
          <span>{caseItem.year}</span>
          <span>•</span>
          <span>{caseItem.duration}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onWatchClick}
            className="px-6 py-3 bg-darkcase-crimson text-white rounded-lg font-semibold hover:bg-darkcase-red transition-all shadow-blood"
          >
            ▶ Смотреть
          </button>
          <button
            onClick={onDetailClick}
            className="px-6 py-3 bg-darkcase-darkGray/80 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-darkcase-mediumGray/80 border border-darkcase-mediumGray/50 transition-all"
          >
            ℹ Подробнее
          </button>
        </div>
      </div>
    </div>
  )
}
