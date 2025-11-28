import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { chroniclesAPI } from '../../api/client'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export const ChroniclesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: chronicles, isLoading } = useQuery({
    queryKey: ['chronicles'],
    queryFn: () => chroniclesAPI.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chroniclesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicles'] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'published' }) =>
      chroniclesAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicles'] })
    },
  })

  const filteredChronicles = chronicles?.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div className="text-white">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Хроника</h1>
          <p className="text-white/60">Управление короткими видео</p>
        </div>
        <Link
          to="/chronicles/create"
          className="px-4 py-2 bg-darkcase-crimson text-white rounded-lg font-semibold hover:bg-darkcase-red transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Добавить хронику
        </Link>
      </div>

      {/* Поиск */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-darkcase-crimson"
        />
      </div>

      {/* Список хроник */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChronicles?.map((chronicle) => (
          <div
            key={chronicle.id}
            className="bg-darkcase-darkGray rounded-lg overflow-hidden border border-darkcase-mediumGray hover:border-darkcase-crimson/50 transition-colors"
          >
            {/* Видео превью */}
            <div className="relative aspect-[9/16] bg-darkcase-black">
              {chronicle.thumbnail ? (
                <img
                  src={chronicle.thumbnail}
                  alt={chronicle.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <span className="text-4xl">📹</span>
                </div>
              )}
              {chronicle.status === 'draft' && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                  Черновик
                </div>
              )}
            </div>

            {/* Информация */}
            <div className="p-4">
              <h3 className="text-white font-semibold mb-2 line-clamp-2">{chronicle.title}</h3>
              <p className="text-white/60 text-sm mb-3 line-clamp-2">{chronicle.description}</p>

              {/* Статистика */}
              <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                <span>❤️ {chronicle.likes || 0}</span>
                <span>💬 {chronicle.comments || 0}</span>
                {chronicle.duration && <span>⏱ {Math.floor(chronicle.duration / 60)}:{(chronicle.duration % 60).toString().padStart(2, '0')}</span>}
              </div>

              {/* Действия */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/chronicles/${chronicle.id}/edit`}
                  className="flex-1 px-3 py-2 bg-darkcase-mediumGray text-white rounded-lg hover:bg-darkcase-crimson/50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit size={16} />
                  Редактировать
                </Link>
                <button
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      id: chronicle.id,
                      status: chronicle.status === 'published' ? 'draft' : 'published',
                    })
                  }
                  className="px-3 py-2 bg-darkcase-mediumGray text-white rounded-lg hover:bg-darkcase-crimson/50 transition-colors"
                  title={chronicle.status === 'published' ? 'Скрыть' : 'Опубликовать'}
                >
                  {chronicle.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Удалить хронику?')) {
                      deleteMutation.mutate(chronicle.id)
                    }
                  }}
                  className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredChronicles?.length === 0 && (
        <div className="text-center py-12 text-white/60">
          {searchTerm ? 'Ничего не найдено' : 'Пока нет хроник. Создайте первую!'}
        </div>
      )}
    </div>
  )
}

