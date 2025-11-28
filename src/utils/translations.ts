/**
 * Утилиты для перевода текстов
 * Позже будет заменено на полноценную систему i18n
 */

export const translateStatus = (status: 'Solved' | 'Unsolved' | 'Cold Case'): string => {
  const translations: Record<string, string> = {
    'Solved': 'Раскрыто',
    'Unsolved': 'Нераскрыто',
    'Cold Case': 'Холодное дело',
  }
  return translations[status] || status
}

export const translateCountry = (country: string): string => {
  const translations: Record<string, string> = {
    'USA': 'США',
    'Russia': 'Россия',
    'Germany': 'Германия',
    'Portugal': 'Португалия',
  }
  return translations[country] || country
}

