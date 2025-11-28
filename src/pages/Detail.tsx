import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CardPoster } from '../components/ui/CardPoster'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { Case } from '../types'
import { translateStatus } from '../utils/translations'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../services/api'
import { EmptyState } from '../components/ui/EmptyState'

export const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFavorite, addToFavorites, removeFromFavorites, getWatchProgress, updateWatchProgress } = useAppStore()
  const [caseItem, setCaseItem] = useState<Case | null>(null)
  const [similarCases, setSimilarCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (id) {
      loadCaseData(id)
    }
  }, [id])
  
  const loadCaseData = async (caseId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const [caseResponse, similarResponse] = await Promise.all([
        apiClient.getCase(caseId),
        apiClient.getSimilarCases(caseId),
      ])
      
      if (caseResponse.error || !caseResponse.data) {
        setError(caseResponse.error || 'Кейс не найден')
        return
      }
      
      setCaseItem(caseResponse.data)
      
      if (similarResponse.data) {
        setSimilarCases(similarResponse.data)
      }
    } catch (err) {
      console.error('Error loading case:', err)
      setError('Не удалось загрузить данные кейса')
    } finally {
      setLoading(false)
    }
  }
  
  const favorite = caseItem ? isFavorite(caseItem.id) : false
  const watchProgress = caseItem ? getWatchProgress(caseItem.id) : 0
  const hasWatched = watchProgress > 0
  
  const handleFavoriteToggle = async () => {
    if (!caseItem) return
    
    // Методы addToFavorites и removeFromFavorites теперь автоматически синхронизируются с сервером
    if (favorite) {
      await removeFromFavorites(caseItem.id)
    } else {
      await addToFavorites(caseItem.id)
    }
  }
  
  if (loading) {
    return (
      <div className="h-screen pb-20 overflow-y-auto bg-darkcase-black">
        <SkeletonLoader type="banner" className="h-96 mb-6" />
        <div className="px-4 space-y-4">
          <SkeletonLoader type="title" className="w-3/4" />
          <SkeletonLoader type="text" count={3} />
        </div>
      </div>
    )
  }
  
  if (error || !caseItem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <EmptyState
          icon="🔍"
          title={error || 'Кейс не найден'}
          message="Попробуйте вернуться на главную"
        >
          <Button onClick={() => navigate('/')}>На главную</Button>
        </EmptyState>
      </div>
    )
  }
  
  return (
    <div className="h-screen pb-20 overflow-y-auto bg-darkcase-black">
      {/* Hero Section */}
      <div className="relative h-96 mb-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${caseItem.backdrop})`,
          }}
        >
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="absolute top-4 left-4">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="bg-darkcase-black/50 backdrop-blur-sm"
          >
            ← Назад
          </Button>
        </div>
      </div>
      
      <div className="px-4 space-y-6">
        {/* Title and Info */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow">{caseItem.title}</h1>
          <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
            <span>{caseItem.year}</span>
            <span>•</span>
            <span>{caseItem.duration}</span>
            <span>•</span>
            <span>{caseItem.country}</span>
            <span>•</span>
            <span className={
              caseItem.status === 'Solved' ? 'badge-solved' : 
              caseItem.status === 'Unsolved' ? 'badge-unsolved' : 
              'badge-cold'
            }>
              {translateStatus(caseItem.status)}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/player/${caseItem.id}`)}
            variant="primary"
            className="flex-1"
          >
            {hasWatched ? '▶ Продолжить просмотр' : '▶ Смотреть'}
          </Button>
          <Button
            onClick={handleFavoriteToggle}
            variant={favorite ? 'primary' : 'secondary'}
            className="px-4"
          >
            {favorite ? '❤️' : '🤍'}
          </Button>
        </div>
        
        {/* Description */}
        <div>
          <h2 className="text-lg font-bold text-white mb-2">Описание</h2>
          <p className="text-white/80 leading-relaxed">{caseItem.description}</p>
        </div>
        
        {/* Crime Type */}
        {caseItem.crimeType && caseItem.crimeType.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Тип преступления</h2>
            <div className="flex flex-wrap gap-2">
              {caseItem.crimeType.map((type, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-darkcase-darkGray/50 rounded-full text-sm text-white/80"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {caseItem.tags && caseItem.tags.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Теги</h2>
            <div className="flex flex-wrap gap-2">
              {caseItem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-darkcase-crimson/20 text-darkcase-crimson rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Timeline */}
        {caseItem.timeline && caseItem.timeline.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Хронология</h2>
            <div className="space-y-4">
              {caseItem.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-darkcase-crimson rounded-full" />
                    {index < caseItem.timeline!.length - 1 && (
                      <div className="w-px h-full bg-darkcase-mediumGray mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="text-sm text-darkcase-crimson font-semibold mb-1">
                      {event.date}
                    </div>
                    <div className="text-white/80">{event.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Facts */}
        {caseItem.facts && caseItem.facts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Ключевые факты</h2>
            <ul className="space-y-2">
              {caseItem.facts.map((fact, index) => (
                <li key={index} className="flex items-start gap-2 text-white/80">
                  <span className="text-darkcase-crimson mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Similar Cases */}
        {similarCases.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Похожие кейсы</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {similarCases.map((similarCase) => (
                <CardPoster
                  key={similarCase.id}
                  movie={similarCase}
                  onClick={() => navigate(`/detail/${similarCase.id}`)}
                  size="md"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
