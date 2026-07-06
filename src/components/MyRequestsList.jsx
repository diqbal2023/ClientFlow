import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import EmptyState from './EmptyState'
import FormAlert from './FormAlert'
import {
  formatRequestStatus,
  formToRequestUpdatePayload,
  requestToForm,
  validateRequestForm,
} from '../lib/clientRequest'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

function RequestEditForm({ request, onSave, onCancel, saving }) {
  const [form, setForm] = useState(requestToForm(request))
  const [validationError, setValidationError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateRequestForm(form)

    if (validation) {
      setValidationError(validation)
      return
    }

    setValidationError('')
    await onSave(form)
  }

  return (
    <form className="auth-form request-edit-form" onSubmit={handleSubmit}>
      <label>
        Request title *
        <input
          type="text"
          name="request_title"
          value={form.request_title}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Request details *
        <textarea
          name="request_details"
          value={form.request_details}
          onChange={handleChange}
          rows={3}
          required
        />
      </label>

      <label>
        Preferred date
        <input
          type="date"
          name="preferred_date"
          value={form.preferred_date}
          onChange={handleChange}
        />
      </label>

      {validationError && <FormAlert type="error" message={validationError} />}

      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function MyRequestsList() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadRequests = useCallback(async () => {
    if (!profile?.id) return

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('client_requests')
      .select(
        `
        *,
        businesses ( name ),
        services ( name )
      `,
      )
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })

    setLoading(false)

    if (fetchError) {
      setError(getFriendlyError(fetchError, 'Could not load your booking requests.'))
      return
    }

    setRequests(data ?? [])
  }, [profile?.id])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function handleUpdate(request, form) {
    if (!profile?.id) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('client_requests')
      .update(formToRequestUpdatePayload(form))
      .eq('id', request.id)
      .eq('client_id', profile.id)
      .eq('status', 'pending')

    setSaving(false)

    if (updateError) {
      setError(getFriendlyError(updateError, 'Could not update this booking request.'))
      return
    }

    setEditingId(null)
    setMessage('Booking request updated successfully.')
    await loadRequests()
  }

  async function handleCancel(request) {
    if (!profile?.id) return

    const confirmed = window.confirm(
      `Cancel the booking request "${request.request_title || 'Untitled'}"? This will set the status to Canceled.`,
    )

    if (!confirmed) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: cancelError } = await supabase
      .from('client_requests')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('id', request.id)
      .eq('client_id', profile.id)
      .eq('status', 'pending')

    setSaving(false)

    if (cancelError) {
      setError(getFriendlyError(cancelError, 'Could not cancel this booking request.'))
      return
    }

    setMessage('Booking request canceled.')
    await loadRequests()
  }

  async function handleDelete(request) {
    if (!profile?.id) return

    const confirmed = window.confirm(
      `Delete the booking request "${request.request_title || 'Untitled'}" permanently? This cannot be undone.`,
    )

    if (!confirmed) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: deleteError } = await supabase
      .from('client_requests')
      .delete()
      .eq('id', request.id)
      .eq('client_id', profile.id)

    setSaving(false)

    if (deleteError) {
      setError(getFriendlyError(deleteError, 'Could not delete this booking request.'))
      return
    }

    setMessage('Booking request deleted.')
    await loadRequests()
  }

  if (loading) {
    return <p className="loading-text">Loading your booking requests...</p>
  }

  return (
    <section className="business-section">
      <h2>My booking requests</h2>

      <FormAlert type="success" message={message} />
      <FormAlert type="error" message={error} />

      {requests.length === 0 ? (
        <EmptyState message="You have not submitted any booking requests yet. Browse a business and submit a booking request." />
      ) : (
        <ul className="services-list">
          {requests.map((request) => {
            const isPending = request.status === 'pending'
            const isEditing = editingId === request.id

            return (
              <li key={request.id} className="service-card">
                {isEditing ? (
                  <RequestEditForm
                    request={request}
                    onSave={(form) => handleUpdate(request, form)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <>
                    <div className="service-card-header">
                      <h3>{request.request_title || 'Untitled booking request'}</h3>
                      <span
                        className={`status-badge${request.status === 'canceled' ? '' : ' is-active'}`}
                      >
                        {formatRequestStatus(request.status)}
                      </span>
                    </div>

                    <p>
                      <strong>Business:</strong> {request.businesses?.name ?? 'Unknown'}
                    </p>
                    <p>
                      <strong>Service:</strong>{' '}
                      {request.services?.name ?? 'No specific service'}
                    </p>
                    <p>
                      <strong>Details:</strong>{' '}
                      {request.request_details || request.client_message || '—'}
                    </p>
                    <p>
                      <strong>Preferred date:</strong> {request.preferred_date || 'Not set'}
                    </p>

                    {isPending && (
                      <div className="button-row">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingId(request.id)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleCancel(request)}
                          disabled={saving}
                        >
                          Cancel booking request
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleDelete(request)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
