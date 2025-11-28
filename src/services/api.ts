/**
 * API Client для DarkCase
 * 
 * Используется для загрузки контента из Backend API
 */

import { Case, Category, Chronicle, ChronicleComment } from '../types'
import { cache } from './cache'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface ApiResponse<T> {
  data: T | null
  error?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Retry механизм с более быстрыми задержками
const retryRequest = async <T>(
  fn: () => Promise<Response>,
  retries = 2, // Уменьшили количество попыток
  delay = 300 // Уменьшили начальную задержку
): Promise<Response> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 1.5) // Меньший множитель
    }
    throw error
  }
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
    useCache = true,
    cacheTTL = 5 * 60 * 1000 // 5 минут по умолчанию
  ): Promise<ApiResponse<T>> {
    // Проверяем кэш
    if (useCache && options.method === 'GET' || !options.method) {
      const cached = cache.get<T>(endpoint)
      if (cached) {
        return { data: cached }
      }
    }

    try {
      // Получаем Telegram initData для авторизации
      const initData = window.Telegram?.WebApp?.initData || ''
      
      const response = await retryRequest(
        () => fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(initData && { 'X-Telegram-Init-Data': initData }),
            ...options.headers,
          },
        }),
        retries
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(errorData.error || `API Error: ${response.statusText}`)
      }

      const data = await response.json()
      // Обрабатываем ответы с оберткой { data: ... }
      const result = data.data !== undefined ? data.data : data
      
      // Сохраняем в кэш
      if (useCache && (options.method === 'GET' || !options.method)) {
        cache.set(endpoint, result, cacheTTL)
      }
      
      return { data: result }
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Публичные методы
  async getFeaturedCase() {
    return this.request<Case>('/api/cases/featured')
  }

  async getCases(params?: {
    page?: number
    limit?: number
    country?: string
    status?: string
    crimeType?: string
    search?: string
  }) {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.country) query.append('country', params.country)
    if (params?.status) query.append('status', params.status)
    if (params?.crimeType) query.append('crimeType', params.crimeType)
    if (params?.search) query.append('search', params.search)

    const queryString = query.toString()
    const response = await this.request<PaginatedResponse<Case>>(`/api/cases${queryString ? `?${queryString}` : ''}`)
    
    // Преобразуем ответ в нужный формат
    if (response.data) {
      return {
        data: {
          data: response.data.data || response.data,
          pagination: response.data.pagination,
        },
        error: response.error,
      }
    }
    return response as ApiResponse<{ data: Case[]; pagination: any }>
  }

  async getCase(id: string) {
    return this.request<Case>(`/api/cases/${id}`)
  }

  async getSimilarCases(id: string) {
    const response = await this.request<Case[] | { data: Case[] }>(`/api/cases/${id}/similar`)
    // Обрабатываем ответ с оберткой { data: ... }
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async getCategories() {
    const response = await this.request<Category[] | { data: Category[] }>('/api/categories')
    // Обрабатываем ответ с оберткой { data: ... }
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async search(query: string, params?: {
    country?: string
    status?: string
    crimeType?: string
    yearFrom?: number
    yearTo?: number
    sortBy?: 'date' | 'rating' | 'popularity'
    sortOrder?: 'asc' | 'desc'
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    searchParams.append('q', query)
    if (params?.country) searchParams.append('country', params.country)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.crimeType) searchParams.append('crimeType', params.crimeType)
    if (params?.yearFrom) searchParams.append('yearFrom', params.yearFrom.toString())
    if (params?.yearTo) searchParams.append('yearTo', params.yearTo.toString())
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const response = await this.request<Case[] | { data: Case[] }>(`/api/search?${searchParams.toString()}`)
    // Обрабатываем ответ с оберткой { data: ... }
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async getSearchSuggestions(query: string) {
    // Получаем предложения на основе популярных запросов и существующих кейсов
    const response = await this.request<Case[] | { data: Case[] }>(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data.map(c => c.title).slice(0, 5), error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data.map((c: Case) => c.title).slice(0, 5) : [], error: response.error }
  }

  // Защищенные методы (требуют авторизацию)
  async getUser() {
    return this.request<{ id: number; username?: string; email?: string }>('/api/users/me')
  }

  async getFavorites() {
    const response = await this.request<Case[] | { data: Case[] }>('/api/users/me/favorites')
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async addToFavorites(caseId: string) {
    return this.request<void>('/api/users/me/favorites', {
      method: 'POST',
      body: JSON.stringify({ caseId }),
    })
  }

  async removeFromFavorites(caseId: string) {
    return this.request<void>(`/api/users/me/favorites/${caseId}`, {
      method: 'DELETE',
    })
  }
  
  async getWatchHistory() {
    const response = await this.request<Array<Case & { progress?: number; last_watched?: string }> | { data: Array<Case & { progress?: number; last_watched?: string }> }>('/api/users/me/history')
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }
  
  async getRecommendations() {
    const response = await this.request<Case[] | { data: Case[] }>('/api/users/me/recommendations')
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }
  
  async updateWatchProgress(caseId: string, progress: number) {
    return this.request<void>('/api/users/me/history', {
      method: 'POST',
      body: JSON.stringify({ caseId, progress }),
    })
  }

  // Chronicles API
  async getChronicles() {
    const response = await this.request<Chronicle[] | { data: Chronicle[] }>('/api/chronicles')
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async getLikedChronicles() {
    const response = await this.request<Chronicle[] | { data: Chronicle[] }>('/api/users/me/chronicles/liked')
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async likeChronicle(chronicleId: string) {
    return this.request<void>('/api/chronicles/' + chronicleId + '/like', {
      method: 'POST',
    })
  }

  async unlikeChronicle(chronicleId: string) {
    return this.request<void>('/api/chronicles/' + chronicleId + '/like', {
      method: 'DELETE',
    })
  }

  async getChronicleComments(chronicleId: string) {
    const response = await this.request<ChronicleComment[] | { data: ChronicleComment[] }>('/api/chronicles/' + chronicleId + '/comments')
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: Array.isArray(data) ? data : [], error: response.error }
  }

  async addChronicleComment(chronicleId: string, text: string) {
    const response = await this.request<ChronicleComment | { data: ChronicleComment }>('/api/chronicles/' + chronicleId + '/comments', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    if (response.data && !Array.isArray(response.data)) {
      return { data: response.data as ChronicleComment, error: response.error }
    }
    const data = (response.data as any)?.data || response.data
    return { data: data as ChronicleComment, error: response.error }
  }
}

// Экспорт singleton
export const apiClient = new ApiClient(API_BASE_URL)
