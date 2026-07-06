import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormAlert from '../components/FormAlert'
import { completeAuthFromUrl } from '../lib/authConfig'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function handleCallback() {
      try {
        const { handled } = await completeAuthFromUrl(supabase)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!handled && !session) {
          if (isMounted) {
            setError(
              'No sign-in session was found. If you already confirmed your email, try logging in.',
            )
          }
          return
        }

        if (isMounted) {
          navigate('/dashboard', { replace: true })
        }
      } catch (callbackError) {
        if (isMounted) {
          setError(getFriendlyError(callbackError, 'Could not complete sign in. Please try again.'))
        }
      }
    }

    handleCallback()

    return () => {
      isMounted = false
    }
  }, [navigate])

  return (
    <main className="page">
      <h1>Signing you in</h1>
      {error ? (
        <>
          <FormAlert type="error" message={error} />
          <p className="form-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </>
      ) : (
        <p className="page-subtitle">Completing authentication...</p>
      )}
    </main>
  )
}
