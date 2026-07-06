/**
 * Shared LLM client for Netlify Functions.
 *
 * Uses the official OpenAI SDK pointed at FAU Trussed.ai (OpenAI-compatible).
 * API keys are read from server-side env vars only — never from the browser.
 *
 * Reference: FAU Trussed.ai guide — base URL without /chat/completions suffix.
 */

import OpenAI from 'openai'

// Reuse one client per function invocation (cold start creates a new instance).
let cachedClient = null

/**
 * Check that all required AI environment variables are set.
 * Returns an array of missing variable names (empty = all good).
 */
export function getMissingEnvVars() {
  const missing = []

  if (!process.env.TRUSSED_API_KEY?.trim()) {
    missing.push('TRUSSED_API_KEY')
  }
  if (!process.env.TRUSSED_BASE_URL?.trim()) {
    missing.push('TRUSSED_BASE_URL')
  }
  if (!process.env.LLM_MODEL?.trim()) {
    missing.push('LLM_MODEL')
  }

  return missing
}

/**
 * Create (or return cached) OpenAI client configured for Trussed.ai.
 */
export function getLlmClient() {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.TRUSSED_API_KEY,
      baseURL: process.env.TRUSSED_BASE_URL,
    })
  }

  return cachedClient
}

/**
 * Turn OpenAI SDK / HTTP errors into safe, user-friendly messages.
 * Never includes API keys or raw server responses that might leak secrets.
 */
export function toUserFriendlyError(error) {
  const status = error?.status ?? error?.response?.status

  if (status === 401 || status === 403) {
    return 'AI authentication failed. Check that TRUSSED_API_KEY is valid.'
  }

  if (status === 404) {
    return 'The requested AI model is not available. Try LLM_MODEL=cogito:14b.'
  }

  if (status === 429) {
    return 'AI rate limit reached. Please wait a moment and try again.'
  }

  if (status === 502 || status === 503) {
    return 'The AI service is temporarily unavailable. Please try again shortly.'
  }

  // Custom errors thrown by callLlm below
  if (error?.code === 'EMPTY_RESPONSE') {
    return 'The AI returned an empty response. Please try again.'
  }

  if (error?.code === 'MISSING_ENV') {
    return 'AI is not configured on the server. Contact the site administrator.'
  }

  if (error?.code === 'INVALID_JSON') {
    return 'The AI returned an invalid response. Please try again.'
  }

  return 'The AI request failed. Please try again later.'
}

/**
 * Call Trussed.ai chat completions with basic retry on transient errors.
 *
 * @param {object} options
 * @param {Array<{role: string, content: string}>} options.messages
 * @param {number} [options.temperature=0.3]
 * @param {number} [options.maxTokens=800]
 * @param {boolean} [options.jsonMode=false] - request JSON object output
 * @returns {Promise<string>} The assistant message content
 */
export async function callLlm({
  messages,
  temperature = 0.3,
  maxTokens = 800,
  jsonMode = false,
}) {
  const missing = getMissingEnvVars()
  if (missing.length > 0) {
    const err = new Error('Missing AI environment variables')
    err.code = 'MISSING_ENV'
    err.missing = missing
    throw err
  }

  const client = getLlmClient()
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.LLM_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      })

      const content = response.choices?.[0]?.message?.content?.trim()

      if (!content) {
        const err = new Error('Empty AI response')
        err.code = 'EMPTY_RESPONSE'
        throw err
      }

      return content
    } catch (error) {
      const status = error?.status ?? error?.response?.status
      const isRetryable = status === 429 || status === 502 || status === 503
      const isLastAttempt = attempt === maxAttempts

      // Retry transient errors with simple exponential backoff
      if (isRetryable && !isLastAttempt) {
        const delayMs = 500 * 2 ** (attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }

      throw error
    }
  }
}
