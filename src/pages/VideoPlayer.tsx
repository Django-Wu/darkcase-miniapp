import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { VideoPlayer as VideoPlayerComponent } from '../components/ui/VideoPlayer'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../services/api'
import { Case } from '../types'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateWatchProgress, getWatchProgress } = useAppStore()
  const [caseItem, setCaseItem] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (id) {
      loadCase(id)
    }
  }, [id])
  
  const loadCase = async (caseId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getCase(caseId)
      
      if (response.error || !response.data) {
        setError(response.error || 'Кейс не найден')
        return
      }
      
      setCaseItem(response.data)
    } catch (err) {
      console.error('Error loading case:', err)
      setError('Не удалось загрузить данные кейса')
    } finally {
      setLoading(false)
    }
  }
  
  const savedProgress = caseItem ? getWatchProgress(caseItem.id) : 0
  
  const handleProgressUpdate = async (progress: number) => {
    if (!caseItem) return
    
    // Метод updateWatchProgress теперь автоматически синхронизируется с сервером
    // Синхронизация происходит в фоне с debounce
    await updateWatchProgress(caseItem.id, progress)
  }
  
  if (loading) {
    return (
      <div className="h-screen bg-darkcase-black flex items-center justify-center">
        <SkeletonLoader type="banner" />
      </div>
    )
  }
  
  if (error || !caseItem) {
    return (
      <div className="flex items-center justify-center h-screen bg-darkcase-black">
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
  
  // Используем videoUrl из кейса, если есть, иначе fallback
  const videoUrl = caseItem.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  
  return (
    <VideoPlayerComponent
      src={videoUrl}
      poster={caseItem.poster}
      title={caseItem.title}
      caseId={caseItem.id}
      onClose={() => navigate(-1)}
      onProgressUpdate={handleProgressUpdate}
      autoPlay
      initialProgress={savedProgress}
    />
  )
}
