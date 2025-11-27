export interface Movie {
  id: string
  title: string
  description: string
  poster: string
  backdrop: string
  rating: number
  year: number
  duration: string
  genres: string[]
  cast?: string[]
  director?: string
}

export interface Category {
  id: string
  name: string
  movies: Movie[]
}

export interface CarouselItem {
  id: string
  title: string
  items: Movie[]
}

