import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { CasesList } from './pages/cases/List'
import { CaseCreate } from './pages/cases/Create'
import { CaseEdit } from './pages/cases/Edit'
import { CategoriesList } from './pages/categories/List'
import { ChroniclesList } from './pages/chronicles/List'
import { ChronicleCreate } from './pages/chronicles/Create'
import { ChronicleEdit } from './pages/chronicles/Edit'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <Layout>
                <CasesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CaseCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <CaseEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Layout>
                <CategoriesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chronicles"
          element={
            <ProtectedRoute>
              <Layout>
                <ChroniclesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chronicles/create"
          element={
            <ProtectedRoute>
              <Layout>
                <ChronicleCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chronicles/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <ChronicleEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

