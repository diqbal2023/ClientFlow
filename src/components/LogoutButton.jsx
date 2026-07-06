import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function LogoutButton() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    setLoading(true)
    setError('')

    const { error: signOutError } = await supabase.auth.signOut()

    setLoading(false)

    if (signOutError) {
      setError(signOutError.message)
      return
    }

    navigate('/login')
  }

  return (
    <div className="logout-wrap">
      <button type="button" className="btn btn-secondary" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Log out'}
      </button>
      {error && <p className="form-message error">{error}</p>}
    </div>
  )
}
