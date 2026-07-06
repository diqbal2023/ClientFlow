import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { isLoggedIn } = useAuth()

  return (
    <main className="page">
      <h1>ClientFlow</h1>
      <p className="page-subtitle">
        A client portal builder for small businesses. Admins manage services and requests.
        Clients browse businesses and track their requests.
      </p>

      <div className="button-row">
        {isLoggedIn ? (
          <Link className="btn btn-primary" to="/dashboard">
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link className="btn btn-primary" to="/signup">
              Create account
            </Link>
            <Link className="btn btn-secondary" to="/login">
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
