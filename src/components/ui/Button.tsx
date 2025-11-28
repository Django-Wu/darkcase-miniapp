import React from 'react'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  haptic?: boolean
  hapticType?: 'impact' | 'notification' | 'selection'
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  haptic = true,
  hapticType = 'impact',
  hapticStyle = 'medium',
  className = '',
  children,
  onClick,
  ...props
}) => {
  const { impact, notification, selection } = useHapticFeedback()
  
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 active:scale-95 relative overflow-hidden'
  
  const variants = {
    primary: 'btn-primary text-white',
    secondary: 'bg-darkcase-darkGray text-white hover:bg-darkcase-mediumGray border border-darkcase-mediumGray hover:border-darkcase-crimson/30',
    outline: 'border-2 border-darkcase-crimson/50 text-white hover:bg-darkcase-crimson/10 hover:border-darkcase-crimson',
    ghost: 'text-white hover:bg-darkcase-darkGray/50',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic) {
      switch (hapticType) {
        case 'impact':
          impact(hapticStyle)
          break
        case 'notification':
          notification(hapticStyle === 'light' ? 'light' : hapticStyle === 'medium' ? 'medium' : 'heavy')
          break
        case 'selection':
          selection()
          break
      }
    }
    onClick?.(e)
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

