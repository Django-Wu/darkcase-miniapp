import React from 'react'

interface ProfileSectionProps {
  title: string
  children: React.ReactNode
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-netflix-lightGray uppercase mb-3 px-4">
        {title}
      </h3>
      <div className="px-4">{children}</div>
    </div>
  )
}

