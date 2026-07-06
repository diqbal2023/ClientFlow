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
 * @returns {Promise<object>} Parsed JSON response from the function
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

/**
 * Generate a business description, tagline, and welcome message.
 *
 * @param {object} payload
 * @param {string} payload.business_name
 * @param {string} payload.business_type
 * @param {string} [payload.services_summary]
 * @param {string} [payload.tone]
 * @returns {Promise<{ description: string, tagline: string, welcome_message: string, fallbackUsed?: boolean, message?: string }>}
 */
export async function generateBusinessDescription(payload) {
  const data = await callAi('businessDescription', payload)

  return {
    ...data.result,
    fallbackUsed: data.fallbackUsed ?? false,
    message: data.message,
  }
}

/**
 * Generate a service description and short summary.
 *
 * @param {object} payload
 * @param {string} payload.service_name
 * @param {string} [payload.business_type]
 * @param {string} [payload.price_range]
 * @param {string|number} [payload.duration_minutes]
 * @param {string} [payload.tone]
 * @returns {Promise<{ description: string, short_summary: string, fallbackUsed?: boolean, message?: string }>}
 */
export async function generateServiceDescription(payload) {
  const data = await callAi('serviceDescription', payload)

  return {
    ...data.result,
    fallbackUsed: data.fallbackUsed ?? false,
    message: data.message,
  }
}

/** Generate a rebooking recommendation from booking history data. */
export function generateRebookingRecommendation(payload) {
  return callAi('rebookingRecommendation', payload)
}

/** Summarize a client booking request for the business owner. */
export function summarizeBookingRequest(payload) {
  return callAi('bookingRequestSummary', payload)
}
