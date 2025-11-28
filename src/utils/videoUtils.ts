/**
 * Утилиты для работы с видео
 */

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'direct'
  id?: string
  url: string
}

/**
 * Определяет тип видео по URL
 */
export const parseVideoUrl = (url: string): VideoInfo => {
  if (!url) {
    return { type: 'direct', url }
  }

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return {
      type: 'youtube',
      id: youtubeMatch[1],
      url: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    }
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      id: vimeoMatch[1],
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    }
  }

  // Прямая ссылка на видео
  return { type: 'direct', url }
}

/**
 * Генерирует thumbnail для YouTube
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' = 'high'): string => {
  const qualities = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality]}.jpg`
}

/**
 * Генерирует thumbnail для Vimeo (требует API запрос)
 */
export const getVimeoThumbnail = async (videoId: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
    const data = await response.json()
    return data[0]?.thumbnail_large || null
  } catch {
    return null
  }
}

