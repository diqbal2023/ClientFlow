import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormAlert from '../components/FormAlert'
import { getFriendlyError, validateLoginForm } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const validation = validateLoginForm({ email, password })

    if (validation) {
      setValidationError(validation)
      return
    }

    setValidationError('')
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(getFriendlyError(signInError, 'Could not log in. Please try again.'))
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <main className="page">
      <h1>Log in</h1>
      <p className="page-subtitle">Welcome back to ClientFlow.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email *
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
        </label>

        <label>
          Password *
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            minLength={6}
            disabled={loading}
          />
        </label>

        <FormAlert type="error" message={validationError} />
        <FormAlert type="error" message={error} />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="form-footer">
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  )
}
