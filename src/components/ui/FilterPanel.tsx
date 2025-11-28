import React from 'react'

interface Filter {
  id: string
  label: string
  options: { value: string; label: string }[]
  value: string | null
  onChange: (value: string | null) => void
}

interface FilterPanelProps {
  filters: Filter[]
  onReset: () => void
  activeCount: number
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onReset, activeCount }) => {
  return (
    <div className="bg-darkcase-darkGray/80 backdrop-blur-sm border-b border-darkcase-mediumGray/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Фильтры</h3>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-darkcase-crimson text-sm font-medium hover:underline"
          >
            Сбросить ({activeCount})
          </button>
        )}
      </div>
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id}>
            <label className="block text-sm font-medium text-netflix-lightGray mb-2">
              {filter.label}
            </label>
            <select
              value={filter.value || ''}
              onChange={(e) => filter.onChange(e.target.value || null)}
              className="w-full px-3 py-2 bg-darkcase-darkGray border border-darkcase-mediumGray/50 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
            >
              <option value="">Все</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

