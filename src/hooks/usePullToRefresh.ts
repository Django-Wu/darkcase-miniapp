import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  enabled?: boolean
  threshold?: number
}

export const usePullToRefresh = ({ 
  onRefresh, 
  enabled = true,
  threshold = 80 
}: UsePullToRefreshOptions) => {
  const touchStartY = useRef<number>(0)
  const touchCurrentY = useRef<number>(0)
  const isRefreshing = useRef<boolean>(false)
  const pullDistance = useRef<number>(0)
  const [refreshIndicator, setRefreshIndicator] = useState<{ visible: boolean; progress: number }>({
    visible: false,
    progress: 0,
  })
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Find scrollable container
    const findScrollableContainer = (): HTMLElement | null => {
      const containers = document.querySelectorAll('.overflow-y-auto, .overflow-auto')
      for (const container of containers) {
        if (container.scrollTop === 0) {
          return container as HTMLElement
        }
      }
      return window.scrollY === 0 ? document.body : null
    }

    const handleTouchStart = (e: TouchEvent) => {
      containerRef.current = findScrollableContainer()
      if (containerRef.current && (
        (containerRef.current === document.body && window.scrollY === 0) ||
        (containerRef.current.scrollTop === 0)
      )) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === 0 || isRefreshing.current || !containerRef.current) return

      touchCurrentY.current = e.touches[0].clientY
      pullDistance.current = touchCurrentY.current - touchStartY.current

      if (pullDistance.current > 0) {
        const progress = Math.min(pullDistance.current / threshold, 1)
        setRefreshIndicator({ visible: true, progress })
        
        if (pullDistance.current > threshold * 0.3) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance.current > threshold && !isRefreshing.current) {
        isRefreshing.current = true
        setRefreshIndicator({ visible: true, progress: 1 })
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh error:', error)
        } finally {
          setTimeout(() => {
            setRefreshIndicator({ visible: false, progress: 0 })
            isRefreshing.current = false
          }, 500)
        }
      } else {
        setRefreshIndicator({ visible: false, progress: 0 })
      }

      touchStartY.current = 0
      touchCurrentY.current = 0
      pullDistance.current = 0
      containerRef.current = null
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      setRefreshIndicator({ visible: false, progress: 0 })
    }
  }, [enabled, onRefresh, threshold])

  return { refreshIndicator }
}

