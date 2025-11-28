import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { casesAPI, uploadAPI } from '../../api/client'
import { ArrowLeft, Upload, X } from 'lucide-react'

const caseSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  country: z.string().min(1, 'Страна обязательна'),
  year: z.number().min(1900).max(2100),
  duration: z.string().min(1),
  crimeType: z.array(z.string()).min(1, 'Выберите хотя бы один тип преступления'),
  tags: z.array(z.string()),
  status: z.enum(['Solved', 'Unsolved', 'Cold Case']),
  victims: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(10),
  poster: z.string().url().optional(),
  backdrop: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  timeline: z.array(z.object({
    date: z.string(),
    event: z.string(),
  })).optional(),
  facts: z.array(z.string()).optional(),
})

type CaseFormData = z.infer<typeof caseSchema>

export const CaseCreate: React.FC = () => {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState<string | null>(null)
  const [timelineItems, setTimelineItems] = useState<Array<{ date: string; event: string }>>([])
  const [facts, setFacts] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      crimeType: [],
      tags: [],
      status: 'Unsolved',
      rating: 0,
      timeline: [],
      facts: [],
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CaseFormData) => casesAPI.create(data),
    onSuccess: () => {
      navigate('/cases')
    },
  })

  const handleFileUpload = async (file: File, type: 'poster' | 'backdrop' | 'video') => {
    setUploading(type)
    try {
      let url: string
      if (type === 'poster') {
        const response = await uploadAPI.uploadPoster(file)
        url = response.url
      } else if (type === 'backdrop') {
        const response = await uploadAPI.uploadBackdrop(file)
        url = response.url
      } else {
        const response = await uploadAPI.uploadVideo(file)
        url = response.url
      }
      setValue(type === 'video' ? 'videoUrl' : type, url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setUploading(null)
    }
  }

  const addTimelineItem = () => {
    setTimelineItems([...timelineItems, { date: '', event: '' }])
  }

  const removeTimelineItem = (index: number) => {
    setTimelineItems(timelineItems.filter((_, i) => i !== index))
  }

  const updateTimelineItem = (index: number, field: 'date' | 'event', value: string) => {
    const updated = [...timelineItems]
    updated[index] = { ...updated[index], [field]: value }
    setTimelineItems(updated)
  }

  const addFact = () => {
    setFacts([...facts, ''])
  }

  const removeFact = (index: number) => {
    setFacts(facts.filter((_, i) => i !== index))
  }

  const updateFact = (index: number, value: string) => {
    const updated = [...facts]
    updated[index] = value
    setFacts(updated)
  }

  const onSubmit = (data: CaseFormData) => {
    const submitData = {
      ...data,
      timeline: timelineItems.filter(item => item.date && item.event),
      facts: facts.filter(f => f.trim()),
    }
    createMutation.mutate(submitData)
  }

  const crimeTypes = ['Serial Killer', 'Murder', 'Disappearance', 'Rape', 'Robbery', 'Terrorism', 'Fraud', 'Kidnapping']
  const statuses = [
    { value: 'Solved', label: 'Раскрыто' },
    { value: 'Unsolved', label: 'Нераскрыто' },
    { value: 'Cold Case', label: 'Холодное дело' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/cases')}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Создать кейс</h1>
          <p className="text-white/60">Добавьте новый криминальный кейс</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Название *
              </label>
              <input
                {...register('title')}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Страна *
              </label>
              <input
                {...register('country')}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              />
              {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Год *
              </label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              />
              {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Длительность *
              </label>
              <input
                {...register('duration')}
                placeholder="45 min"
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              />
              {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Рейтинг *
              </label>
              <input
                type="number"
                step="0.1"
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-4 py-2.2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              />
              {errors.rating && <p className="text-red-400 text-sm mt-1">{errors.rating.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Статус *
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Количество жертв
              </label>
              <input
                type="number"
                {...register('victims', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Описание *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white focus:outline-none focus:border-darkcase-crimson resize-none"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Crime Types */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Типы преступлений *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {crimeTypes.map((type) => {
                const selected = watch('crimeType') || []
                return (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected.includes(type)
                        ? 'bg-darkcase-crimson/20 border-darkcase-crimson'
                        : 'bg-darkcase-darkGray border-darkcase-mediumGray hover:border-darkcase-crimson/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={type}
                      {...register('crimeType')}
                      className="w-4 h-4 text-darkcase-crimson rounded focus:ring-darkcase-crimson"
                    />
                    <span className="text-sm text-white">{type}</span>
                  </label>
                )
              })}
            </div>
            {errors.crimeType && <p className="text-red-400 text-sm mt-1">{errors.crimeType.message}</p>}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUploadField
              label="Постер"
              type="poster"
              value={watch('poster')}
              uploading={uploading === 'poster'}
              onUpload={handleFileUpload}
            />
            <FileUploadField
              label="Backdrop"
              type="backdrop"
              value={watch('backdrop')}
              uploading={uploading === 'backdrop'}
              onUpload={handleFileUpload}
            />
            <FileUploadField
              label="Видео"
              type="video"
              value={watch('videoUrl')}
              uploading={uploading === 'video'}
              onUpload={handleFileUpload}
            />
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/80">
                Хронология событий
              </label>
              <button
                type="button"
                onClick={addTimelineItem}
                className="text-sm text-darkcase-crimson hover:text-darkcase-red"
              >
                + Добавить событие
              </button>
            </div>
            <div className="space-y-3">
              {timelineItems.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Дата"
                    value={item.date}
                    onChange={(e) => updateTimelineItem(index, 'date', e.target.value)}
                    className="flex-1 px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Событие"
                    value={item.event}
                    onChange={(e) => updateTimelineItem(index, 'event', e.target.value)}
                    className="flex-1 px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeTimelineItem(index)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Facts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/80">
                Ключевые факты
              </label>
              <button
                type="button"
                onClick={addFact}
                className="text-sm text-darkcase-crimson hover:text-darkcase-red"
              >
                + Добавить факт
              </button>
            </div>
            <div className="space-y-2">
              {facts.map((fact, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={fact}
                    onChange={(e) => updateFact(index, e.target.value)}
                    placeholder="Введите факт"
                    className="flex-1 px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeFact(index)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-6 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray text-white rounded-lg hover:bg-darkcase-mediumGray transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-darkcase-crimson hover:bg-darkcase-red text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Создание...' : 'Создать кейс'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface FileUploadFieldProps {
  label: string
  type: 'poster' | 'backdrop' | 'video'
  value?: string
  uploading: boolean
  onUpload: (file: File, type: 'poster' | 'backdrop' | 'video') => void
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ label, type, value, uploading, onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file, type)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
      <div className="relative">
        {value ? (
          <div className="relative">
            {type !== 'video' ? (
              <img src={value} alt={label} className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-32 bg-darkcase-darkGray rounded-lg flex items-center justify-center">
                <span className="text-white/60">Видео загружено</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {}}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-darkcase-mediumGray rounded-lg cursor-pointer hover:border-darkcase-crimson transition-colors">
            {uploading ? (
              <span className="text-white/60">Загрузка...</span>
            ) : (
              <>
                <Upload className="text-white/40 mb-2" size={24} />
                <span className="text-sm text-white/60">Нажмите для загрузки</span>
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept={type === 'video' ? 'video/*' : 'image/*'} />
          </label>
        )}
      </div>
    </div>
  )
}

