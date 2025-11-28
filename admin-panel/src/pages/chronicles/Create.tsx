import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { chroniclesAPI, casesAPI, uploadAPI, apiClient } from '../../api/client'
import { ArrowLeft, Upload, X } from 'lucide-react'

const chronicleSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  caseId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']),
})

type ChronicleFormData = z.infer<typeof chronicleSchema>

export const ChronicleCreate: React.FC = () => {
  const navigate = useNavigate()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: () => casesAPI.getAll({ limit: 100 }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ChronicleFormData>({
    resolver: zodResolver(chronicleSchema),
    defaultValues: {
      status: 'draft',
      tags: [],
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => chroniclesAPI.create(data),
    onSuccess: () => {
      navigate('/chronicles')
    },
  })

  const handleVideoUpload = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('Видео слишком большое. Максимум 100MB')
      return
    }

    // Получаем длительность видео
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = Math.floor(video.duration)
      if (duration > 300) { // 5 минут
        alert('Видео слишком длинное. Максимум 5 минут')
        return
      }
      setDuration(duration)
    }
    video.src = URL.createObjectURL(file)

    setUploading(true)
    try {
      const response = await uploadAPI.uploadVideo(file)
      setVideoUrl(response.url)
    } catch (error) {
      console.error('Video upload error:', error)
      alert('Ошибка загрузки видео')
    } finally {
      setUploading(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post('/api/upload/poster', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setThumbnailUrl(response.data.url)
    } catch (error) {
      console.error('Thumbnail upload error:', error)
      alert('Ошибка загрузки превью')
    } finally {
      setUploading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: ChronicleFormData) => {
    if (!videoUrl) {
      alert('Загрузите видео')
      return
    }

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('videoUrl', videoUrl)
    formData.append('status', data.status)
    if (data.caseId) formData.append('caseId', data.caseId)
    if (thumbnailUrl) formData.append('thumbnail', thumbnailUrl)
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags))
    if (duration > 0) formData.append('duration', duration.toString())

    createMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/chronicles')}
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Создать хронику</h1>
          <p className="text-white/60">Добавьте новое короткое видео</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Видео */}
        <div>
          <label className="block text-white font-semibold mb-2">Видео (до 5 минут, формат 9:16)</label>
          {!videoUrl ? (
            <div className="border-2 border-dashed border-darkcase-mediumGray rounded-lg p-8 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setVideoFile(file)
                    handleVideoUpload(file)
                  }
                }}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-white/60" />
                <span className="text-white/60">
                  {uploading ? 'Загрузка...' : 'Нажмите для загрузки видео'}
                </span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoUrl}
                controls
                className="w-full max-w-md rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('')
                  setVideoFile(null)
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Превью */}
        <div>
          <label className="block text-white font-semibold mb-2">Превью (опционально)</label>
          {!thumbnailUrl ? (
            <div className="border-2 border-dashed border-darkcase-mediumGray rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setThumbnailFile(file)
                    handleThumbnailUpload(file)
                  }
                }}
                className="hidden"
                id="thumbnail-upload"
                disabled={uploading}
              />
              <label
                htmlFor="thumbnail-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-white/60" />
                <span className="text-white/60">Загрузить превью</span>
              </label>
            </div>
          ) : (
            <div className="relative w-32">
              <img src={thumbnailUrl} alt="Preview" className="w-full rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailUrl('')
                  setThumbnailFile(null)
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Название */}
        <div>
          <label className="block text-white font-semibold mb-2">Название *</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
            placeholder="Название хроники"
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Описание */}
        <div>
          <label className="block text-white font-semibold mb-2">Описание *</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
            placeholder="Краткое описание хроники"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Связь с кейсом */}
        <div>
          <label className="block text-white font-semibold mb-2">Связать с кейсом (опционально)</label>
          <select
            {...register('caseId')}
            className="w-full px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
          >
            <option value="">Не выбрано</option>
            {cases?.data?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Теги */}
        <div>
          <label className="block text-white font-semibold mb-2">Теги</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Добавить тег"
              className="flex-1 px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-darkcase-crimson text-white rounded-lg hover:bg-darkcase-red transition-colors"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-darkcase-crimson/20 text-darkcase-crimson rounded-full flex items-center gap-2"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-darkcase-crimson hover:text-darkcase-red"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-white font-semibold mb-2">Статус</label>
          <select
            {...register('status')}
            className="w-full px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
          </select>
        </div>

        {/* Кнопки */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/chronicles')}
            className="px-6 py-2 bg-darkcase-mediumGray text-white rounded-lg hover:bg-darkcase-darkGray transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || uploading || !videoUrl}
            className="px-6 py-2 bg-darkcase-crimson text-white rounded-lg hover:bg-darkcase-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Создание...' : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  )
}

