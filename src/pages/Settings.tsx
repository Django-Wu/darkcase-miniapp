import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileSection } from '../components/ui/ProfileSection'
import { SettingRow } from '../components/ui/SettingRow'
import { useAppStore } from '../store/useAppStore'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useAppStore()
  
  const displayName = currentUser
    ? `${currentUser.firstName}${currentUser.lastName ? ` ${currentUser.lastName}` : ''}`
    : 'Пользователь'
  
  return (
    <div className="h-screen pb-20 px-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-white">Настройки</h1>
        </div>
      </div>
      
      <ProfileSection title="Аккаунт">
        <div className="space-y-2">
          <SettingRow
            title="Имя"
            subtitle={displayName}
            icon="👤"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray text-sm">{displayName}</span>}
          />
          <SettingRow
            title="Имя пользователя"
            subtitle={currentUser?.username ? `@${currentUser.username}` : 'Не установлено'}
            icon="📝"
            onClick={() => {}}
            rightElement={
              <span className="text-netflix-lightGray text-sm">
                {currentUser?.username ? `@${currentUser.username}` : '—'}
              </span>
            }
          />
          <SettingRow
            title="Telegram ID"
            subtitle={`${currentUser?.id || 'N/A'}`}
            icon="🆔"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray text-sm">{currentUser?.id || '—'}</span>}
          />
          {currentUser?.isPremium && (
            <SettingRow
              title="Премиум статус"
              subtitle="Активен"
              icon="⭐"
              onClick={() => {}}
              rightElement={<span className="text-yellow-500 text-sm font-semibold">Активен</span>}
            />
          )}
        </div>
      </ProfileSection>
      
      <ProfileSection title="Воспроизведение">
        <div className="space-y-2">
          <SettingRow
            title="Качество видео"
            subtitle="Авто"
            icon="📺"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Авто</span>}
          />
          <SettingRow
            title="Качество загрузки"
            subtitle="Стандарт"
            icon="⬇"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Стандарт</span>}
          />
        </div>
      </ProfileSection>
      
      <ProfileSection title="Внешний вид">
        <div className="space-y-2">
          <SettingRow
            title="Тема"
            subtitle="Тёмная"
            icon="🌙"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Тёмная</span>}
          />
          <SettingRow
            title="Язык"
            subtitle="Русский"
            icon="🌐"
            onClick={() => {}}
            rightElement={<span className="text-netflix-lightGray">Русский</span>}
          />
        </div>
      </ProfileSection>
      
      <ProfileSection title="Конфиденциальность">
        <div className="space-y-2">
          <SettingRow
            title="История просмотров"
            subtitle="Включена"
            icon="🕐"
            onClick={() => {}}
            rightElement={
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded bg-darkcase-darkGray border-darkcase-mediumGray"
              />
            }
          />
          <SettingRow
            title="Использование данных"
            subtitle="Управление данными"
            icon="📊"
            onClick={() => {}}
          />
        </div>
      </ProfileSection>
    </div>
  )
}

