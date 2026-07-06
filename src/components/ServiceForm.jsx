import { useEffect, useState } from 'react'
import FormAlert from './FormAlert'
import { generateServiceDescription } from '../lib/aiClient'
import { formatAiError, logAiError } from '../lib/aiErrors'
import { emptyServiceForm, validateServiceForm } from '../lib/serviceProfile'

export default function ServiceForm({
  initialValues = emptyServiceForm,
  submitLabel,
  onSubmit,
  onCancel,
  loading = false,
  businessType = '',
}) {
  const [form, setForm] = useState(initialValues)
  const [validationError, setValidationError] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiPreview, setAiPreview] = useState(null)
  const [aiNotice, setAiNotice] = useState('')

  useEffect(() => {
    setForm(initialValues)
    setValidationError('')
    setAiError('')
    setAiPreview(null)
    setAiNotice('')
  }, [initialValues])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleGenerateDescription() {
    setAiError('')
    setAiNotice('')

    if (!form.service_name.trim()) {
      setAiError('Enter a service name before generating a description.')
      return
    }

    setAiLoading(true)

    try {
      const result = await generateServiceDescription({
        service_name: form.service_name.trim(),
        business_type: businessType.trim() || undefined,
        price_range: form.price_range.trim() || undefined,
        duration_minutes: form.duration_minutes.trim() || undefined,
        tone: 'professional and friendly',
      })

      setForm((current) => ({ ...current, description: result.description }))
      setAiPreview({ short_summary: result.short_summary })

      if (result.fallbackUsed) {
        setAiNotice(
          result.message ||
            'A basic template was used because AI generation was unavailable. You can edit the text before saving.',
        )
      }
    } catch (error) {
      logAiError('serviceDescription', error)
      setAiError(formatAiError({ message: error.message }))
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const error = validateServiceForm(form)

    if (error) {
      setValidationError(error)
      return
    }

    setValidationError('')
    await onSubmit(form)
  }

  const formDisabled = loading || aiLoading

  return (
    <form className="auth-form service-form" onSubmit={handleSubmit}>
      <label>
        Service name *
        <input
          type="text"
          name="service_name"
          value={form.service_name}
          onChange={handleChange}
          required
          disabled={formDisabled}
        />
      </label>

      <div className="description-field">
        <div className="description-field-header">
          <span className="description-field-label">Description</span>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleGenerateDescription}
            disabled={formDisabled}
          >
            {aiLoading ? 'Generating...' : 'Generate Description'}
          </button>
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          disabled={formDisabled}
          aria-label="Description"
        />
        <FormAlert type="error" message={aiError} />
        <FormAlert type="success" message={aiNotice} />
        {aiLoading && (
          <p className="loading-text" role="status">
            Generating service description...
          </p>
        )}
        {aiPreview && (
          <div className="ai-preview-card">
            <p className="field-hint">Generated preview (not saved until you submit the form):</p>
            <p>
              <strong>Short summary:</strong> {aiPreview.short_summary}
            </p>
          </div>
        )}
      </div>

      <label>
        Price range
        <input
          type="text"
          name="price_range"
          value={form.price_range}
          onChange={handleChange}
          placeholder="e.g. $50-$100"
          disabled={formDisabled}
        />
      </label>

      <label>
        Duration (minutes)
        <input
          type="number"
          name="duration_minutes"
          value={form.duration_minutes}
          onChange={handleChange}
          min="1"
          placeholder="e.g. 60"
          disabled={formDisabled}
        />
      </label>

      <label>
        Recommended rebooking interval (days)
        <input
          type="number"
          name="recommended_interval_days"
          value={form.recommended_interval_days}
          onChange={handleChange}
          min="1"
          step="1"
          placeholder="e.g. 14"
          disabled={formDisabled}
        />
        <span className="field-hint">
          Optional: number of days before clients may want to book this service again.
        </span>
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
          disabled={formDisabled}
        />
        Service is active
      </label>

      {validationError && <FormAlert type="error" message={validationError} />}

      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={formDisabled}>
          {loading ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={formDisabled}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
