import React, { useRef, useEffect, useState } from 'react'
import { Chronicle } from '../../types'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

interface ChronicleVideoProps {
  chronicle: Chronicle
  isLiked: boolean
  onLike: () => void
  onComment: () => void
  onShare: () => void
  isActive: boolean
}

export const ChronicleVideo: React.FC<ChronicleVideoProps> = ({
  chronicle,
  isLiked,
  onLike,
  onComment,
  onShare,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const { impact } = useHapticFeedback()

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && isPlaying) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive, isPlaying])

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }, [isActive, chronicle.id])

  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showControls])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(console.error)
      }
      setIsPlaying(!isPlaying)
      setShowControls(true)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Обработчики для предотвращения всплытия событий от кнопок
  const handleButtonInteraction = (e: React.MouseEvent | React.TouchEvent, callback: () => void) => {
    e.stopPropagation()
    e.preventDefault()
    callback()
  }

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
      {/* Видео */}
      <video
        ref={videoRef}
        src={chronicle.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={(e) => {
          // Игнорируем клики если они были на кнопке
          const target = e.target as HTMLElement
          if (!target.closest('button') && !target.closest('.no-swipe')) {
            togglePlay()
          }
        }}
        onError={(e) => {
          console.error('Video load error:', e)
        }}
      />

      {/* Overlay градиент */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Контролы */}
      {showControls && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm text-white text-3xl hover:bg-black/70 transition-colors no-swipe pointer-events-auto"
          style={{ touchAction: 'manipulation' }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      )}

      {/* UI элементы справа */}
      <div 
        className="absolute right-4 z-30 flex flex-col gap-4 items-center pointer-events-auto no-swipe"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 24px)' }}
      >
        {/* Лайк */}
        <button
          onClick={(e) => handleButtonInteraction(e, onLike)}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className="flex flex-col items-center gap-1 no-swipe"
          style={{ touchAction: 'manipulation' }}
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            isLiked 
              ? 'bg-darkcase-crimson/80 text-white' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}>
            <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
          </div>
          <span className="text-xs text-white font-semibold drop-shadow-lg">
            {formatNumber(chronicle.likes)}
          </span>
        </button>

        {/* Комментарии */}
        <button
          onClick={(e) => handleButtonInteraction(e, onComment)}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className="flex flex-col items-center gap-1 no-swipe"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors">
            <span className="text-2xl">💬</span>
          </div>
          <span className="text-xs text-white font-semibold drop-shadow-lg">
            {formatNumber(chronicle.comments)}
          </span>
        </button>

        {/* Поделиться */}
        <button
          onClick={(e) => handleButtonInteraction(e, onShare)}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className="flex flex-col items-center gap-1 no-swipe"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors">
            <span className="text-2xl">🔗</span>
          </div>
        </button>
      </div>

      {/* Текст внизу */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 z-30 pointer-events-none"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <h3 className="text-white font-bold text-lg mb-2 drop-shadow-lg">
          {chronicle.title}
        </h3>
        <p className="text-white/90 text-sm line-clamp-2 drop-shadow-lg">
          {chronicle.description}
        </p>
        {chronicle.tags && chronicle.tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {chronicle.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-darkcase-crimson/50 backdrop-blur-sm rounded text-xs text-white"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
