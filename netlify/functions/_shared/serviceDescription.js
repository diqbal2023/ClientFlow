/**
 * Service description AI feature — prompts, validation, parsing, and fallback.
 */

const DEFAULT_TONE = 'professional and friendly'

const JSON_SCHEMA = `{
  "description": "2-4 concise client-facing sentences about the service",
  "short_summary": "One sentence summary for listings"
}`

/**
 * Check required fields for service description generation.
 * Returns an array of missing field names.
 */
export function validateServiceDescriptionPayload(payload = {}) {
  const missing = []

  if (!payload.service_name?.trim()) {
    missing.push('service_name')
  }

  return missing
}

/**
 * Normalize payload with defaults for optional fields.
 */
export function normalizeServiceDescriptionPayload(payload = {}) {
  const duration = payload.duration_minutes
  const durationLabel =
    duration != null && String(duration).trim() !== ''
      ? `${String(duration).trim()} minutes`
      : 'flexible duration'

  const priceRange = payload.price_range?.trim() || 'contact for pricing'

  return {
    service_name: payload.service_name.trim(),
    business_type: payload.business_type?.trim() || 'local service business',
    price_range: priceRange,
    duration_minutes: durationLabel,
    tone: payload.tone?.trim() || DEFAULT_TONE,
  }
}

/**
 * Build OpenAI chat messages for the service description action.
 */
export function buildServiceDescriptionMessages(normalized) {
  const userContent = `Create client-facing copy for this service listing.

Service name: ${normalized.service_name}
Business type: ${normalized.business_type}
Price range: ${normalized.price_range}
Duration: ${normalized.duration_minutes}
Tone: ${normalized.tone}

Requirements:
- description: 2-4 concise sentences. Clear, professional, and realistic. Do not overpromise.
- short_summary: exactly one sentence for a service card or listing preview.

Return ONLY valid JSON matching this schema (no markdown, no extra keys):
${JSON_SCHEMA}`

  return [
    {
      role: 'system',
      content:
        'You write polished, client-facing service descriptions for small businesses of any type. ' +
        'Be clear, welcoming, and accurate — never mention AI, technology, or automation. ' +
        'Avoid exaggerated claims or guarantees. Return ONLY valid JSON.',
    },
    { role: 'user', content: userContent },
  ]
}

/**
 * Parse and validate the LLM JSON response.
 * Returns null if invalid.
 */
export function parseServiceDescriptionJson(raw) {
  if (!raw?.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    const description = parsed.description?.trim()
    const short_summary = parsed.short_summary?.trim()

    if (!description || !short_summary) {
      return null
    }

    return { description, short_summary }
  } catch {
    return null
  }
}

/**
 * Build a simple fallback when AI is unavailable or returns invalid JSON.
 */
export function buildFallbackServiceDescription(normalized) {
  const { service_name, business_type, price_range, duration_minutes, tone } = normalized

  return {
    description: `${service_name} is a ${tone} ${business_type.toLowerCase()} service designed to meet your needs. Sessions typically run about ${duration_minutes.toLowerCase()} with pricing around ${price_range.toLowerCase()}. Book with confidence and enjoy attentive, professional care.`,
    short_summary: `${service_name} — ${duration_minutes.toLowerCase()}, ${price_range.toLowerCase()}.`,
  }
}
