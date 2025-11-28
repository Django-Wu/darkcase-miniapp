import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from '../components/ui/Carousel'
import { CardPoster } from '../components/ui/CardPoster'
import { EmptyState } from '../components/ui/EmptyState'
import { mockCategories, mockContinueWatching, mockMovies } from '../data/mockData'
import { Movie } from '../types'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [featuredMovie] = useState<Movie>(mockMovies[0])
  
  const handleMovieClick = (movie: Movie) => {
    navigate(`/detail/${movie.id}`)
  }
  
  return (
    <div className="h-screen pb-20 overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-96 mb-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${featuredMovie.backdrop})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{featuredMovie.title}</h1>
          <p className="text-white text-sm mb-4 line-clamp-2">{featuredMovie.description}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/player/${featuredMovie.id}`)}
              className="px-6 py-2 bg-white text-netflix-black rounded font-semibold hover:bg-opacity-80 transition-colors"
            >
              ▶ Play
            </button>
            <button
              onClick={() => navigate(`/detail/${featuredMovie.id}`)}
              className="px-6 py-2 bg-netflix-darkGray text-white rounded font-semibold hover:bg-netflix-mediumGray transition-colors"
            >
              ℹ More Info
            </button>
          </div>
        </div>
      </div>
      
      {/* Continue Watching */}
      {mockContinueWatching.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3 px-4">Continue Watching</h2>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
            {mockContinueWatching.map((movie) => (
              <div key={movie.id} className="flex-shrink-0">
                <div className="relative">
                  <CardPoster
                    movie={movie}
                    onClick={() => handleMovieClick(movie)}
                    size="md"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-netflix-darkGray">
                    <div className="h-full bg-netflix-red" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Categories */}
      {mockCategories.map((category) => (
        <Carousel
          key={category.id}
          title={category.name}
          items={category.movies}
          onItemClick={handleMovieClick}
        />
      ))}
    </div>
  )
}

