/**
 * Netlify Function: secure AI proxy for ClientFlow.
 *
 * The browser calls /.netlify/functions/ai — never Trussed directly.
 * TRUSSED_API_KEY stays server-side in .env (local) or Netlify env vars (deploy).
 */

import { getMissingEnvVars } from './_shared/llmClient.js'
import { handleBusinessDescription } from './_shared/businessDescriptionHandler.js'
import { handleServiceDescription } from './_shared/serviceDescriptionHandler.js'
import { handleRebookingRecommendation } from './_shared/rebookingRecommendationHandler.js'
import { handleBookingRequestSummary } from './_shared/bookingRequestSummaryHandler.js'

// Allowed action names from the frontend aiClient.js
const VALID_ACTIONS = new Set([
  'businessDescription',
  'serviceDescription',
  'rebookingRecommendation',
  'bookingRequestSummary',
])

const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  }
}

/**
 * Main Netlify Function handler.
 */
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      success: false,
      error: 'Method not allowed. Use POST.',
    })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, {
      success: false,
      error: 'Invalid JSON in request body.',
    })
  }

  const { action, payload } = body

  if (!action || !VALID_ACTIONS.has(action)) {
    return jsonResponse(400, {
      success: false,
      error: `Invalid action. Must be one of: ${[...VALID_ACTIONS].join(', ')}.`,
    })
  }

  const missing = getMissingEnvVars()
  if (missing.length > 0) {
    return jsonResponse(500, {
      success: false,
      error: 'AI is not configured on the server. Contact the site administrator.',
    })
  }

  if (action === 'businessDescription') {
    const { statusCode, body: responseBody } = await handleBusinessDescription(payload ?? {})
    return jsonResponse(statusCode, responseBody)
  }

  if (action === 'serviceDescription') {
    const { statusCode, body: responseBody } = await handleServiceDescription(payload ?? {})
    return jsonResponse(statusCode, responseBody)
  }

  if (action === 'rebookingRecommendation') {
    const { statusCode, body: responseBody } = await handleRebookingRecommendation(payload ?? {})
    return jsonResponse(statusCode, responseBody)
  }

  if (action === 'bookingRequestSummary') {
    const { statusCode, body: responseBody } = await handleBookingRequestSummary(payload ?? {})
    return jsonResponse(statusCode, responseBody)
  }

  return jsonResponse(400, {
    success: false,
    error: 'Unsupported AI action.',
  })
}
