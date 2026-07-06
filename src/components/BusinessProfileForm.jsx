import { useEffect, useState } from 'react'
import FormAlert from './FormAlert'
import BrandGradientPreview from './BrandGradientPreview'
import {
  BRAND_COLOR_PRESETS,
  DEFAULT_BRAND_COLOR,
  emptyBusinessForm,
  formToGradientPreviewBusiness,
  validateBusinessForm,
} from '../lib/businessProfile'

const OPTIONAL_COLOR_PLACEHOLDER = '#94a3b8'

function ColorPickerField({ label, name, value, onChange, onClear, optional = false }) {
  const displayColor = value || (optional ? OPTIONAL_COLOR_PLACEHOLDER : DEFAULT_BRAND_COLOR)

  return (
    <div className="brand-color-slot">
      <label className="brand-color-picker-label">
        {label}
        <div className="brand-color-picker-row">
          <input
            type="color"
            name={name}
            value={displayColor}
            onChange={onChange}
            aria-label={label}
          />
          <span
            className="brand-color-swatch brand-color-swatch-lg"
            style={{ backgroundColor: displayColor }}
            aria-hidden="true"
          />
        </div>
      </label>
      {optional && value && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}

export default function BusinessProfileForm({
  initialValues = emptyBusinessForm,
  submitLabel,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(initialValues)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setForm(initialValues)
    setValidationError('')
  }, [initialValues])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handlePresetColor(value) {
    setForm((current) => ({ ...current, brand_color: value }))
  }

  function handleColorChange(fieldName, value) {
    setForm((current) => ({ ...current, [fieldName]: value }))
  }

  function clearColor(fieldName) {
    setForm((current) => ({ ...current, [fieldName]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const error = validateBusinessForm(form)

    if (error) {
      setValidationError(error)
      return
    }

    setValidationError('')
    await onSubmit(form)
  }

  return (
    <form className="auth-form business-form" onSubmit={handleSubmit} noValidate>
      <label>
        Business name *
        <input
          type="text"
          name="business_name"
          value={form.business_name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </label>

      <label>
        Business type *
        <input
          type="text"
          name="business_type"
          value={form.business_type}
          onChange={handleChange}
          placeholder="e.g. Salon, Consulting, Fitness"
          required
          disabled={loading}
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          disabled={loading}
        />
      </label>

      <fieldset className="brand-color-fieldset">
        <legend>Brand colors (up to 3)</legend>
        <p className="field-hint">
          Pick 1 to 3 colors. They blend into a gradient on your business card and client page.
        </p>

        <BrandGradientPreview business={formToGradientPreviewBusiness(form)} tall />

        <p className="field-hint">Color 1 presets</p>
        <div className="brand-color-presets" role="group" aria-label="Primary brand color presets">
          {BRAND_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`brand-color-preset${form.brand_color === preset.value ? ' is-selected' : ''}`}
              onClick={() => handlePresetColor(preset.value)}
              aria-pressed={form.brand_color === preset.value}
              disabled={loading}
            >
              <span
                className="brand-color-swatch"
                style={{ backgroundColor: preset.value }}
                aria-hidden="true"
              />
              {preset.label}
            </button>
          ))}
        </div>

        <ColorPickerField
          label="Color 1 *"
          name="brand_color"
          value={form.brand_color}
          onChange={(event) => handleColorChange('brand_color', event.target.value)}
        />

        <ColorPickerField
          label="Color 2 (optional)"
          name="brand_color_2"
          value={form.brand_color_2}
          onChange={(event) => handleColorChange('brand_color_2', event.target.value)}
          onClear={() => clearColor('brand_color_2')}
          optional
        />

        <ColorPickerField
          label="Color 3 (optional)"
          name="brand_color_3"
          value={form.brand_color_3}
          onChange={(event) => handleColorChange('brand_color_3', event.target.value)}
          onClear={() => clearColor('brand_color_3')}
          optional
        />
      </fieldset>

      <label>
        Logo URL
        <input
          type="text"
          name="logo_url"
          inputMode="url"
          value={form.logo_url}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
          disabled={loading}
        />
      </label>

      <label>
        Cover image URL
        <input
          type="text"
          name="cover_image_url"
          inputMode="url"
          value={form.cover_image_url}
          onChange={handleChange}
          placeholder="https://example.com/cover.png"
          disabled={loading}
        />
      </label>

      <FormAlert type="error" message={validationError} />

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
