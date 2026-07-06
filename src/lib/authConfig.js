/**
 * Auth redirect helpers for local dev and Netlify production.
 * Supabase dashboard → Authentication → URL Configuration must allow:
 * - http://localhost:5173/auth/callback
 * - https://clientflow-diqbal2023.netlify.app/auth/callback
 */
export function getSiteUrl() {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

export function getAuthRedirectUrl(path = '/auth/callback') {
  const base = getSiteUrl()
  const route = path.startsWith('/') ? path : `/${path}`
  return `${base}${route}`
}

function getAuthSearchParams() {
  return new URLSearchParams(window.location.search)
}

function getAuthHashParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

export function hasAuthCallbackParams() {
  if (typeof window === 'undefined') {
    return false
  }

  const search = getAuthSearchParams()
  const hash = getAuthHashParams()

  return Boolean(
    search.get('code') ||
      search.get('token_hash') ||
      search.get('type') ||
      search.get('error') ||
      search.get('error_description') ||
      hash.get('access_token') ||
      hash.get('error') ||
      hash.get('error_description'),
  )
}

function getAuthCallbackError(search, hash) {
  return (
    search.get('error_description') ||
    search.get('error') ||
    hash.get('error_description') ||
    hash.get('error')
  )
}

function cleanAuthParamsFromUrl() {
  window.history.replaceState({}, document.title, window.location.pathname)
}

export async function completeAuthFromUrl(supabase) {
  if (!hasAuthCallbackParams()) {
    return { handled: false }
  }

  const search = getAuthSearchParams()
  const hash = getAuthHashParams()
  const authError = getAuthCallbackError(search, hash)

  if (authError) {
    throw new Error(authError)
  }

  const tokenHash = search.get('token_hash')
  const otpType = search.get('type')

  if (tokenHash && otpType) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    })

    if (verifyError) {
      throw verifyError
    }

    cleanAuthParamsFromUrl()
    return { handled: true }
  }

  const code = search.get('code')

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      throw new Error(
        'This confirmation link could not be opened in this browser. ' +
          'Your email may already be confirmed — try logging in instead.',
      )
    }

    cleanAuthParamsFromUrl()
    return { handled: true }
  }

  if (hash.get('access_token')) {
    const { error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw sessionError
    }

    cleanAuthParamsFromUrl()
    return { handled: true }
  }

  return { handled: false }
}
