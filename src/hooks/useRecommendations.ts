import { useMemo, useState, useEffect } from 'react'
import { Case } from '../types'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../services/api'

/**
 * Хук для получения рекомендаций на основе истории просмотра
 * Использует API если доступен, иначе вычисляет локально
 */
export const useRecommendations = (allCases: Case[], limit: number = 10): Case[] => {
  const { watchHistory } = useAppStore()
  const [apiRecommendations, setApiRecommendations] = useState<Case[] | null>(null)
  
  // Пытаемся загрузить рекомендации с API
  useEffect(() => {
    const loadApiRecommendations = async () => {
      try {
        const response = await apiClient.getRecommendations()
        if (response.data && response.data.length > 0) {
          setApiRecommendations(response.data)
        }
      } catch (err) {
        // Игнорируем ошибки, используем локальные рекомендации
        console.warn('Не удалось загрузить рекомендации с API, используем локальные:', err)
      }
    }
    
    // Загружаем только если есть история просмотра
    if (Object.keys(watchHistory).length > 0) {
      loadApiRecommendations()
    }
  }, [watchHistory])
  
  return useMemo(() => {
    try {
      // Если есть рекомендации с API, используем их
      if (apiRecommendations && apiRecommendations.length > 0) {
        return apiRecommendations.slice(0, limit)
      }
      
      if (allCases.length === 0) return []
      
      // Получаем просмотренные кейсы
      const watchedCaseIds = Object.keys(watchHistory)
      if (watchedCaseIds.length === 0) {
        // Если нет истории, возвращаем популярные кейсы (по рейтингу)
        return allCases
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit)
      }
      
      // Получаем просмотренные кейсы
      const watchedCases = allCases.filter(c => watchedCaseIds.includes(c.id))
      
      // Анализируем предпочтения пользователя
      const preferences = {
        countries: new Map<string, number>(),
        crimeTypes: new Map<string, number>(),
        tags: new Map<string, number>(),
        years: new Map<number, number>(),
        statuses: new Map<string, number>(),
      }
      
      // Подсчитываем веса на основе просмотров
      watchedCases.forEach((caseItem, index) => {
        const weight = watchedCaseIds.length - index // Более свежие просмотры имеют больший вес
        const progress = watchHistory[caseItem.id]?.progress || 0
        const progressWeight = progress > 50 ? 1.5 : progress > 20 ? 1.2 : 1.0 // Полностью просмотренные кейсы важнее
        
        // Страны
        if (caseItem.country) {
          const current = preferences.countries.get(caseItem.country) || 0
          preferences.countries.set(caseItem.country, current + weight * progressWeight)
        }
        
        // Типы преступлений
        caseItem.crimeType.forEach(type => {
          const current = preferences.crimeTypes.get(type) || 0
          preferences.crimeTypes.set(type, current + weight * progressWeight)
        })
        
        // Теги
        caseItem.tags.forEach(tag => {
          const current = preferences.tags.get(tag) || 0
          preferences.tags.set(tag, current + weight * progressWeight)
        })
        
        // Годы (с учетом близости)
        const current = preferences.years.get(caseItem.year) || 0
        preferences.years.set(caseItem.year, current + weight * progressWeight)
        
        // Статусы
        const statusCurrent = preferences.statuses.get(caseItem.status) || 0
        preferences.statuses.set(caseItem.status, statusCurrent + weight * progressWeight)
      })
      
      // Вычисляем релевантность для каждого непросмотренного кейса
      const recommendations = allCases
        .filter(c => !watchedCaseIds.includes(c.id)) // Исключаем уже просмотренные
        .map(caseItem => {
          let score = 0
          
          // Страна (вес: 2)
          if (caseItem.country && preferences.countries.has(caseItem.country)) {
            score += (preferences.countries.get(caseItem.country) || 0) * 2
          }
          
          // Типы преступлений (вес: 3)
          caseItem.crimeType.forEach(type => {
            if (preferences.crimeTypes.has(type)) {
              score += (preferences.crimeTypes.get(type) || 0) * 3
            }
          })
          
          // Теги (вес: 1.5)
          caseItem.tags.forEach(tag => {
            if (preferences.tags.has(tag)) {
              score += (preferences.tags.get(tag) || 0) * 1.5
            }
          })
          
          // Год (вес: 1, с учетом близости)
          const yearScore = Array.from(preferences.years.entries())
            .reduce((sum, [year, weight]) => {
              const yearDiff = Math.abs(caseItem.year - year)
              const proximity = yearDiff <= 5 ? 1 : yearDiff <= 10 ? 0.5 : 0.2
              return sum + weight * proximity
            }, 0)
          score += yearScore
          
          // Статус (вес: 1)
          if (preferences.statuses.has(caseItem.status)) {
            score += (preferences.statuses.get(caseItem.status) || 0) * 1
          }
          
          // Бонус за высокий рейтинг
          score += caseItem.rating * 0.5
          
          return { caseItem, score }
        })
        .sort((a, b) => b.score - a.score) // Сортируем по релевантности
        .slice(0, limit)
        .map(item => item.caseItem)
      
      // Если рекомендаций мало, добавляем популярные кейсы
      if (recommendations.length < limit) {
        const popular = allCases
          .filter(c => !watchedCaseIds.includes(c.id) && !recommendations.some(r => r.id === c.id))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit - recommendations.length)
        recommendations.push(...popular)
      }
      
      return recommendations
    } catch (error) {
      console.error('Error calculating recommendations:', error)
      // Возвращаем популярные кейсы в случае ошибки
      return allCases
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit)
    }
  }, [allCases, watchHistory, limit, apiRecommendations])
}
