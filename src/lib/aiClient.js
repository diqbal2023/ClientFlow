/**
 * Frontend AI client for ClientFlow.
 *
 * All AI calls go through the Netlify Function proxy — never directly to Trussed.
 * The API key is NOT in the browser; it lives server-side only.
 */

import { formatAiError, logAiError } from './aiErrors.js'

const AI_ENDPOINT = '/.netlify/functions/ai'

/**
 * Send an AI action request to the Netlify Function.
 */
async function callAi(action, payload = {}) {
  let response

  try {
    response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
  } catch (error) {
    logAiError(action, error)
    throw new Error(formatAiError({ type: 'network' }), { cause: error })
  }

  let data
  try {
    data = await response.json()
  } catch (error) {
    logAiError(`${action} invalid JSON response`, error)
    throw new Error(formatAiError({ type: 'invalid_response', status: response.status }), {
      cause: error,
    })
  }

  if (!response.ok || !data.success) {
    logAiError(`${action} request failed`, new Error(data.error || `HTTP ${response.status}`))
    throw new Error(
      formatAiError({
        message: data.error,
        status: response.status,
      }),
    )
  }

  if (!data.result) {
    logAiError(`${action} missing result`, new Error('Empty result payload'))
    throw new Error(formatAiError({ type: 'invalid_response', status: response.status }))
  }

  return data
}

export async function generateBusinessDescription(payload) {
  const data = await callAi('businessDescription', payload)

  return {
    ...data.result,
    fallbackUsed: data.fallbackUsed ?? false,
    message: data.message,
  }
}

export async function generateServiceDescription(payload) {
  const data = await callAi('serviceDescription', payload)

  return {
    ...data.result,
    fallbackUsed: data.fallbackUsed ?? false,
    message: data.message,
  }
}

export async function generateRebookingRecommendation(payload) {
  const data = await callAi('rebookingRecommendation', payload)

  return {
    ...data.result,
    fallbackUsed: data.fallbackUsed ?? false,
    message: data.message,
  }
}

export async function summarizeBookingRequest(payload) {
  const data = await callAi('bookingRequestSummary', payload)

  return {
    ...data.result,
    fallbackUsed: data.fallbackUsed ?? false,
    message: data.message,
  }
}
