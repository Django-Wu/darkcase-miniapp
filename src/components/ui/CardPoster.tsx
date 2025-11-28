import React from 'react'
import { Movie } from '../../types'

interface CardPosterProps {
  movie: Movie
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  showInfo?: boolean
}

export const CardPoster: React.FC<CardPosterProps> = ({
  movie,
  onClick,
  size = 'md',
  showInfo = false,
}) => {
  const sizes = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  }
  
  return (
    <div
      className={`${sizes[size]} flex-shrink-0 cursor-pointer transition-all duration-300 active:scale-95`}
      onClick={onClick}
    >
      <div className="card-case relative w-full h-full">
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={movie.poster || 'https://via.placeholder.com/300x450/222222/FFFFFF?text=Poster'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/300x450/1a1a1a/DC143C?text=No+Image'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkcase-black via-transparent to-transparent opacity-60" />
        </div>
        {showInfo && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <p className="text-white text-xs font-semibold truncate drop-shadow-lg">{movie.title}</p>
            {movie.rating && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-darkcase-crimson text-xs">★</span>
                <p className="text-white/80 text-xs font-medium">{movie.rating.toFixed(1)}</p>
              </div>
            )}
          </div>
        )}
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-darkcase-crimson/0 via-darkcase-crimson/0 to-darkcase-crimson/0 hover:from-darkcase-crimson/10 hover:via-darkcase-crimson/5 hover:to-darkcase-crimson/10 transition-all duration-300 pointer-events-none" />
      </div>
    </div>
  )
}

