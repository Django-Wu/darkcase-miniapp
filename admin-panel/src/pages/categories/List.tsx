import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesAPI } from '../../api/client'
import { Plus, Edit, Trash2 } from 'lucide-react'

export const CategoriesList: React.FC = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const categories = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Категории</h1>
          <p className="text-white/60">Управление категориями кейсов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-darkcase-crimson hover:bg-darkcase-red text-white font-semibold rounded-lg transition-colors">
          <Plus size={20} />
          <span>Создать категорию</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="text-center text-white/60 py-12">Загрузка...</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-white/60 py-12">Категории не найдены</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: any) => (
            <div
              key={category.id}
              className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg p-6 hover:border-darkcase-crimson/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-white/60 text-sm">
                    Кейсов: {category.cases?.length || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-darkcase-crimson hover:text-darkcase-red transition-colors">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

