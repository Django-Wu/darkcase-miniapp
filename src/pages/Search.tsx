import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { CardPoster } from '../components/ui/CardPoster'
import { EmptyState } from '../components/ui/EmptyState'
import { mockMovies } from '../data/mockData'
import { Movie } from '../types'

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return mockMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.genres.some((g) => g.toLowerCase().includes(query))
    )
  }, [searchQuery])
  
  const handleMovieClick = (movie: Movie) => {
    navigate(`/detail/${movie.id}`)
  }
  
  return (
    <div className="h-screen pb-20 px-4 overflow-y-auto">
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search movies, series, genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-lg"
        />
      </div>
      
      {!searchQuery.trim() ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Start Searching</h2>
          <p className="text-netflix-lightGray">
            Find your favorite movies and series
          </p>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 text-left">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Action', 'Drama', 'Sci-Fi', 'Comedy', 'Thriller', 'Horror'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSearchQuery(genre)}
                  className="px-4 py-2 bg-netflix-darkGray text-white rounded-full hover:bg-netflix-mediumGray transition-colors"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : filteredMovies.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">
            Results ({filteredMovies.length})
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredMovies.map((movie) => (
              <CardPoster
                key={movie.id}
                movie={movie}
                onClick={() => handleMovieClick(movie)}
                size="lg"
                showInfo
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon="😕"
          title="No Results Found"
          message="Try searching for something else or check your spelling"
        />
      )}
    </div>
  )
}

