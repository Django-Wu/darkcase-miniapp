import React, { useState, useEffect, useRef } from 'react'
import { ChronicleComment } from '../../types'
import { apiClient } from '../../services/api'
import { useAppStore } from '../../store/useAppStore'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

interface CommentsModalProps {
  chronicleId: string
  onClose: () => void
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  chronicleId,
  onClose,
}) => {
  const [comments, setComments] = useState<ChronicleComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const { currentUser } = useAppStore()
  const { impact } = useHapticFeedback()
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComments()
    // Фокус на input при открытии
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [chronicleId])

  useEffect(() => {
    // Закрытие по клику вне модального окна
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getChronicleComments(chronicleId)
      if (response.data) {
        setComments(response.data)
      }
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    impact('medium')
    setSubmitting(true)

    try {
      const response = await apiClient.addChronicleComment(chronicleId, newComment.trim())
      if (response.data) {
        setComments(prev => [response.data!, ...prev])
        setNewComment('')
      }
    } catch (err) {
      console.error('Error adding comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days < 7) return `${days} дн назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div
        ref={modalRef}
        className="w-full bg-darkcase-darkGray rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-in-up"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-darkcase-mediumGray">
          <h2 className="text-white font-bold text-lg">Комментарии</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white hover:text-darkcase-crimson transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Список комментариев */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <SkeletonLoader key={i} type="title" className="h-16" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-netflix-lightGray">
              Пока нет комментариев. Будьте первым!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-darkcase-crimson/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">
                    {comment.userAvatar || comment.userName[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">
                      {comment.userName}
                    </span>
                    <span className="text-netflix-lightGray text-xs">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Форма добавления комментария */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-darkcase-mediumGray">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий..."
              className="flex-1 px-4 py-2 bg-darkcase-mediumGray rounded-lg text-white placeholder-netflix-lightGray focus:outline-none focus:ring-2 focus:ring-darkcase-crimson"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-6 py-2 bg-darkcase-crimson text-white rounded-lg font-semibold hover:bg-darkcase-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

