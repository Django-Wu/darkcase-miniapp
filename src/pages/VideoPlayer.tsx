import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { VideoPlayer as VideoPlayerComponent } from '../components/ui/VideoPlayer'
import { mockMovies } from '../data/mockData'

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const movie = mockMovies.find((m) => m.id === id)
  
  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">Video Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-netflix-red text-white rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }
  
  // Mock video URL - в реальном приложении здесь будет реальная ссылка на видео
  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  
  return (
    <VideoPlayerComponent
      src={videoUrl}
      poster={movie.poster}
      title={movie.title}
      onClose={() => navigate(-1)}
      autoPlay
    />
  )
}

