import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/search', icon: '🔍', label: 'Search' },
  { path: '/browse', icon: '📂', label: 'Browse' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-netflix-darkGray border-t border-netflix-mediumGray z-40 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-netflix-red' : 'text-netflix-lightGray'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

