/**
 * Handler for the bookingRequestSummary AI action.
 */

import { callLlm, toUserFriendlyError } from './llmClient.js'
import {
  buildBookingRequestSummaryMessages,
  buildFallbackBookingRequestSummary,
  normalizeBookingRequestSummaryPayload,
  parseBookingRequestSummaryJson,
  validateBookingRequestSummaryPayload,
} from './bookingRequestSummary.js'

/**
 * Generate structured booking request summary JSON via Trussed.ai.
 */
export async function handleBookingRequestSummary(payload = {}) {
  const missingFields = validateBookingRequestSummaryPayload(payload)

  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'This request needs a title or details before it can be summarized.',
      },
    }
  }

  const normalized = normalizeBookingRequestSummaryPayload(payload)
  const messages = buildBookingRequestSummaryMessages(normalized)

  try {
    const raw = await callLlm({
      messages,
      temperature: 0.3,
      maxTokens: 500,
      jsonMode: true,
    })

    const parsed = parseBookingRequestSummaryJson(raw)

    if (parsed) {
      return {
        statusCode: 200,
        body: {
          success: true,
          action: 'bookingRequestSummary',
          result: parsed,
          fallbackUsed: false,
        },
      }
    }

    return successWithFallback(
      normalized,
      'We used a basic template because the AI response was invalid.',
    )
  } catch (error) {
    console.error('bookingRequestSummary AI error:', error?.message ?? error)

    const aiError = toUserFriendlyError(error)

    return {
      statusCode: 200,
      body: {
        success: true,
        action: 'bookingRequestSummary',
        result: buildFallbackBookingRequestSummary(normalized),
        fallbackUsed: true,
        message: `${aiError} A basic template was used instead.`,
      },
    }
  }
}

function successWithFallback(normalized, message) {
  return {
    statusCode: 200,
    body: {
      success: true,
      action: 'bookingRequestSummary',
      result: buildFallbackBookingRequestSummary(normalized),
      fallbackUsed: true,
      message,
    },
  }
}
