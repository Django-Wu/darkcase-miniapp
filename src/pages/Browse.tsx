import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs } from '../components/ui/Tabs'
import { CardPoster } from '../components/ui/CardPoster'
import { VirtualizedGrid } from '../components/ui/VirtualizedGrid'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { FilterPanel } from '../components/ui/FilterPanel'
import { Case, Category } from '../types'
import { apiClient } from '../services/api'

export const Browse: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [crimeTypeFilter, setCrimeTypeFilter] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [allCases, setAllCases] = useState<Case[]>([])
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: window.innerWidth, height: 600 })
  
  useEffect(() => {
    loadData()
  }, [])

  // Обновляем размеры контейнера при изменении размера окна
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerDimensions({
          width: rect.width || window.innerWidth,
          height: window.innerHeight - rect.top - 100, // Вычитаем высоту заголовка и навигации
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  useEffect(() => {
    if (activeTab === 'all') {
      loadFilteredCases()
    }
  }, [activeTab, countryFilter, statusFilter, crimeTypeFilter, yearFilter])
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [categoriesResponse, casesResponse] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getCases({ limit: 100 }),
      ])
      
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data)
      }
      
      if (casesResponse.data?.data) {
        setAllCases(casesResponse.data.data)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }
  
  const loadFilteredCases = async () => {
    try {
      setLoading(true)
      
      const response = await apiClient.getCases({
        country: countryFilter || undefined,
        status: statusFilter || undefined,
        crimeType: crimeTypeFilter || undefined,
        limit: 100,
      })
      
      if (response.data?.data) {
        let filtered = response.data.data
        
        // Фильтр по году (на клиенте, так как API может не поддерживать)
        if (yearFilter) {
          filtered = filtered.filter((c) => c.year.toString() === yearFilter)
        }
        
        setAllCases(filtered)
      }
    } catch (err) {
      console.error('Error loading filtered cases:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const tabs = [
    { id: 'categories', label: 'Категории' },
    { id: 'countries', label: 'Страны' },
    { id: 'all', label: 'Все кейсы' },
  ]
  
  const handleCaseClick = (caseItem: Case) => {
    navigate(`/detail/${caseItem.id}`)
  }
  
  const allCountries = useMemo(() => {
    return Array.from(new Set(allCases.map((c) => c.country))).sort()
  }, [allCases])
  
  const allCrimeTypes = useMemo(() => {
    return Array.from(new Set(allCases.flatMap((c) => c.crimeType))).sort()
  }, [allCases])
  
  const allStatuses = ['Solved', 'Unsolved', 'Cold Case']
  const allYears = useMemo(() => {
    return Array.from(new Set(allCases.map((c) => c.year.toString())))
      .sort((a, b) => parseInt(b) - parseInt(a))
  }, [allCases])
  
  const activeFilterCount = [countryFilter, statusFilter, crimeTypeFilter, yearFilter].filter(Boolean).length
  
  const resetFilters = () => {
    setCountryFilter(null)
    setStatusFilter(null)
    setCrimeTypeFilter(null)
    setYearFilter(null)
  }
  
  if (error && loading) {
    return (
      <div className="h-screen pb-20 flex items-center justify-center">
        <EmptyState
          icon="⚠️"
          title="Ошибка загрузки"
          message={error}
        />
      </div>
    )
  }
  
  return (
    <div className="h-screen pb-20 overflow-y-auto">
      <div className="mb-6 px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Каталог</h1>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
      
      {activeTab === 'all' && (
        <FilterPanel
          filters={[
            {
              id: 'country',
              label: 'Страна',
              options: allCountries.map((c) => ({ value: c, label: c })),
              value: countryFilter,
              onChange: setCountryFilter,
            },
            {
              id: 'status',
              label: 'Статус',
              options: allStatuses.map((s) => ({ 
                value: s, 
                label: s === 'Solved' ? 'Раскрыто' : s === 'Unsolved' ? 'Нераскрыто' : 'Холодное дело' 
              })),
              value: statusFilter,
              onChange: setStatusFilter,
            },
            {
              id: 'crimeType',
              label: 'Тип преступления',
              options: allCrimeTypes.map((t) => ({ value: t, label: t })),
              value: crimeTypeFilter,
              onChange: setCrimeTypeFilter,
            },
            {
              id: 'year',
              label: 'Год',
              options: allYears.map((y) => ({ value: y, label: y })),
              value: yearFilter,
              onChange: setYearFilter,
            },
          ]}
          onReset={resetFilters}
          activeCount={activeFilterCount}
        />
      )}
      
      <div className="px-4">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <SkeletonLoader type="title" className="w-32 mb-4" />
                <div className="grid grid-cols-3 gap-3">
                  <SkeletonLoader type="card" count={3} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'categories' && (
              <div className="space-y-8 animate-fade-in">
                {categories.map((category) => (
                  <div key={category.id}>
                    <h2 className="text-xl font-bold text-white mb-4">{category.name}</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {(category.cases || category.movies || []).map((caseItem) => (
                        <CardPoster
                          key={caseItem.id}
                          movie={caseItem}
                          onClick={() => handleCaseClick(caseItem)}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'countries' && (
              <div className="space-y-6 animate-fade-in">
                {allCountries.map((country) => {
                  const countryCases = allCases.filter((c) => c.country === country)
                  return (
                    <div key={country}>
                      <h2 className="text-xl font-bold text-white mb-4">{country}</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {countryCases.map((caseItem) => (
                          <CardPoster
                            key={caseItem.id}
                            movie={caseItem}
                            onClick={() => handleCaseClick(caseItem)}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {activeTab === 'all' && (
              <div ref={containerRef} className="animate-fade-in">
                {allCases.length > 0 ? (
                  <VirtualizedGrid
                    items={allCases}
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
                ) : (
                  <div className="py-20">
                    <EmptyState
                      icon="🔍"
                      title="Ничего не найдено"
                      message="Попробуйте изменить фильтры"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
