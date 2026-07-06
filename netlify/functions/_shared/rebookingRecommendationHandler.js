/**
 * Handler for the rebookingRecommendation AI action.
 */

import { callLlm, toUserFriendlyError } from './llmClient.js'
import {
  buildFallbackRebooking,
  buildRebookingMessages,
  normalizeRebookingPayload,
  parseRebookingJson,
  validateRebookingPayload,
} from './rebookingRecommendation.js'

/**
 * Generate structured rebooking recommendation JSON via Trussed.ai.
 */
export async function handleRebookingRecommendation(payload = {}) {
  const missingFields = validateRebookingPayload(payload)

  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Not enough booking history to generate a recommendation.',
      },
    }
  }

  const normalized = normalizeRebookingPayload(payload)
  const messages = buildRebookingMessages(normalized)

  try {
    const raw = await callLlm({
      messages,
      temperature: 0.3,
      maxTokens: 600,
      jsonMode: true,
    })

    const parsed = parseRebookingJson(raw)

    if (parsed) {
      return {
        statusCode: 200,
        body: {
          success: true,
          action: 'rebookingRecommendation',
          result: parsed,
          fallbackUsed: false,
        },
      }
    }

    return successWithFallback(normalized, 'We used a basic template because the AI response was invalid.')
  } catch (error) {
    console.error('rebookingRecommendation AI error:', error?.message ?? error)

    const aiError = toUserFriendlyError(error)

    return {
      statusCode: 200,
      body: {
        success: true,
        action: 'rebookingRecommendation',
        result: buildFallbackRebooking(normalized),
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
      action: 'rebookingRecommendation',
      result: buildFallbackRebooking(normalized),
      fallbackUsed: true,
      message,
    },
  }
}
