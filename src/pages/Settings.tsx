import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileSection } from '../components/ui/ProfileSection'
import { SettingRow } from '../components/ui/SettingRow'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser, setUser } = useAppStore()
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  
  const handleSave = () => {
    setUser({ name, email })
    navigate('/profile')
  }
  
  return (
    <div className="pb-20 px-4">
      <div className="pt-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </div>
      
      <ProfileSection title="Profile">
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSave} fullWidth>
            Save Changes
          </Button>
        </div>
      </ProfileSection>
      
      <ProfileSection title="Playback">
        <div className="space-y-2">
          <SettingRow
            title="Video Quality"
            subtitle="Auto"
            icon="📺"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Auto</span>}
          />
          <SettingRow
            title="Download Quality"
            subtitle="Standard"
            icon="⬇"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Standard</span>}
          />
        </div>
      </ProfileSection>
      
      <ProfileSection title="Appearance">
        <div className="space-y-2">
          <SettingRow
            title="Theme"
            subtitle="Dark"
            icon="🌙"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Dark</span>}
          />
          <SettingRow
            title="Language"
            subtitle="English"
            icon="🌐"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">English</span>}
          />
        </div>
      </ProfileSection>
      
      <ProfileSection title="Privacy">
        <div className="space-y-2">
          <SettingRow
            title="Watch History"
            subtitle="Enabled"
            icon="🕐"
            onClick={() => {}}
            rightElement={
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded bg-netflix-darkGray border-netflix-mediumGray"
              />
            }
          />
          <SettingRow
            title="Data Usage"
            subtitle="Manage your data"
            icon="📊"
            onClick={() => {}}
          />
        </div>
      </ProfileSection>
    </div>
  )
}

