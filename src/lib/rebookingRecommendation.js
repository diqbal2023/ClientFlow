/**
 * Client-side helpers for rebooking recommendation logic.
 */

const PREFERRED_STATUSES = ['confirmed', 'completed']

/**
 * Get the best date to measure time since last booking.
 */
export function getLastRequestDate(request) {
  return request.preferred_date || request.created_at?.split('T')[0] || request.created_at
}

/**
 * Calculate whole days between a past date and today.
 */
export function daysSinceDate(dateStr) {
  if (!dateStr) {
    return null
  }

  const last = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  last.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - last.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function sortByMostRecent(requests) {
  return [...requests].sort((a, b) => {
    const aTime = new Date(getLastRequestDate(a)).getTime()
    const bTime = new Date(getLastRequestDate(b)).getTime()
    return bTime - aTime
  })
}

/**
 * Pick the request to base a recommendation on.
 * Prefers confirmed/completed, then pending, excluding canceled.
 */
export function pickRequestForRecommendation(requests = []) {
  const usable = requests.filter((request) => request.status !== 'canceled')

  if (!usable.length) {
    return null
  }

  const preferred = usable.filter((request) => PREFERRED_STATUSES.includes(request.status))

  if (preferred.length) {
    return sortByMostRecent(preferred)[0]
  }

  const pending = usable.filter((request) => request.status === 'pending')

  if (pending.length) {
    return sortByMostRecent(pending)[0]
  }

  return sortByMostRecent(usable)[0]
}

/**
 * Build a compact booking history list for the AI payload.
 */
export function buildBookingHistorySummary(requests = [], limit = 5) {
  return sortByMostRecent(requests.filter((request) => request.status !== 'canceled'))
    .slice(0, limit)
    .map((request) => ({
      service_name: request.services?.name ?? 'General request',
      business_name: request.businesses?.name ?? 'Unknown business',
      status: request.status,
      last_request_date: getLastRequestDate(request),
      days_since: daysSinceDate(getLastRequestDate(request)),
    }))
}

/**
 * Build the payload sent to the rebookingRecommendation AI action.
 */
export function buildRebookingAiPayload(requests = []) {
  const usable = requests.filter((request) => request.status !== 'canceled')
  const primary = pickRequestForRecommendation(requests)

  if (!primary) {
    return null
  }

  const lastRequestDate = getLastRequestDate(primary)
  const daysSince = daysSinceDate(lastRequestDate)
  const interval = primary.services?.recommended_interval_days ?? null

  return {
    service_name: primary.services?.name ?? primary.request_title ?? 'General service',
    business_name: primary.businesses?.name ?? '',
    last_request_date: lastRequestDate,
    current_date: new Date().toISOString().split('T')[0],
    recommended_interval_days: interval,
    request_status: primary.status,
    days_since_last_booking: daysSince,
    booking_history: buildBookingHistorySummary(usable),
    business_id: primary.business_id,
    service_id: primary.service_id,
  }
}

/**
 * Whether the client has any usable booking history.
 */
export function hasRebookingHistory(requests = []) {
  return requests.some((request) => request.status !== 'canceled')
}
