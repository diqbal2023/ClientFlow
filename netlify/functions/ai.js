/**
 * Netlify Function: secure AI proxy for ClientFlow.
 *
 * The browser calls /.netlify/functions/ai — never Trussed directly.
 * TRUSSED_API_KEY stays server-side in .env (local) or Netlify env vars (deploy).
 */

import { callLlm, getMissingEnvVars, toUserFriendlyError } from './_shared/llmClient.js'

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
 * Build a simple placeholder prompt for each AI action.
 * These are minimal prompts to verify the secure pipeline works.
 * Full prompts will be added when UI features are built in later issues.
 */
function buildMessages(action, payload = {}) {
  const context = JSON.stringify(payload, null, 2)

  const prompts = {
    businessDescription: {
      system:
        'You help small businesses write short, professional descriptions. Return plain text only (2-3 sentences).',
      user: `Write a business description based on this info:\n${context}`,
    },
    serviceDescription: {
      system:
        'You help businesses write clear service descriptions. Return plain text only (1-2 sentences).',
      user: `Write a service description based on this info:\n${context}`,
    },
    rebookingRecommendation: {
      system:
        'You suggest friendly rebooking messages for service businesses. Return plain text only (1-2 sentences).',
      user: `Suggest a rebooking recommendation based on this booking history:\n${context}`,
    },
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

  // Fail fast if env vars are missing (before parsing the body)
  const missing = getMissingEnvVars()
  if (missing.length > 0) {
    return jsonResponse(500, {
      success: false,
      error: `AI is not configured. Missing environment variable(s): ${missing.join(', ')}.`,
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

  try {
    const messages = buildMessages(action, payload ?? {})
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
