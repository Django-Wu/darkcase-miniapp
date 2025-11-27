import React from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-white mb-2 text-center">{title}</h2>
      <p className="text-netflix-lightGray text-center mb-6 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-netflix-red text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

