// True Crime Case interface
export interface Case {
  id: string
  title: string
  description: string
  poster: string
  backdrop: string
  rating: number
  year: number
  duration: string
  country: string
  crimeType: string[] // e.g., ['Serial Killer', 'Unsolved', 'Disappearance']
  tags: string[] // e.g., ['USA', '1990s', 'Famous']
  timeline?: TimelineEvent[]
  facts?: string[]
  status: 'Solved' | 'Unsolved' | 'Cold Case'
  victims?: number
  videoUrl?: string
  // Legacy support - will be removed later
  genres?: string[]
  cast?: string[]
  director?: string
}

export interface TimelineEvent {
  date: string
  event: string
}

export interface Category {
  id: string
  name: string
  cases: Case[]
  // Legacy support
  movies?: Case[]
}

export interface CarouselItem {
  id: string
  title: string
  items: Case[]
}

// Legacy alias for backward compatibility during migration
export type Movie = Case

// Chronicle (Хроника) - короткие видео формата 9:16
export interface Chronicle {
  id: string
  videoUrl: string
  title: string
  description: string
  likes: number
  comments: number
  createdAt: string
  caseId?: string // связь с кейсом если есть
  tags?: string[]
  thumbnail?: string
  duration?: number // в секундах
}

// Комментарий к хронике
export interface ChronicleComment {
  id: string
  chronicleId: string
  userId: number
  userName: string
  userAvatar?: string
  text: string
  createdAt: string
  likes?: number
}

