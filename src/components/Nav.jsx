import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LogoutButton from './LogoutButton'

export default function Nav() {
  const { isLoggedIn } = useAuth()

  return (
    <nav className="nav">
      <Link className="nav-brand" to="/">
        ClientFlow
      </Link>

      <div className="nav-links">
        <Link to="/">Landing</Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <LogoutButton />
          </>
        )}
      </div>
    </nav>
  )
}
