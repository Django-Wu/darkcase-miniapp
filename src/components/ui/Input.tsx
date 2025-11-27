import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-netflix-lightGray mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-netflix-darkGray text-white rounded-lg border border-netflix-mediumGray focus:outline-none focus:border-netflix-red transition-colors ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-netflix-red">{error}</p>
      )}
    </div>
  )
}

