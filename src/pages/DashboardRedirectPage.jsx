import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardRedirectPage() {
  const { loading, profile } = useAuth()

  if (loading) {
    return (
      <main className="page">
        <p>Loading session...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="page">
        <h1>Profile not found</h1>
        <p className="form-message error">
          We could not load your profile role. Check Supabase RLS for the profiles table.
        </p>
      </main>
    )
  }

  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (profile.role === 'client') {
    return <Navigate to="/client" replace />
  }

  return (
    <main className="page">
      <h1>Unknown role</h1>
      <p className="form-message error">
        Your profile role is not recognized. Expected admin or client.
      </p>
    </main>
  )
}
