import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormAlert from '../components/FormAlert'
import { getAuthRedirectUrl } from '../lib/authConfig'
import { getFriendlyError, validateSignupForm } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const validation = validateSignupForm({ fullName, email, password, role })

    if (validation) {
      setValidationError(validation)
      return
    }

    setValidationError('')
    setLoading(true)
    setMessage('')
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    })

    if (signUpError) {
      setLoading(false)
      setError(getFriendlyError(signUpError, 'Could not create your account. Please try again.'))
      return
    }

    if (!data.user) {
      setLoading(false)
      setError('Signup did not return a user. Please try again.')
      return
    }

    if (data.session) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName.trim(),
          role,
        })

        if (profileError) {
          setLoading(false)
          setError(
            getFriendlyError(
              profileError,
              'Account created, but your profile could not be saved. Try logging in.',
            ),
          )
          return
        }
      }

      setLoading(false)
      setMessage('Account created successfully. Redirecting to your dashboard...')
      navigate('/dashboard')
      return
    }

    setLoading(false)
    setMessage(
      'Account created! Check your email and click the confirmation link. ' +
        'Your profile is saved in the background — after confirming, log in and go to your dashboard.',
    )
  }

  return (
    <main className="page">
      <h1>Sign up</h1>
      <p className="page-subtitle">Create your ClientFlow account.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full name *
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            autoComplete="name"
            disabled={loading}
          />
        </label>

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
            autoComplete="new-password"
            minLength={6}
            disabled={loading}
          />
        </label>

        <fieldset className="role-fieldset" disabled={loading}>
          <legend>Account role *</legend>
          <label className="radio-label">
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === 'client'}
              onChange={(event) => setRole(event.target.value)}
            />
            Client
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === 'admin'}
              onChange={(event) => setRole(event.target.value)}
            />
            Admin (business owner)
          </label>
        </fieldset>

        <FormAlert type="error" message={validationError} />
        <FormAlert type="error" message={error} />
        <FormAlert type="success" message={message} />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="form-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  )
}
