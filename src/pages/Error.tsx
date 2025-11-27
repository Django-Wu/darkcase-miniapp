import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

interface ErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  onRetry,
}) => {
  const navigate = useNavigate()
  
  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-netflix-lightGray mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry}>Try Again</Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

