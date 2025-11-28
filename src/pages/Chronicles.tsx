import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Chronicle, ChronicleComment } from '../types'
import { apiClient } from '../services/api'
import { ChronicleVideo } from '../components/chronicles/ChronicleVideo'
import { CommentsModal } from '../components/chronicles/CommentsModal'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { EmptyState } from '../components/ui/EmptyState'
import { useHapticFeedback } from '../hooks/useHapticFeedback'
import { mockChronicles } from '../data/mockChronicles'

export const Chronicles: React.FC = () => {
  const [chronicles, setChronicles] = useState<Chronicle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [selectedChronicleId, setSelectedChronicleId] = useState<string | null>(null)
  const [likedChronicles, setLikedChronicles] = useState<Set<string>>(new Set())
  
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const isScrolling = useRef<boolean>(false)
  const { impact } = useHapticFeedback()

  useEffect(() => {
    loadChronicles()
  }, [])

  const loadChronicles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Пробуем загрузить с API
      try {
        const response = await apiClient.getChronicles()
        
        if (response.error || !response.data || response.data.length === 0) {
          // Если API не вернул данные, используем mock данные
          console.log('API не вернул данные, используем mock хроники')
          setChronicles(mockChronicles)
        } else {
          setChronicles(response.data)
          
          // Загружаем лайки пользователя
          try {
            const likedResponse = await apiClient.getLikedChronicles()
            if (likedResponse.data) {
              setLikedChronicles(new Set(likedResponse.data.map((c: Chronicle) => c.id)))
            }
          } catch (err) {
            console.warn('Не удалось загрузить лайки:', err)
          }
        }
      } catch (apiErr) {
        // Если API недоступен, используем mock данные
        console.log('API недоступен, используем mock хроники:', apiErr)
        setChronicles(mockChronicles)
      }
    } catch (err) {
      console.error('Error loading chronicles:', err)
      // В случае ошибки все равно показываем mock данные
      setChronicles(mockChronicles)
    } finally {
      setLoading(false)
    }
  }

  // Предзагрузка следующего видео
  useEffect(() => {
    if (chronicles.length > 0 && currentIndex < chronicles.length - 1) {
      const nextVideo = chronicles[currentIndex + 1]
      if (nextVideo?.videoUrl) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'video'
        link.href = nextVideo.videoUrl
        document.head.appendChild(link)
      }
    }
  }, [currentIndex, chronicles])

  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    if (isScrolling.current) return
    
    impact('light')
    isScrolling.current = true
    
    if (direction === 'up' && currentIndex < chronicles.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
    
    setTimeout(() => {
      isScrolling.current = false
    }, 500)
  }, [currentIndex, chronicles.length, impact])

  const handleTouchStart = (e: React.TouchEvent) => {
    // Игнорируем касания на кнопки и интерактивные элементы
    const target = e.target as HTMLElement
    if (target.closest('button') || 
        target.closest('[role="button"]') || 
        target.closest('.no-swipe') ||
        target.tagName === 'BUTTON') {
      return
    }
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Игнорируем движения при касании кнопок
    const target = e.target as HTMLElement
    if (target.closest('button') || 
        target.closest('[role="button"]') || 
        target.closest('.no-swipe') ||
        target.tagName === 'BUTTON') {
      return
    }
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Игнорируем завершение касания на кнопки
    const target = e.target as HTMLElement
    if (target.closest('button') || 
        target.closest('[role="button"]') || 
        target.closest('.no-swipe') ||
        target.tagName === 'BUTTON') {
      return
    }
    
    const diff = touchStartY.current - touchEndY.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleSwipe('up')
      } else {
        handleSwipe('down')
      }
    }
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isScrolling.current) return
    
    const threshold = 50
    if (Math.abs(e.deltaY) > threshold) {
      if (e.deltaY > 0) {
        handleSwipe('up')
      } else {
        handleSwipe('down')
      }
    }
  }, [handleSwipe])

  const handleLike = async (chronicleId: string) => {
    const isLiked = likedChronicles.has(chronicleId)
    impact('medium')
    
    // Оптимистичное обновление
    setLikedChronicles(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.delete(chronicleId)
      } else {
        newSet.add(chronicleId)
      }
      return newSet
    })

    setChronicles(prev => prev.map(c => 
      c.id === chronicleId 
        ? { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ))

    try {
      if (isLiked) {
        await apiClient.unlikeChronicle(chronicleId)
      } else {
        await apiClient.likeChronicle(chronicleId)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      // Откатываем при ошибке
      setLikedChronicles(prev => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.add(chronicleId)
        } else {
          newSet.delete(chronicleId)
        }
        return newSet
      })
      setChronicles(prev => prev.map(c => 
        c.id === chronicleId 
          ? { ...c, likes: isLiked ? c.likes + 1 : c.likes - 1 }
          : c
      ))
    }
  }

  const handleComment = (chronicleId: string) => {
    impact('light')
    setSelectedChronicleId(chronicleId)
    setShowComments(true)
  }

  const handleShare = async (chronicle: Chronicle) => {
    impact('light')
    const shareUrl = `${window.location.origin}/chronicles/${chronicle.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: chronicle.title,
          text: chronicle.description,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: копируем в буфер обмена
      navigator.clipboard.writeText(shareUrl)
      // Можно показать уведомление
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-darkcase-black flex items-center justify-center">
        <SkeletonLoader type="banner" />
      </div>
    )
  }

  if (chronicles.length === 0 && !loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-darkcase-black flex items-center justify-center">
        <EmptyState
          icon="🔥"
          title="Хроники не найдены"
          message="Пока нет опубликованных хроник"
          actionLabel="Обновить"
          onAction={loadChronicles}
        />
      </div>
    )
  }

  const currentChronicle = chronicles[currentIndex]

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-darkcase-black overflow-hidden"
      style={{ 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        height: '100dvh', // Dynamic viewport height для мобильных
        minHeight: '100vh',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {currentChronicle && (
        <ChronicleVideo
          chronicle={currentChronicle}
          isLiked={likedChronicles.has(currentChronicle.id)}
          onLike={() => handleLike(currentChronicle.id)}
          onComment={() => handleComment(currentChronicle.id)}
          onShare={() => handleShare(currentChronicle)}
          isActive={true}
        />
      )}

      {/* Индикатор текущего видео */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-none">
        {chronicles.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all ${
              index === currentIndex
                ? 'h-8 bg-darkcase-crimson'
                : 'h-4 bg-darkcase-mediumGray/50'
            }`}
          />
        ))}
      </div>

      {/* Модальное окно комментариев */}
      {showComments && selectedChronicleId && (
        <CommentsModal
          chronicleId={selectedChronicleId}
          onClose={() => {
            setShowComments(false)
            setSelectedChronicleId(null)
          }}
        />
      )}
    </div>
  )
}
