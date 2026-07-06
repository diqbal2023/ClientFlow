/**
 * Business description AI feature — prompts, validation, parsing, and fallback.
 */

const DEFAULT_TONE = 'professional and friendly'

const JSON_SCHEMA = `{
  "description": "2-4 concise sentences about the business",
  "tagline": "A short memorable phrase (under 12 words)",
  "welcome_message": "A warm client-facing greeting (1-2 sentences)"
}`

/**
 * Check required fields for business description generation.
 * Returns an array of missing field names.
 */
export function validateBusinessDescriptionPayload(payload = {}) {
  const missing = []

  if (!payload.business_name?.trim()) {
    missing.push('business_name')
  }
  if (!payload.business_type?.trim()) {
    missing.push('business_type')
  }

  return missing
}

/**
 * Normalize payload with defaults for optional fields.
 */
export function normalizeBusinessDescriptionPayload(payload = {}) {
  const servicesSummary =
    payload.services_summary?.trim() ||
    payload.services_offered?.trim() ||
    ''

  return {
    business_name: payload.business_name.trim(),
    business_type: payload.business_type.trim(),
    services_summary: servicesSummary || 'General services for local clients',
    tone: payload.tone?.trim() || DEFAULT_TONE,
  }
}

/**
 * Build OpenAI chat messages for the business description action.
 */
export function buildBusinessDescriptionMessages(normalized) {
  const userContent = `Create client-facing profile copy for this small business.

Business name: ${normalized.business_name}
Business type: ${normalized.business_type}
Services offered: ${normalized.services_summary}
Tone: ${normalized.tone}

Requirements:
- description: 2-4 concise sentences. Sound natural and trustworthy. Do not overpromise.
- tagline: short and memorable (under 12 words).
- welcome_message: warm greeting a client would see on the business page.

Return ONLY valid JSON matching this schema (no markdown, no extra keys):
${JSON_SCHEMA}`

  return [
    {
      role: 'system',
      content:
        'You write polished, client-facing business profile copy for small businesses of any type. ' +
        'Be accurate, welcoming, and realistic — never mention AI, technology, or automation. ' +
        'Avoid exaggerated claims or guarantees. Return ONLY valid JSON.',
    },
    { role: 'user', content: userContent },
  ]
}

/**
 * Parse and validate the LLM JSON response.
 * Returns null if invalid.
 */
export function parseBusinessDescriptionJson(raw) {
  if (!raw?.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    const description = parsed.description?.trim()
    const tagline = parsed.tagline?.trim()
    const welcome_message = parsed.welcome_message?.trim()

    if (!description || !tagline || !welcome_message) {
      return null
    }

    return { description, tagline, welcome_message }
  } catch {
    return null
  }
}

/**
 * Build a simple fallback when AI is unavailable or returns invalid JSON.
 */
export function buildFallbackBusinessDescription(normalized) {
  const { business_name, business_type, services_summary, tone } = normalized

  return {
    description: `${business_name} is a ${business_type.toLowerCase()} serving local clients. We offer ${services_summary.toLowerCase()}. Our team focuses on clear communication and dependable service in a ${tone} setting.`,
    tagline: `Your trusted ${business_type.toLowerCase()}`,
    welcome_message: `Welcome to ${business_name}! We are glad you are here and look forward to helping you.`,
  }
}
