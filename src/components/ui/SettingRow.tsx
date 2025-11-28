import React from 'react'

interface SettingRowProps {
  title: string
  subtitle?: string
  value?: string
  icon?: string
  onClick?: () => void
  rightElement?: React.ReactNode
}

export const SettingRow: React.FC<SettingRowProps> = ({
  title,
  subtitle,
  value,
  icon,
  onClick,
  rightElement,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-darkcase-darkGray rounded-lg hover:bg-darkcase-mediumGray transition-colors active:scale-95"
    >
      <div className="flex items-center gap-3 flex-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1 text-left">
          <p className="text-white font-medium">{title}</p>
          {(subtitle || value) && <p className="text-netflix-lightGray text-sm mt-1">{subtitle || value}</p>}
        </div>
      </div>
      {rightElement || <span className="text-netflix-lightGray">›</span>}
    </button>
  )
}

