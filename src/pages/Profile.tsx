import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ProfileSection } from '../components/ui/ProfileSection'
import { SettingRow } from '../components/ui/SettingRow'
import { Button } from '../components/ui/Button'

export const Profile: React.FC = () => {
  const { currentUser, setAuthenticated, setUser } = useAppStore()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    setAuthenticated(false)
    setUser(null)
    navigate('/onboarding')
  }
  
  return (
    <div className="h-screen pb-20 px-4 overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-netflix-red flex items-center justify-center text-3xl text-white">
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{currentUser?.name || 'User'}</h1>
            <p className="text-netflix-lightGray">{currentUser?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/settings')}
        >
          Edit Profile
        </Button>
      </div>
      
      <ProfileSection title="My List">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-full aspect-[2/3] bg-netflix-darkGray rounded-lg flex items-center justify-center text-netflix-lightGray"
            >
              📽
            </div>
          ))}
        </div>
      </ProfileSection>
      
      <ProfileSection title="Account">
        <div className="space-y-2">
          <SettingRow
            title="My Downloads"
            subtitle="Manage your offline content"
            icon="⬇"
            onClick={() => {}}
          />
          <SettingRow
            title="Watch History"
            subtitle="View your viewing history"
            icon="🕐"
            onClick={() => {}}
          />
          <SettingRow
            title="Notifications"
            subtitle="Manage notification settings"
            icon="🔔"
            onClick={() => navigate('/settings')}
          />
        </div>
      </ProfileSection>
      
      <ProfileSection title="Settings">
        <div className="space-y-2">
          <SettingRow
            title="App Settings"
            icon="⚙"
            onClick={() => navigate('/settings')}
          />
          <SettingRow
            title="Help & Support"
            icon="❓"
            onClick={() => {}}
          />
          <SettingRow
            title="About"
            subtitle="Version 1.0.0"
            icon="ℹ"
            onClick={() => {}}
          />
        </div>
      </ProfileSection>
      
      <div className="mt-8">
        <Button variant="outline" fullWidth onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}

