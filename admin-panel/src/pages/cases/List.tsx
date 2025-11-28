import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { casesAPI } from '../../api/client'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export const CasesList: React.FC = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['cases', page, search],
    queryFn: () => casesAPI.getAll({ page, limit: 20, search }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => casesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот кейс?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const cases = data?.data || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Кейсы</h1>
          <p className="text-white/60">Управление криминальными кейсами</p>
        </div>
        <Link
          to="/cases/create"
          className="flex items-center gap-2 px-4 py-2 bg-darkcase-crimson hover:bg-darkcase-red text-white font-semibold rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Создать кейс</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Поиск кейсов..."
          className="w-full pl-10 pr-4 py-2.5 bg-darkcase-black border border-darkcase-mediumGray rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-darkcase-crimson transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white/60">Загрузка...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-white/60">Кейсы не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-darkcase-darkGray border-b border-darkcase-mediumGray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Страна
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Год
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Рейтинг
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkcase-mediumGray">
                {cases.map((caseItem: any) => (
                  <tr key={caseItem.id} className="hover:bg-darkcase-darkGray/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{caseItem.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/80">{caseItem.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/80">{caseItem.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          caseItem.status === 'Solved'
                            ? 'bg-green-500/20 text-green-400'
                            : caseItem.status === 'Unsolved'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {caseItem.status === 'Solved'
                          ? 'Раскрыто'
                          : caseItem.status === 'Unsolved'
                          ? 'Нераскрыто'
                          : 'Холодное дело'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/80">★ {caseItem.rating}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/cases/${caseItem.id}/edit`}
                          className="text-darkcase-crimson hover:text-darkcase-red transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(caseItem.id)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Показано {cases.length} из {pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-darkcase-black border border-darkcase-mediumGray rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-darkcase-darkGray transition-colors"
            >
              Назад
            </button>
            <span className="px-4 py-2 text-white/80">
              Страница {page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-darkcase-black border border-darkcase-mediumGray rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-darkcase-darkGray transition-colors"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

