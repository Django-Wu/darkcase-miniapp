import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CardPoster } from '../components/ui/CardPoster'
import { mockMovies } from '../data/mockData'
import { Movie } from '../types'

export const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const movie = mockMovies.find((m) => m.id === id)
  
  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }
  
  const similarMovies = mockMovies.filter((m) => m.id !== movie.id).slice(0, 6)
  
  return (
    <div className="h-screen pb-20 overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-96">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/80 to-transparent" />
        </div>
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
          >
            ←
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
          <div className="flex items-center gap-4 mb-3 text-sm text-white">
            <span>⭐ {movie.rating}</span>
            <span>•</span>
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.duration}</span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="px-4 py-6 flex gap-3">
        <Button
          onClick={() => navigate(`/player/${movie.id}`)}
          fullWidth
          size="lg"
        >
          ▶ Play
        </Button>
        <button className="w-12 h-12 flex items-center justify-center bg-netflix-darkGray rounded-lg hover:bg-netflix-mediumGray transition-colors">
          ⬇
        </button>
      </div>
      
      {/* Info */}
      <div className="px-4 mb-6">
        <p className="text-white mb-4">{movie.description}</p>
        <div className="space-y-2">
          <div>
            <span className="text-netflix-lightGray">Genres: </span>
            <span className="text-white">{movie.genres.join(', ')}</span>
          </div>
          {movie.director && (
            <div>
              <span className="text-netflix-lightGray">Director: </span>
              <span className="text-white">{movie.director}</span>
            </div>
          )}
          {movie.cast && (
            <div>
              <span className="text-netflix-lightGray">Cast: </span>
              <span className="text-white">{movie.cast.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <div className="px-4">
          <h2 className="text-xl font-bold text-white mb-4">More Like This</h2>
          <div className="grid grid-cols-3 gap-3">
            {similarMovies.map((similar) => (
              <CardPoster
                key={similar.id}
                movie={similar}
                onClick={() => navigate(`/detail/${similar.id}`)}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

