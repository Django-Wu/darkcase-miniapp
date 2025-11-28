import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Filter, ChevronDown, Clock, Bookmark, Trash2, Save } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { CardPoster } from '../components/ui/CardPoster'
import { VirtualizedGrid } from '../components/ui/VirtualizedGrid'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { Button } from '../components/ui/Button'
import { Case } from '../types'
import { apiClient } from '../services/api'
import { useSearchHistory, SearchHistoryItem } from '../hooks/useSearchHistory'
import { useSavedFilters, SearchFilters, SavedFilter } from '../hooks/useSavedFilters'
import { translateStatus } from '../utils/translations'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

type SortOption = 'date' | 'rating' | 'popularity'
type SortOrder = 'asc' | 'desc'

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Case[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSavedFilters, setShowSavedFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Фильтры
  const [filters, setFilters] = useState<SearchFilters>({
    country: undefined,
    status: undefined,
    crimeType: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    sortBy: 'rating',
    sortOrder: 'desc',
  })
  
  // Сохранение фильтра
  const [saveFilterName, setSaveFilterName] = useState('')
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false)

  const navigate = useNavigate()
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const suggestionsTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: window.innerWidth, height: 600 })
  
  const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory()
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters()
  const { impact } = useHapticFeedback()

  // Получаем уникальные значения для фильтров
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [availableCrimeTypes, setAvailableCrimeTypes] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    // Загружаем доступные значения для фильтров
    const loadFilterOptions = async () => {
      try {
        const response = await apiClient.getCases({ limit: 1000 })
        if (response.data?.data) {
          const cases = response.data.data
          const countries = [...new Set(cases.map((c: Case) => c.country))].sort()
          const crimeTypes = [...new Set(cases.flatMap((c: Case) => c.crimeType || []))].sort()
          const years = [...new Set(cases.map((c: Case) => c.year))].sort((a, b) => b - a)
          
          setAvailableCountries(countries)
          setAvailableCrimeTypes(crimeTypes)
          setAvailableYears(years)
        }
      } catch (err) {
        console.error('Failed to load filter options:', err)
      }
    }
    loadFilterOptions()
  }, [])

  // Автодополнение
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await apiClient.getSearchSuggestions(searchQuery.trim())
          if (response.data) {
            setSuggestions(response.data)
            setShowSuggestions(true)
          }
        } catch (err) {
          console.error('Failed to get suggestions:', err)
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Debounce поиска с фильтрами
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (searchQuery.trim()) {
      setIsSearching(true)
      setError(null)
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await apiClient.search(searchQuery.trim(), filters)
          if (response.error) {
            setError(response.error)
            setSearchResults([])
          } else if (response.data) {
            setSearchResults(response.data)
            // Добавляем в историю
            addToHistory(searchQuery.trim())
          } else {
            setSearchResults([])
          }
        } catch (err) {
          console.error('Search error:', err)
          setError('Ошибка при поиске. Попробуйте еще раз.')
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 500) // Debounce 500ms
    } else {
      setSearchResults([])
      setIsSearching(false)
      setError(null)
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, filters, addToHistory])

  const handleCaseClick = (caseItem: Case) => {
    impact('light')
    navigate(`/detail/${caseItem.id}`)
  }

  const handleSuggestionClick = (suggestion: string) => {
    impact('light')
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    impact('light')
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const clearFilters = () => {
    impact('medium')
    setFilters({
      country: undefined,
      status: undefined,
      crimeType: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      sortBy: 'rating',
      sortOrder: 'desc',
    })
  }

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.country ||
      filters.status ||
      filters.crimeType ||
      filters.yearFrom ||
      filters.yearTo ||
      filters.sortBy !== 'rating' ||
      filters.sortOrder !== 'desc'
    )
  }, [filters])

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return
    impact('medium')
    saveFilter(saveFilterName.trim(), filters)
    setSaveFilterName('')
    setShowSaveFilterModal(false)
  }

  const handleLoadSavedFilter = (savedFilter: SavedFilter) => {
    impact('medium')
    setFilters(savedFilter.filters)
    setShowSavedFilters(false)
  }

  const popularSearches = [
    'Убийца Зодиак',
    'Джек Потрошитель',
    'Тед Банди',
    'Джеффри Дамер',
    'Чарльз Мэнсон',
  ]

  // Обновляем размеры контейнера при изменении размера окна
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerDimensions({
          width: rect.width || window.innerWidth,
          height: window.innerHeight - rect.top - 100,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  return (
    <div className="h-screen pb-20 px-4 overflow-y-auto relative">
      {/* Поисковая строка */}
      <div className="mb-4 sticky top-0 z-30 bg-darkcase-black/95 backdrop-blur-sm pt-4 pb-2">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Поиск кейсов, стран, типов преступлений..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            onBlur={() => {
              // Задержка для обработки клика по предложению
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            className="text-lg pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                impact('light')
                setSearchQuery('')
                setShowSuggestions(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          )}

          {/* Автодополнение */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-darkcase-darkGray rounded-lg border border-white/10 shadow-xl z-40 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-darkcase-mediumGray/50 text-white text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки фильтров и истории */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              impact('light')
              setShowFilters(!showFilters)
              setShowHistory(false)
              setShowSavedFilters(false)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-darkcase-crimson/20 text-darkcase-crimson border border-darkcase-crimson/30'
                : 'bg-darkcase-darkGray/50 text-white/70 hover:bg-darkcase-mediumGray/50'
            }`}
          >
            <Filter size={16} />
            <span>Фильтры</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-darkcase-crimson rounded-full" />
            )}
          </button>
          <button
            onClick={() => {
              impact('light')
              setShowHistory(!showHistory)
              setShowFilters(false)
              setShowSavedFilters(false)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-darkcase-darkGray/50 text-white/70 hover:bg-darkcase-mediumGray/50 transition-colors"
          >
            <Clock size={16} />
            <span>История</span>
          </button>
          <button
            onClick={() => {
              impact('light')
              setShowSavedFilters(!showSavedFilters)
              setShowFilters(false)
              setShowHistory(false)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-darkcase-darkGray/50 text-white/70 hover:bg-darkcase-mediumGray/50 transition-colors"
          >
            <Bookmark size={16} />
            <span>Сохранённые</span>
          </button>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div className="mt-3 p-4 bg-darkcase-darkGray/50 rounded-lg border border-white/10 space-y-4">
            {/* Страна */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Страна</label>
              <select
                value={filters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
              >
                <option value="">Все страны</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Статус</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
              >
                <option value="">Все статусы</option>
                <option value="Solved">Раскрыто</option>
                <option value="Unsolved">Нераскрыто</option>
                <option value="Cold Case">Холодное дело</option>
              </select>
            </div>

            {/* Тип преступления */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Тип преступления</label>
              <select
                value={filters.crimeType || ''}
                onChange={(e) => handleFilterChange('crimeType', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
              >
                <option value="">Все типы</option>
                {availableCrimeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Год от */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Год от</label>
              <select
                value={filters.yearFrom || ''}
                onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
              >
                <option value="">Любой</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Год до */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Год до</label>
              <select
                value={filters.yearTo || ''}
                onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
              >
                <option value="">Любой</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Сортировка</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy || 'rating'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as SortOption)}
                  className="flex-1 px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
                >
                  <option value="rating">По рейтингу</option>
                  <option value="date">По дате</option>
                  <option value="popularity">По популярности</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as SortOrder)}
                  className="px-3 py-2 bg-darkcase-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-darkcase-crimson"
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </select>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={clearFilters}
                variant="secondary"
                className="flex-1"
              >
                Сбросить
              </Button>
              <Button
                onClick={() => {
                  impact('light')
                  setShowSaveFilterModal(true)
                }}
                variant="secondary"
                className="flex-1"
              >
                <Save size={16} className="mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        )}

        {/* История поиска */}
        {showHistory && (
          <div className="mt-3 p-4 bg-darkcase-darkGray/50 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">История поиска</h3>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    impact('light')
                    clearHistory()
                  }}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Очистить
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-white/60">История поиска пуста</p>
            ) : (
              <div className="space-y-2">
                {history.map((item: SearchHistoryItem) => (
                  <div
                    key={item.timestamp}
                    className="flex items-center justify-between p-2 bg-darkcase-black/50 rounded-lg hover:bg-darkcase-mediumGray/50 transition-colors"
                  >
                    <button
                      onClick={() => {
                        impact('light')
                        setSearchQuery(item.query)
                        setShowHistory(false)
                      }}
                      className="flex-1 text-left text-sm text-white"
                    >
                      {item.query}
                    </button>
                    <button
                      onClick={() => {
                        impact('light')
                        removeFromHistory(item.query)
                      }}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Сохранённые фильтры */}
        {showSavedFilters && (
          <div className="mt-3 p-4 bg-darkcase-darkGray/50 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">Сохранённые фильтры</h3>
            {savedFilters.length === 0 ? (
              <p className="text-sm text-white/60">Нет сохранённых фильтров</p>
            ) : (
              <div className="space-y-2">
                {savedFilters.map((savedFilter) => (
                  <div
                    key={savedFilter.id}
                    className="flex items-center justify-between p-2 bg-darkcase-black/50 rounded-lg hover:bg-darkcase-mediumGray/50 transition-colors"
                  >
                    <button
                      onClick={() => handleLoadSavedFilter(savedFilter)}
                      className="flex-1 text-left text-sm text-white"
                    >
                      {savedFilter.name}
                    </button>
                    <button
                      onClick={() => {
                        impact('light')
                        deleteFilter(savedFilter.id)
                      }}
                      className="text-white/40 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно сохранения фильтра */}
      {showSaveFilterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkcase-darkGray rounded-lg p-6 max-w-md w-full border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Сохранить фильтры</h3>
            <Input
              type="text"
              placeholder="Название фильтра"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveFilter()
                }
              }}
              className="mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  impact('light')
                  setShowSaveFilterModal(false)
                  setSaveFilterName('')
                }}
                variant="secondary"
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSaveFilter}
                disabled={!saveFilterName.trim()}
                className="flex-1"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Популярные запросы */}
      {!searchQuery.trim() && !showFilters && !showHistory && !showSavedFilters && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3">Популярные запросы</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((query) => (
              <button
                key={query}
                onClick={() => {
                  impact('light')
                  setSearchQuery(query)
                }}
                className="px-4 py-2 bg-darkcase-darkGray/50 hover:bg-darkcase-mediumGray/50 text-white rounded-full text-sm transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Результаты поиска */}
      {isSearching ? (
        <div className="grid grid-cols-3 gap-3">
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Ошибка поиска"
          message={error}
        />
      ) : searchQuery.trim() && searchResults.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Ничего не найдено"
          message="Попробуйте изменить запрос или фильтры"
        />
      ) : searchResults.length > 0 ? (
        <div ref={containerRef} className="animate-fade-in">
          <div className="mb-3 text-sm text-white/60">
            Найдено: {searchResults.length} {searchResults.length === 1 ? 'кейс' : 'кейсов'}
          </div>
          <VirtualizedGrid
            items={searchResults}
            onItemClick={handleCaseClick}
            columns={3}
            itemHeight={200}
            containerHeight={containerDimensions.height}
            containerWidth={containerDimensions.width}
            gap={12}
            renderItem={(item) => (
              <CardPoster
                movie={item}
                onClick={() => handleCaseClick(item)}
                size="sm"
              />
            )}
          />
        </div>
      ) : null}
    </div>
  )
}
