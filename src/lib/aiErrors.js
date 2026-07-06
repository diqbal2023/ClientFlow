/**
 * Map AI-related errors to user-friendly messages.
 * Raw technical details are logged to the console only.
 */

const MESSAGE_MAP = [
  {
    match: 'missing environment variable',
    message: 'AI is not configured on the server. Contact the site administrator.',
  },
  {
    match: 'ai is not configured',
    message: 'AI is not configured on the server. Contact the site administrator.',
  },
  {
    match: 'authentication failed',
    message: 'AI authentication failed. The server API key may be invalid or expired.',
  },
  {
    match: 'model is not available',
    message: 'The AI model is not available. Try again later or contact support.',
  },
  {
    match: 'rate limit',
    message: 'AI rate limit reached. Please wait a moment and try again.',
  },
  {
    match: 'empty response',
    message: 'The AI returned an empty response. Please try again.',
  },
  {
    match: 'invalid response',
    message: 'The AI service returned an unexpected response. Please try again.',
  },
  {
    match: 'temporarily unavailable',
    message: 'The AI service is temporarily unavailable. Please try again shortly.',
  },
]

/**
 * @param {object} options
 * @param {string} [options.message] - Raw error message from server or client
 * @param {number} [options.status] - HTTP status code
 * @param {'network'|'invalid_response'} [options.type] - Known error type
 */
export function formatAiError({ message = '', status, type } = {}) {
  if (type === 'network') {
    return 'Network error. Check your connection and try again.'
  }

  if (type === 'invalid_response') {
    return 'The AI service returned an unexpected response. Please try again.'
  }

  if (status === 401 || status === 403) {
    return 'AI authentication failed. The server API key may be invalid or expired.'
  }

  if (status === 404) {
    return 'The AI model is not available. Try again later or contact support.'
  }

  if (status === 429) {
    return 'AI rate limit reached. Please wait a moment and try again.'
  }

  if (status === 500) {
    const lower = message.toLowerCase()
    for (const item of MESSAGE_MAP) {
      if (lower.includes(item.match)) {
        return item.message
      }
    }
    return 'The AI service is not available right now. Please try again later.'
  }

  const lower = message.toLowerCase()

  for (const item of MESSAGE_MAP) {
    if (lower.includes(item.match)) {
      return item.message
    }
  }

  if (!message.trim()) {
    return 'Could not complete the AI request. Please try again.'
  }

  // Avoid showing raw stack traces or JSON blobs to users
  if (message.length > 120 || message.includes('{') || message.includes('Error:')) {
    return 'Could not complete the AI request. Please try again.'
  }

  return message
}

/**
 * Log technical AI errors for debugging without exposing secrets in the UI.
 */
export function logAiError(context, error) {
  const safeMessage = error?.message ?? String(error)
  console.error(`[AI] ${context}:`, safeMessage)
}
