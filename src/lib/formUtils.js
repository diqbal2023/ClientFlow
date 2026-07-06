const AUTH_ERROR_MAP = [
  { match: 'invalid login credentials', message: 'Incorrect email or password. Please try again.' },
  { match: 'user already registered', message: 'An account with this email already exists. Try logging in.' },
  { match: 'email not confirmed', message: 'Please confirm your email before logging in.' },
  { match: 'password should be at least', message: 'Password must be at least 6 characters.' },
]

const DATABASE_ERROR_MAP = [
  { match: 'row-level security', message: 'You do not have permission for this action.' },
  { match: 'duplicate key', message: 'This record already exists.' },
  { match: 'violates foreign key', message: 'This action could not be completed because related data is missing.' },
]

export function getFriendlyError(error, fallback = 'Something went wrong. Please try again.') {
  const message = typeof error === 'string' ? error : error?.message

  if (!message) {
    return fallback
  }

  const lower = message.toLowerCase()

  for (const item of [...AUTH_ERROR_MAP, ...DATABASE_ERROR_MAP]) {
    if (lower.includes(item.match)) {
      return item.message
    }
  }

  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }

  return message
}

export function validateSignupForm({ fullName, email, password, role }) {
  if (!fullName.trim()) {
    return 'Full name is required.'
  }

  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!password) {
    return 'Password is required.'
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  if (role !== 'admin' && role !== 'client') {
    return 'Please choose a valid account role.'
  }

  return ''
}

export function validateLoginForm({ email, password }) {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!password) {
    return 'Password is required.'
  }

  return ''
}
