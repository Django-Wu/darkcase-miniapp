import React, { useRef, useState, useEffect } from 'react'
import { Case } from '../../types'
import { CardPoster } from './CardPoster'
import { SkeletonLoader } from './SkeletonLoader'

interface CarouselProps {
  title: string
  items: Case[]
  onItemClick?: (caseItem: Case) => void
  loading?: boolean
  autoScroll?: boolean
  autoScrollInterval?: number
}

export const Carousel: React.FC<CarouselProps> = ({ 
  title, 
  items, 
  onItemClick, 
  loading = false,
  autoScroll = false,
  autoScrollInterval = 5000,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      
      // Calculate current index for indicators
      const cardWidth = 140 // w-32 (128px) + gap (12px)
      const index = Math.round(scrollLeft / cardWidth)
      setCurrentIndex(index)
    }
  }
  
  useEffect(() => {
    checkScroll()
    const element = scrollRef.current
    if (element) {
      element.addEventListener('scroll', checkScroll)
      return () => element.removeEventListener('scroll', checkScroll)
    }
  }, [items])
  
  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || !items.length || isHovered || loading) return
    
    autoScrollRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const cardWidth = 140
        const maxScroll = scrollWidth - clientWidth
        
        if (scrollLeft >= maxScroll - 10) {
          // Reset to start
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          // Scroll to next
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
        }
      }
    }, autoScrollInterval)
    
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [autoScroll, items.length, isHovered, loading, autoScrollInterval])
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }
  
  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 140
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }
  
  const maxVisibleCards = items.length > 0 ? Math.ceil(items.length / 2) : 0
  
  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-4">
          <SkeletonLoader type="title" className="w-32" />
          <div className="h-px flex-1 bg-gradient-to-r from-darkcase-crimson/30 to-transparent" />
        </div>
        <div className="flex gap-3 overflow-x-auto px-4">
          <SkeletonLoader type="card" count={5} />
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-darkcase-crimson/30 to-transparent" />
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all ${
                canScrollLeft
                  ? 'bg-darkcase-darkGray/80 hover:bg-darkcase-crimson/20 border-darkcase-mediumGray/50 hover:border-darkcase-crimson/50'
                  : 'bg-darkcase-darkGray/40 border-darkcase-mediumGray/20 opacity-50 cursor-not-allowed'
              }`}
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all ${
                canScrollRight
                  ? 'bg-darkcase-darkGray/80 hover:bg-darkcase-crimson/20 border-darkcase-mediumGray/50 hover:border-darkcase-crimson/50'
                  : 'bg-darkcase-darkGray/40 border-darkcase-mediumGray/20 opacity-50 cursor-not-allowed'
              }`}
            >
              →
            </button>
          </div>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={checkScroll}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <CardPoster
              key={item.id}
              movie={item}
              onClick={() => onItemClick?.(item)}
              size="md"
            />
          ))
        ) : (
          <div className="text-netflix-lightGray text-sm px-4">Нет кейсов в этой категории</div>
        )}
      </div>
      {/* Indicators */}
      {items.length > 3 && (
        <div className="flex items-center justify-center gap-2 mt-3 px-4">
          {Array.from({ length: Math.min(maxVisibleCards, 5) }).map((_, index) => {
            const isActive = Math.floor(currentIndex / 2) === index
            return (
              <button
                key={index}
                onClick={() => scrollToIndex(index * 2)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-6 bg-darkcase-crimson'
                    : 'w-1.5 bg-darkcase-mediumGray/50 hover:bg-darkcase-mediumGray'
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

