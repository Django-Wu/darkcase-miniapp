import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-netflix-lightGray mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-darkcase-darkGray/50 backdrop-blur-sm text-white rounded-lg border border-darkcase-mediumGray/50 focus:outline-none focus:border-darkcase-crimson focus:ring-2 focus:ring-darkcase-crimson/20 transition-all ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-darkcase-crimson">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

