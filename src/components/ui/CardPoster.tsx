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
      className={`${sizes[size]} flex-shrink-0 cursor-pointer transition-transform duration-200 active:scale-95`}
      onClick={onClick}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-netflix-darkGray">
        <img
          src={movie.poster || 'https://via.placeholder.com/300x450/222222/FFFFFF?text=Poster'}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {showInfo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <p className="text-white text-xs font-semibold truncate">{movie.title}</p>
            {movie.rating && (
              <p className="text-netflix-lightGray text-xs">⭐ {movie.rating.toFixed(1)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

