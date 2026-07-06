import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthRedirectHandler from './components/AuthRedirectHandler'
import PageLayout from './components/PageLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AdminDashboard from './pages/AdminDashboard'
import BusinessDetailsPage from './pages/BusinessDetailsPage'
import ClientDashboard from './pages/ClientDashboard'
import DashboardRedirectPage from './pages/DashboardRedirectPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthRedirectHandler />
        <Routes>
          <Route
            path="/"
            element={
              <PageLayout>
                <LandingPage />
              </PageLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PageLayout>
                <LoginPage />
              </PageLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <PageLayout>
                <SignupPage />
              </PageLayout>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <PageLayout>
                <AuthCallbackPage />
              </PageLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/business/:businessId"
            element={
              <ProtectedRoute allowedRole="client">
                <BusinessDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
