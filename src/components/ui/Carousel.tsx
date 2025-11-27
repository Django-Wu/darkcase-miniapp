import React, { useRef } from 'react'
import { Movie } from '../../types'
import { CardPoster } from './CardPoster'

interface CarouselProps {
  title: string
  items: Movie[]
  onItemClick?: (movie: Movie) => void
}

export const Carousel: React.FC<CarouselProps> = ({ title, items, onItemClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-netflix-darkGray hover:bg-netflix-mediumGray transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-netflix-darkGray hover:bg-netflix-mediumGray transition-colors"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <CardPoster
            key={item.id}
            movie={item}
            onClick={() => onItemClick?.(item)}
            size="md"
          />
        ))}
      </div>
    </div>
  )
}

