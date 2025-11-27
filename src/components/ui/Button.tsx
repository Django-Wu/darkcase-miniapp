import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded transition-all duration-200 active:scale-95'
  
  const variants = {
    primary: 'bg-netflix-red text-white hover:bg-red-600',
    secondary: 'bg-netflix-darkGray text-white hover:bg-netflix-mediumGray',
    outline: 'border-2 border-netflix-lightGray text-white hover:bg-netflix-darkGray',
    ghost: 'text-white hover:bg-netflix-darkGray',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

