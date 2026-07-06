/**
 * Frontend AI client for ClientFlow.
 *
 * All AI calls go through the Netlify Function proxy — never directly to Trussed.
 * The API key is NOT in the browser; it lives server-side only.
 */

const AI_ENDPOINT = '/.netlify/functions/ai'

/**
 * Send an AI action request to the Netlify Function.
 *
 * @param {string} action - One of the supported action names
 * @param {object} payload - Data for the AI prompt (business info, service info, etc.)
 * @returns {Promise<{ success: boolean, action: string, result: string }>}
 */
async function callAi(action, payload = {}) {
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('AI service returned an invalid response.')
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'AI request failed.')
  }

  return data
}

/** Generate a business description from business profile data. */
export function generateBusinessDescription(payload) {
  return callAi('businessDescription', payload)
}

/** Generate a service description from service data. */
export function generateServiceDescription(payload) {
  return callAi('serviceDescription', payload)
}

/** Generate a rebooking recommendation from booking history data. */
export function generateRebookingRecommendation(payload) {
  return callAi('rebookingRecommendation', payload)
}

/** Summarize a client booking request for the business owner. */
export function summarizeBookingRequest(payload) {
  return callAi('bookingRequestSummary', payload)
}
