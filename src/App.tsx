import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import { BottomNavigation } from './components/ui/BottomNavigation'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { Search } from './pages/Search'
import { Browse } from './pages/Browse'
import { Detail } from './pages/Detail'
import { VideoPlayer } from './pages/VideoPlayer'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Error } from './pages/Error'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" replace />
}

const App: React.FC = () => {
  useTelegramWebApp()
  
  return (
    <Router>
      <div className="h-screen bg-netflix-black text-white overflow-hidden">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
                <BottomNavigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
                <BottomNavigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <Browse />
                <BottomNavigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detail/:id"
            element={
              <ProtectedRoute>
                <Detail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/:id"
            element={
              <ProtectedRoute>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
                <BottomNavigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/error" element={<Error />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

