import React from 'react'

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'title' | 'banner'
  count?: number
  className?: string
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`w-32 h-48 rounded-lg bg-darkcase-darkGray animate-pulse ${className}`} />
        )
      case 'text':
        return (
          <div className={`h-4 rounded bg-darkcase-darkGray animate-pulse ${className}`} />
        )
      case 'title':
        return (
          <div className={`h-8 rounded bg-darkcase-darkGray animate-pulse ${className}`} />
        )
      case 'banner':
        return (
          <div className={`w-full h-96 rounded-lg bg-darkcase-darkGray animate-pulse ${className}`} />
        )
      default:
        return null
    }
  }

  if (count > 1) {
    return (
      <div className="flex gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
        ))}
      </div>
    )
  }

  return renderSkeleton()
}

