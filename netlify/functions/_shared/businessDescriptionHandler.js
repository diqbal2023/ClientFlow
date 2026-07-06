/**
 * Handler for the businessDescription AI action.
 */

import { callLlm, toUserFriendlyError } from './llmClient.js'
import {
  buildBusinessDescriptionMessages,
  buildFallbackBusinessDescription,
  normalizeBusinessDescriptionPayload,
  parseBusinessDescriptionJson,
  validateBusinessDescriptionPayload,
} from './businessDescription.js'

/**
 * Generate structured business description JSON via Trussed.ai.
 * Falls back to template copy if the AI call or JSON parsing fails.
 */
export async function handleBusinessDescription(payload = {}) {
  const missingFields = validateBusinessDescriptionPayload(payload)

  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: `Please provide ${missingFields.join(' and ')} before generating a description.`,
      },
    }
  }

  const normalized = normalizeBusinessDescriptionPayload(payload)
  const messages = buildBusinessDescriptionMessages(normalized)

  try {
    const raw = await callLlm({
      messages,
      temperature: 0.3,
      maxTokens: 600,
      jsonMode: true,
    })

    const parsed = parseBusinessDescriptionJson(raw)

    if (parsed) {
      return {
        statusCode: 200,
        body: {
          success: true,
          action: 'businessDescription',
          result: parsed,
          fallbackUsed: false,
        },
      }
    }

    // Invalid JSON from model — use fallback
    return successWithFallback(normalized, 'We used a basic template because the AI response was invalid.')
  } catch (error) {
    console.error('businessDescription AI error:', error?.message ?? error)

    // Transient or auth errors: still degrade gracefully with fallback
    const fallback = buildFallbackBusinessDescription(normalized)
    const aiError = toUserFriendlyError(error)

    return {
      statusCode: 200,
      body: {
        success: true,
        action: 'businessDescription',
        result: fallback,
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
      action: 'businessDescription',
      result: buildFallbackBusinessDescription(normalized),
      fallbackUsed: true,
      message,
    },
  }
}
