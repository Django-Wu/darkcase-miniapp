import React, { useRef } from 'react'

interface HorizontalScrollerProps {
  children: React.ReactNode
  className?: string
}

export const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  children,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  return (
    <div
      ref={scrollRef}
      className={`flex gap-4 overflow-x-auto scrollbar-hide ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  )
}

