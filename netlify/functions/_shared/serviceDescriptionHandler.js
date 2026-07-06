/**
 * Handler for the serviceDescription AI action.
 */

import { callLlm, toUserFriendlyError } from './llmClient.js'
import {
  buildFallbackServiceDescription,
  buildServiceDescriptionMessages,
  normalizeServiceDescriptionPayload,
  parseServiceDescriptionJson,
  validateServiceDescriptionPayload,
} from './serviceDescription.js'

/**
 * Generate structured service description JSON via Trussed.ai.
 * Falls back to template copy if the AI call or JSON parsing fails.
 */
export async function handleServiceDescription(payload = {}) {
  const missingFields = validateServiceDescriptionPayload(payload)

  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Please enter a service name before generating a description.',
      },
    }
  }

  const normalized = normalizeServiceDescriptionPayload(payload)
  const messages = buildServiceDescriptionMessages(normalized)

  try {
    const raw = await callLlm({
      messages,
      temperature: 0.3,
      maxTokens: 500,
      jsonMode: true,
    })

    const parsed = parseServiceDescriptionJson(raw)

    if (parsed) {
      return {
        statusCode: 200,
        body: {
          success: true,
          action: 'serviceDescription',
          result: parsed,
          fallbackUsed: false,
        },
      }
    }

    return successWithFallback(normalized, 'We used a basic template because the AI response was invalid.')
  } catch (error) {
    console.error('serviceDescription AI error:', error?.message ?? error)

    const aiError = toUserFriendlyError(error)

    return {
      statusCode: 200,
      body: {
        success: true,
        action: 'serviceDescription',
        result: buildFallbackServiceDescription(normalized),
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
      action: 'serviceDescription',
      result: buildFallbackServiceDescription(normalized),
      fallbackUsed: true,
      message,
    },
  }
}
