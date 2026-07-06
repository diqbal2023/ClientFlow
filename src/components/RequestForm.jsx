import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import FormAlert from './FormAlert'
import {
  emptyRequestForm,
  formToRequestPayload,
  validateRequestForm,
} from '../lib/clientRequest'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function RequestForm({
  businessId,
  businessName,
  services = [],
  initialServiceId = '',
  initialRequestTitle = '',
  initialRequestDetails = '',
  onSuccess,
}) {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    ...emptyRequestForm,
    service_id: initialServiceId,
    request_title: initialRequestTitle,
    request_details: initialRequestDetails,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setForm((current) => ({
      ...current,
      service_id: initialServiceId,
      request_title: initialRequestTitle || current.request_title,
      request_details: initialRequestDetails || current.request_details,
    }))
  }, [initialServiceId, initialRequestTitle, initialRequestDetails])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validation = validateRequestForm(form, {
      businessId,
      clientId: profile?.id,
    })

    if (validation) {
      setValidationError(validation)
      return
    }

    setValidationError('')
    setLoading(true)
    setMessage('')
    setError('')

    const { error: insertError } = await supabase.from('client_requests').insert(
      formToRequestPayload(form, {
        clientId: profile.id,
        businessId,
        status: 'pending',
      }),
    )

    setLoading(false)

    if (insertError) {
      setError(getFriendlyError(insertError, 'Could not submit your booking request. Please try again.'))
      return
    }

    setForm({ ...emptyRequestForm, service_id: initialServiceId })
    setMessage(`Booking request submitted to ${businessName}. Status: Pending.`)
    onSuccess?.()
  }

  return (
    <section className="business-section request-form-section">
      <h3>Submit a booking request</h3>
      <p className="page-note">
        Send a booking request to {businessName}. Your status will start as pending.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Request title *
          <input
            type="text"
            name="request_title"
            value={form.request_title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label>
          Request details *
          <textarea
            name="request_details"
            value={form.request_details}
            onChange={handleChange}
            rows={4}
            required
            disabled={loading}
          />
        </label>

        <label>
          Preferred date
          <input
            type="date"
            name="preferred_date"
            value={form.preferred_date}
            onChange={handleChange}
            disabled={loading}
          />
        </label>

        {services.length > 0 && (
          <label>
            Service (optional)
            <select
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">General booking request (no specific service)</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <FormAlert type="error" message={validationError} />
        <FormAlert type="error" message={error} />
        <FormAlert type="success" message={message} />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit booking request'}
        </button>
      </form>
    </section>
  )
}
