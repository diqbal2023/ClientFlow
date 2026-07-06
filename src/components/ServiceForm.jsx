import { useState } from 'react'
import FormAlert from './FormAlert'
import { emptyServiceForm, validateServiceForm } from '../lib/serviceProfile'

export default function ServiceForm({
  initialValues = emptyServiceForm,
  submitLabel,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(initialValues)
  const [validationError, setValidationError] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
      </label>

      <label>
        Price range
        <input
          type="text"
          name="price_range"
          value={form.price_range}
          onChange={handleChange}
          placeholder="e.g. $50-$100"
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
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
        />
        Service is active
      </label>

      {validationError && <FormAlert type="error" message={validationError} />}

      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
