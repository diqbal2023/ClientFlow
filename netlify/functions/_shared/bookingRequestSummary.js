/**
 * Booking request summary AI feature — prompts, validation, parsing, and fallback.
 */

const JSON_SCHEMA = `{
  "summary": "1-2 sentence overview for the business admin",
  "key_details": ["short bullet-style detail", "another detail"],
  "suggested_next_step": "one practical admin action based on current status"
}`

/**
 * Check required fields for booking request summary generation.
 */
export function validateBookingRequestSummaryPayload(payload = {}) {
  const hasTitle = Boolean(payload.request_title?.trim())
  const hasDetails = Boolean(
    payload.request_details?.trim() || payload.client_message?.trim(),
  )

  if (!hasTitle && !hasDetails) {
    return ['request_title', 'request_details']
  }

  return []
}

/**
 * Normalize payload with safe defaults.
 */
export function normalizeBookingRequestSummaryPayload(payload = {}) {
  const status = payload.status?.trim() || 'pending'
  const displayStatus =
    status === 'reviewed' || status === 'in_progress' ? 'confirmed' : status

  return {
    request_title: payload.request_title?.trim() || '',
    request_details:
      payload.request_details?.trim() || payload.client_message?.trim() || '',
    preferred_date: payload.preferred_date?.trim() || 'Not specified',
    status: displayStatus,
    service_name: payload.service_name?.trim() || 'No specific service',
    business_name: payload.business_name?.trim() || 'the business',
    client_name: payload.client_name?.trim() || payload.client_email?.trim() || 'Client',
    created_at: payload.created_at?.trim() || 'Unknown',
  }
}

function suggestedNextStepForStatus(status) {
  const steps = {
    pending: 'Review the request details, check availability, and confirm or cancel the request.',
    confirmed:
      'Prepare for the appointment and update the status to completed when the service is done.',
    completed: 'No immediate action needed. Archive or follow up only if the client needs more help.',
    canceled: 'No action needed unless the client submits a new request.',
  }

  return steps[status] ?? 'Review the request and update the status as appropriate.'
}

/**
 * Build OpenAI chat messages for the booking request summary action.
 */
export function buildBookingRequestSummaryMessages(normalized) {
  const userContent = `Summarize this client booking request for a business admin.

Request title: ${normalized.request_title || 'Not provided'}
Request details: ${normalized.request_details || 'Not provided'}
Preferred date: ${normalized.preferred_date}
Current status: ${normalized.status}
Service: ${normalized.service_name}
Business: ${normalized.business_name}
Client: ${normalized.client_name}
Submitted: ${normalized.created_at}

Requirements:
- summary: 1-2 clear sentences using ONLY the information above. Do not invent details.
- key_details: 2-5 short bullet-style strings with the most important facts from the input.
- suggested_next_step: one practical admin action that fits the current status workflow.

Return ONLY valid JSON matching this schema (no markdown, no extra keys):
${JSON_SCHEMA}`

  return [
    {
      role: 'system',
      content:
        'You summarize individual client booking requests for small business admins. ' +
        'Use only the provided request information — never invent dates, prices, or client needs. ' +
        'Never mention AI. Be concise and actionable. Return ONLY valid JSON.',
    },
    { role: 'user', content: userContent },
  ]
}

/**
 * Parse and validate the LLM JSON response.
 */
export function parseBookingRequestSummaryJson(raw) {
  if (!raw?.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    const summary = parsed.summary?.trim()
    const suggested_next_step = parsed.suggested_next_step?.trim()
    const key_details = Array.isArray(parsed.key_details)
      ? parsed.key_details.map((item) => String(item).trim()).filter(Boolean)
      : []

    if (!summary || !suggested_next_step || key_details.length === 0) {
      return null
    }

    return { summary, key_details, suggested_next_step }
  } catch {
    return null
  }
}

/**
 * Build a fallback summary from request input.
 */
export function buildFallbackBookingRequestSummary(normalized) {
  const titlePart = normalized.request_title
    ? `"${normalized.request_title}"`
    : 'a booking request'

  const servicePart =
    normalized.service_name !== 'No specific service'
      ? ` for ${normalized.service_name}`
      : ''

  const summary = `${normalized.client_name} submitted ${titlePart}${servicePart}. Status is ${normalized.status}.`

  const key_details = []

  if (normalized.request_title) {
    key_details.push(`Request: ${normalized.request_title}`)
  }

  if (normalized.request_details) {
    key_details.push(`Details: ${normalized.request_details}`)
  }

  if (normalized.service_name !== 'No specific service') {
    key_details.push(`Service: ${normalized.service_name}`)
  }

  if (normalized.preferred_date !== 'Not specified') {
    key_details.push(`Preferred date: ${normalized.preferred_date}`)
  }

  key_details.push(`Status: ${normalized.status}`)
  key_details.push(`Submitted: ${normalized.created_at}`)

  return {
    summary,
    key_details,
    suggested_next_step: suggestedNextStepForStatus(normalized.status),
  }
}
