import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { generateRebookingRecommendation } from '../lib/aiClient'
import { getFriendlyError } from '../lib/formUtils'
import {
  buildRebookingAiPayload,
  hasRebookingHistory,
} from '../lib/rebookingRecommendation'
import { supabase } from '../lib/supabaseClient'
import EmptyState from './EmptyState'
import FormAlert from './FormAlert'

export default function RebookingRecommendation() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [aiError, setAiError] = useState('')
  const [aiNotice, setAiNotice] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [context, setContext] = useState(null)

  const loadRequests = useCallback(async () => {
    if (!profile?.id) return

    setLoadingHistory(true)
    setHistoryError('')

    const { data, error } = await supabase
      .from('client_requests')
      .select(
        `
        *,
        businesses ( name ),
        services ( name, recommended_interval_days )
      `,
      )
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })

    setLoadingHistory(false)

    if (error) {
      setHistoryError(getFriendlyError(error, 'Could not load your booking history.'))
      return
    }

    setRequests(data ?? [])
  }, [profile?.id])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const canRecommend = hasRebookingHistory(requests)

  async function handleGenerate() {
    setAiError('')
    setAiNotice('')
    setRecommendation(null)

    const payload = buildRebookingAiPayload(requests)

    if (!payload) {
      setAiError('Submit at least one booking request before generating a recommendation.')
      return
    }

    setContext(payload)
    setGenerating(true)

    try {
      const result = await generateRebookingRecommendation(payload)
      setRecommendation(result)

      if (result.fallbackUsed) {
        setAiNotice(
          result.message ||
            'A basic template was used because AI generation was unavailable.',
        )
      }
    } catch (error) {
      setAiError(error.message || 'Could not generate a recommendation. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className="business-section">
      <h2>Suggested for You</h2>
      <p className="page-note">
        Get a personalized suggestion about services you may want to book again based on your
        past requests.
      </p>

      <FormAlert type="error" message={historyError} />
      <FormAlert type="error" message={aiError} />
      <FormAlert type="success" message={aiNotice} />

      {loadingHistory ? (
        <p className="loading-text">Loading your booking history...</p>
      ) : !canRecommend ? (
        <EmptyState message="You do not have any booking history yet. Submit a request to a business first, then come back for rebooking suggestions." />
      ) : (
        <>
          <div className="button-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Recommendation'}
            </button>
          </div>

          {generating && (
            <p className="loading-text">Generating your rebooking recommendation...</p>
          )}

          {recommendation && (
            <div className="ai-preview-card rebooking-result">
              <p>
                <strong>Recommendation:</strong> {recommendation.recommendation}
              </p>
              <p>
                <strong>Reason:</strong> {recommendation.reason}
              </p>
              <p>
                <strong>Suggested request details:</strong> {recommendation.suggested_request_details}
              </p>

              {context?.business_id && (
                <div className="button-row">
                  <Link
                    className="btn btn-secondary"
                    to={`/client/business/${context.business_id}`}
                    state={{
                      initialServiceId: context.service_id ?? '',
                      initialRequestTitle: context.service_name
                        ? `Rebook ${context.service_name}`
                        : 'Rebook service',
                      initialRequestDetails: recommendation.suggested_request_details,
                    }}
                  >
                    Use Suggestion
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
