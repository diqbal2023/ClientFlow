/**
 * Netlify Function: secure AI proxy for ClientFlow.
 *
 * The browser calls /.netlify/functions/ai — never Trussed directly.
 * TRUSSED_API_KEY stays server-side in .env (local) or Netlify env vars (deploy).
 */

import { callLlm, getMissingEnvVars, toUserFriendlyError } from './_shared/llmClient.js'
import { handleBusinessDescription } from './_shared/businessDescriptionHandler.js'
import { handleServiceDescription } from './_shared/serviceDescriptionHandler.js'
import { handleRebookingRecommendation } from './_shared/rebookingRecommendationHandler.js'

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
 * Build a simple placeholder prompt for actions not yet implemented in UI.
 */
function buildPlaceholderMessages(action, payload = {}) {
  const context = JSON.stringify(payload, null, 2)

  const prompts = {
    bookingRequestSummary: {
      system:
        'You summarize client booking requests for business owners. Return plain text only (2-3 sentences).',
      user: `Summarize this booking request:\n${context}`,
    },
  }

  const prompt = prompts[action]

  return [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user },
  ]
}

/**
 * Main Netlify Function handler.
 */
export async function handler(event) {
  // Only POST is allowed — AI actions change data context and should not be GET-cacheable
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      success: false,
      error: 'Method not allowed. Use POST.',
    })
  }

  // Parse request body
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
      error: `AI is not configured. Missing environment variable(s): ${missing.join(', ')}.`,
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

  // Placeholder handlers for future issues
  try {
    const messages = buildPlaceholderMessages(action, payload ?? {})
    const result = await callLlm({ messages, temperature: 0.3, maxTokens: 400 })

    return jsonResponse(200, {
      success: true,
      action,
      result,
    })
  } catch (error) {
    console.error('AI function error:', error?.message ?? error)

    return jsonResponse(500, {
      success: false,
      error: toUserFriendlyError(error),
    })
  }
}
