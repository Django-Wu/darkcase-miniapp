import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs } from '../components/ui/Tabs'
import { CardPoster } from '../components/ui/CardPoster'
import { EmptyState } from '../components/ui/EmptyState'
import { mockCategories, mockMovies } from '../data/mockData'
import { Movie } from '../types'

export const Browse: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const navigate = useNavigate()
  
  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'genres', label: 'Genres' },
    { id: 'all', label: 'All Movies' },
  ]
  
  const handleMovieClick = (movie: Movie) => {
    navigate(`/detail/${movie.id}`)
  }
  
  const allGenres = Array.from(new Set(mockMovies.flatMap((m) => m.genres)))
  
  return (
    <div className="pb-20 px-4">
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white mb-4">Browse</h1>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
      
      {activeTab === 'categories' && (
        <div className="space-y-8">
          {mockCategories.map((category) => (
            <div key={category.id}>
              <h2 className="text-xl font-bold text-white mb-4">{category.name}</h2>
              <div className="grid grid-cols-3 gap-3">
                {category.movies.map((movie) => (
                  <CardPoster
                    key={movie.id}
                    movie={movie}
                    onClick={() => handleMovieClick(movie)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'genres' && (
        <div className="space-y-6">
          {allGenres.map((genre) => {
            const genreMovies = mockMovies.filter((m) => m.genres.includes(genre))
            return (
              <div key={genre}>
                <h2 className="text-xl font-bold text-white mb-4">{genre}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {genreMovies.map((movie) => (
                    <CardPoster
                      key={movie.id}
                      movie={movie}
                      onClick={() => handleMovieClick(movie)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {activeTab === 'all' && (
        <div className="grid grid-cols-3 gap-3">
          {mockMovies.map((movie) => (
            <CardPoster
              key={movie.id}
              movie={movie}
              onClick={() => handleMovieClick(movie)}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  )
}

