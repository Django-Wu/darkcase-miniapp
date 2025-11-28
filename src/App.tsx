import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import { useSync } from './hooks/useSync'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BottomNavigation } from './components/ui/BottomNavigation'
import { SyncIndicator } from './components/ui/SyncIndicator'
import { OfflineIndicator } from './components/OfflineIndicator'
import { SkeletonLoader } from './components/ui/SkeletonLoader'
import { PageTransition } from './components/PageTransition'

// Lazy load pages for code splitting
const Onboarding = lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })))
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const Search = lazy(() => import('./pages/Search').then(module => ({ default: module.Search })))
const Browse = lazy(() => import('./pages/Browse').then(module => ({ default: module.Browse })))
const Shorts = lazy(() => import('./pages/Shorts').then(module => ({ default: module.Shorts })))
const Chronicles = lazy(() => import('./pages/Chronicles').then(module => ({ default: module.Chronicles })))
const Detail = lazy(() => import('./pages/Detail').then(module => ({ default: module.Detail })))
const VideoPlayer = lazy(() => import('./pages/VideoPlayer').then(module => ({ default: module.VideoPlayer })))
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })))
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))
const Error = lazy(() => import('./pages/Error').then(module => ({ default: module.Error })))

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="h-screen bg-darkcase-black flex items-center justify-center">
    <SkeletonLoader type="banner" />
  </div>
)

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" replace />
}

const AnimatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PageTransition>{children}</PageTransition>
}

const App: React.FC = () => {
  useTelegramWebApp()
  useSync() // Автоматическая синхронизация данных
  const { initializeFromTelegram } = useAppStore()
  
  // Автоматическая инициализация при загрузке
  useEffect(() => {
    initializeFromTelegram()
  }, [initializeFromTelegram])
  
  return (
    <ErrorBoundary>
      <Router>
        <SyncIndicator />
        <OfflineIndicator />
        <div className="h-screen bg-darkcase-black text-white overflow-hidden">
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route 
              path="/onboarding" 
              element={
                <div className="h-screen bg-darkcase-black text-white overflow-hidden">
                  <Onboarding />
                </div>
              } 
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Home />
                    <BottomNavigation />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Search />
                    <BottomNavigation />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Browse />
                    <BottomNavigation />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chronicles"
              element={
                <ProtectedRoute>
                  <Chronicles />
                  <BottomNavigation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shorts"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Shorts />
                    <BottomNavigation />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/detail/:id"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Detail />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/:id"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <VideoPlayer />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Profile />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AnimatedRoute>
                    <Settings />
                  </AnimatedRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/error" element={<Error />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

