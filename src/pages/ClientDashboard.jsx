import { Link, useLocation } from 'react-router-dom'
import BusinessesList from '../components/BusinessesList'
import LogoutButton from '../components/LogoutButton'
import MyRequestsList from '../components/MyRequestsList'
import PageLayout from '../components/PageLayout'
import { useAuth } from '../context/AuthContext'

export default function ClientDashboard() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const redirectMessage = location.state?.message

  return (
    <PageLayout>
      <main className="page page-wide">
        <h1>Client Dashboard</h1>
        <p className="page-subtitle">
          Welcome, {profile?.full_name || user?.email}. Browse businesses and their services below.
        </p>

        {redirectMessage && <p className="form-message success">{redirectMessage}</p>}

        <section className="info-card">
          <p>
            <strong>Role:</strong> {profile?.role}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
        </section>

        <section className="business-section">
          <h2>Browse businesses</h2>
          <BusinessesList />
        </section>

        <MyRequestsList />

        <div className="button-row">
          <Link className="btn btn-secondary" to="/">
            Back to home
          </Link>
          <LogoutButton />
        </div>
      </main>
    </PageLayout>
  )
}
