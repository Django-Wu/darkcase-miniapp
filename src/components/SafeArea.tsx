import React from 'react'

interface SafeAreaProps {
  children: React.ReactNode
  className?: string
}

/**
 * Компонент SafeArea для добавления безопасных отступов
 * Учитывает safe-area-inset-top для мобильных устройств
 */
export const SafeArea: React.FC<SafeAreaProps> = ({ children, className = '' }) => {
  return (
    <div className={`safe-area-container ${className}`}>
      {children}
    </div>
  )
}

