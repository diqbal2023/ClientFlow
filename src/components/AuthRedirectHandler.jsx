import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { hasAuthCallbackParams } from '../lib/authConfig'

export default function AuthRedirectHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/auth/callback') {
      return
    }

    if (hasAuthCallbackParams()) {
      navigate(`/auth/callback${location.search}${location.hash}`, { replace: true })
    }
  }, [location.pathname, location.search, location.hash, navigate])

  return null
}
