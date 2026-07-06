/**
 * Rebooking recommendation AI feature — prompts, validation, parsing, and fallback.
 */

const JSON_SCHEMA = `{
  "recommendation": "Short client-facing suggestion about rebooking",
  "reason": "Practical explanation of timing based on the input data",
  "suggested_request_details": "Message the client could paste into a booking request"
}`

/**
 * Check that enough context exists to generate a recommendation.
 */
export function validateRebookingPayload(payload = {}) {
  const missing = []

  if (!payload.service_name?.trim()) {
    missing.push('service_name')
  }

  if (!payload.booking_history?.length) {
    missing.push('booking_history')
  }

  return missing
}

/**
 * Normalize payload with computed defaults.
 */
export function normalizeRebookingPayload(payload = {}) {
  const daysSince = Number(payload.days_since_last_booking)
  const interval = payload.recommended_interval_days

  const intervalMet =
    interval != null &&
    Number.isFinite(interval) &&
    Number.isFinite(daysSince) &&
    daysSince >= interval

  return {
    service_name: payload.service_name?.trim() || 'this service',
    business_name: payload.business_name?.trim() || 'the business',
    last_request_date: payload.last_request_date?.trim() || 'unknown',
    current_date: payload.current_date?.trim() || new Date().toISOString().split('T')[0],
    request_status: payload.request_status?.trim() || 'unknown',
    days_since_last_booking: Number.isFinite(daysSince) ? daysSince : null,
    recommended_interval_days:
      interval != null && Number.isFinite(Number(interval)) ? Number(interval) : null,
    interval_met: Boolean(intervalMet),
    urgency: intervalMet ? 'higher' : 'lower',
    booking_history: Array.isArray(payload.booking_history) ? payload.booking_history : [],
  }
}

/**
 * Build OpenAI chat messages for the rebooking recommendation action.
 */
export function buildRebookingMessages(normalized) {
  const historyText = JSON.stringify(normalized.booking_history, null, 2)
  const intervalNote = normalized.recommended_interval_days
    ? `Recommended rebooking interval: every ${normalized.recommended_interval_days} days.`
    : 'No recommended rebooking interval is set for this service.'

  const timingNote = normalized.days_since_last_booking != null
    ? `Days since last booking: ${normalized.days_since_last_booking}. Interval likely met: ${normalized.interval_met ? 'yes' : 'not yet'}.`
    : 'Days since last booking: unknown.'

  const userContent = `Suggest a helpful rebooking message for this client.

Service: ${normalized.service_name}
Business: ${normalized.business_name}
Last request date: ${normalized.last_request_date}
Current date: ${normalized.current_date}
Last request status: ${normalized.request_status}
${intervalNote}
${timingNote}
Urgency level: ${normalized.urgency} (use a stronger tone if higher, softer if lower)

Recent booking history:
${historyText}

Requirements:
- recommendation: one short sentence the client can read at a glance.
- reason: explain the timing in a practical, friendly way. Do not guarantee availability.
- suggested_request_details: draft text the client could reuse in a new booking request.

Return ONLY valid JSON matching this schema (no markdown, no extra keys):
${JSON_SCHEMA}`

  return [
    {
      role: 'system',
      content:
        'You help clients decide when to rebook services they have used before. ' +
        'Be helpful and warm, not pushy. Never mention AI or automation. ' +
        'Do not promise specific appointment times or outcomes. Return ONLY valid JSON.',
    },
    { role: 'user', content: userContent },
  ]
}

/**
 * Parse and validate the LLM JSON response.
 */
export function parseRebookingJson(raw) {
  if (!raw?.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    const recommendation = parsed.recommendation?.trim()
    const reason = parsed.reason?.trim()
    const suggested_request_details = parsed.suggested_request_details?.trim()

    if (!recommendation || !reason || !suggested_request_details) {
      return null
    }

    return { recommendation, reason, suggested_request_details }
  } catch {
    return null
  }
}

/**
 * Build a fallback recommendation from input data.
 */
export function buildFallbackRebooking(normalized) {
  const { service_name, business_name, days_since_last_booking, recommended_interval_days, interval_met } =
    normalized

  let reason = `You previously booked ${service_name} at ${business_name}.`

  if (days_since_last_booking != null && recommended_interval_days != null) {
    reason = `Your last request was about ${days_since_last_booking} day(s) ago, and this service is commonly rebooked around every ${recommended_interval_days} days.`
  } else if (days_since_last_booking != null) {
    reason = `Your last request was about ${days_since_last_booking} day(s) ago.`
  }

  const recommendation = interval_met
    ? `You may want to request ${service_name} again soon.`
    : `You could plan ahead for your next ${service_name} when the timing feels right.`

  const suggested_request_details = interval_met
    ? `Hi, I would like to book another ${service_name.toLowerCase()}. I am flexible this week and would appreciate a similar appointment to my last visit.`
    : `Hi, I am interested in booking ${service_name.toLowerCase()} again in the near future. Please let me know what times are available.`

  return { recommendation, reason, suggested_request_details }
}
