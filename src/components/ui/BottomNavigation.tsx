import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home as HomeIcon, Search, Grid3x3, Video } from 'lucide-react'

interface NavItem {
  path: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: HomeIcon, label: 'Домой' },
  { path: '/search', icon: Search, label: 'Поиск' },
  { path: '/shorts', icon: Video, label: 'Лента' },
  { path: '/browse', icon: Grid3x3, label: 'Каталог' },
]

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Отступ от контента */}
      <div className="px-4 pb-2">
        <div 
          className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10"
        >
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || 
                               (item.path === '/' && location.pathname === '/')
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200"
                >
                  <Icon 
                    size={22} 
                    className={`transition-all duration-200 ${
                      isActive 
                        ? 'text-darkcase-crimson' 
                        : 'text-white'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[10px] font-medium mt-1 transition-all duration-200 ${
                    isActive 
                      ? 'text-darkcase-crimson' 
                      : 'text-white'
                  }`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
