import { useCallback, useEffect, useState } from 'react'
import EmptyState from './EmptyState'
import FormAlert from './FormAlert'
import {
  ADMIN_BOOKING_STATUSES,
  formatRequestDate,
  formatRequestStatus,
} from '../lib/clientRequest'
import { summarizeBookingRequest } from '../lib/aiClient'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

function buildSummaryPayload(request, businessName) {
  return {
    request_title: request.request_title ?? '',
    request_details: request.request_details ?? request.client_message ?? '',
    preferred_date: request.preferred_date ?? '',
    status: request.status ?? 'pending',
    service_name: request.services?.name ?? '',
    business_name: businessName ?? '',
    client_name: request.profiles?.full_name ?? '',
    created_at: request.created_at ?? '',
  }
}

function hasSummaryContent(request) {
  return Boolean(
    request.request_title?.trim() ||
      request.request_details?.trim() ||
      request.client_message?.trim(),
  )
}

export default function AdminBookingRequests({ business }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [summarizingId, setSummarizingId] = useState(null)
  const [summaries, setSummaries] = useState({})
  const [summaryErrors, setSummaryErrors] = useState({})
  const [summaryNotices, setSummaryNotices] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadRequests = useCallback(async () => {
    if (!business?.id) return

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('client_requests')
      .select(
        `
        *,
        services ( name ),
        profiles:client_id ( full_name )
      `,
      )
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    setLoading(false)

    if (fetchError) {
      setError(getFriendlyError(fetchError, 'Could not load booking requests.'))
      return
    }

    setRequests(data ?? [])
  }, [business?.id])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function handleStatusUpdate(request, newStatus) {
    if (!business?.id) return

    const currentStatus =
      request.status === 'reviewed' || request.status === 'in_progress'
        ? 'confirmed'
        : request.status

    if (newStatus === currentStatus) {
      return
    }

    const statusLabel =
      ADMIN_BOOKING_STATUSES.find((option) => option.value === newStatus)?.label ?? newStatus

    const confirmed = window.confirm(
      `Change booking request status to "${statusLabel}" for "${request.request_title || 'Untitled'}"?`,
    )

    if (!confirmed) {
      return
    }

    setUpdatingId(request.id)
    setMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('client_requests')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .eq('business_id', business.id)

    setUpdatingId(null)

    if (updateError) {
      setError(getFriendlyError(updateError, 'Could not update booking request status.'))
      return
    }

    setMessage(`Booking request status updated to ${statusLabel}.`)
    await loadRequests()
  }

  async function handleSummarize(request) {
    if (!hasSummaryContent(request)) {
      setSummaryErrors((current) => ({
        ...current,
        [request.id]: 'This request needs a title or details before it can be summarized.',
      }))
      return
    }

    setSummarizingId(request.id)
    setSummaryErrors((current) => ({ ...current, [request.id]: '' }))
    setSummaryNotices((current) => ({ ...current, [request.id]: '' }))

    try {
      const result = await summarizeBookingRequest(
        buildSummaryPayload(request, business?.name),
      )

      setSummaries((current) => ({
        ...current,
        [request.id]: result,
      }))

      if (result.fallbackUsed) {
        setSummaryNotices((current) => ({
          ...current,
          [request.id]:
            result.message ||
            'A basic template was used because AI generation was unavailable.',
        }))
      }
    } catch (summaryError) {
      setSummaryErrors((current) => ({
        ...current,
        [request.id]:
          summaryError.message || 'Could not summarize this request. Please try again.',
      }))
    } finally {
      setSummarizingId(null)
    }
  }

  if (!business) {
    return (
      <section className="business-section">
        <h2>Booking requests</h2>
        <EmptyState message="Create your business profile to view booking requests." />
      </section>
    )
  }

  return (
    <section className="business-section">
      <h2>Booking requests</h2>
      <p className="page-note">View and update booking requests submitted to your business.</p>

      <FormAlert type="success" message={message} />
      <FormAlert type="error" message={error} />

      {loading ? (
        <p className="loading-text">Loading booking requests...</p>
      ) : requests.length === 0 ? (
        <EmptyState message="No booking requests yet. They will appear here when clients submit requests." />
      ) : (
        <ul className="services-list">
          {requests.map((request) => {
            const displayStatus =
              request.status === 'reviewed' || request.status === 'in_progress'
                ? 'confirmed'
                : request.status
            const summary = summaries[request.id]
            const isSummarizing = summarizingId === request.id

            return (
              <li key={request.id} className="service-card">
                <div className="service-card-header">
                  <h3>{request.request_title || 'Untitled booking request'}</h3>
                  <span
                    className={`status-badge${request.status === 'canceled' ? '' : ' is-active'}`}
                  >
                    {formatRequestStatus(request.status)}
                  </span>
                </div>

                <p>
                  <strong>Client:</strong> {request.profiles?.full_name || 'Unknown client'}
                </p>
                <p>
                  <strong>Service:</strong> {request.services?.name || 'No specific service'}
                </p>
                <p>
                  <strong>Details:</strong>{' '}
                  {request.request_details || request.client_message || '—'}
                </p>
                <p>
                  <strong>Preferred date:</strong> {request.preferred_date || 'Not set'}
                </p>
                <p>
                  <strong>Submitted:</strong> {formatRequestDate(request.created_at)}
                </p>

                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSummarize(request)}
                    disabled={isSummarizing || updatingId === request.id}
                  >
                    {isSummarizing ? 'Summarizing...' : 'Summarize Request'}
                  </button>
                </div>

                <FormAlert type="error" message={summaryErrors[request.id]} />
                <FormAlert type="success" message={summaryNotices[request.id]} />

                {summary && (
                  <div className="ai-preview-card request-summary-card">
                    <p>
                      <strong>Summary:</strong> {summary.summary}
                    </p>
                    {summary.key_details?.length > 0 && (
                      <div>
                        <strong>Key details:</strong>
                        <ul className="summary-key-details">
                          {summary.key_details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p>
                      <strong>Suggested next step:</strong> {summary.suggested_next_step}
                    </p>
                  </div>
                )}

                <label className="status-update-label">
                  Update status
                  <div className="status-update-row">
                    <select
                      value={displayStatus}
                      onChange={(event) => handleStatusUpdate(request, event.target.value)}
                      disabled={updatingId === request.id || isSummarizing}
                    >
                      {ADMIN_BOOKING_STATUSES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {updatingId === request.id && <span className="status-saving">Saving...</span>}
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
