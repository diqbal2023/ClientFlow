import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRole = null }) {
  const { isLoggedIn, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="page">
        <p>Loading session...</p>
      </main>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!profile) {
    return (
      <main className="page">
        <h1>Profile not found</h1>
        <p className="form-message error">
          We could not load your profile from Supabase. Make sure Row Level Security
          allows users to read their own profile row (auth.uid() = id).
        </p>
      </main>
    )
  }

  if (allowedRole && profile.role !== allowedRole) {
    const redirectTo = profile.role === 'admin' ? '/admin' : '/client'

    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          message: `This page is for ${allowedRole} users. You were redirected to your dashboard.`,
        }}
      />
    )
  }

  return children
}
