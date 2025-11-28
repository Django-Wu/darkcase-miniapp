import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }
  
  const content = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-4 border-darkcase-darkGray border-t-darkcase-crimson rounded-full animate-spin shadow-blood`}
      />
    </div>
  )
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-darkcase-black z-50">
        {content}
      </div>
    )
  }
  
  return content
}

