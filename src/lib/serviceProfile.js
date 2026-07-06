export const emptyServiceForm = {
  service_name: '',
  description: '',
  price_range: '',
  duration_minutes: '',
  recommended_interval_days: '',
  is_active: true,
}

export function serviceToForm(service) {
  return {
    service_name: service.name ?? '',
    description: service.description ?? '',
    price_range: service.price_range ?? '',
    duration_minutes:
      service.duration_minutes != null ? String(service.duration_minutes) : '',
    recommended_interval_days:
      service.recommended_interval_days != null
        ? String(service.recommended_interval_days)
        : '',
    is_active: service.is_active ?? true,
  }
}

export function formToServicePayload(form) {
  const duration = form.duration_minutes.trim()
  const interval = form.recommended_interval_days.trim()

  return {
    name: form.service_name.trim(),
    description: form.description.trim() || null,
    price_range: form.price_range.trim() || null,
    duration_minutes: duration ? Number(duration) : null,
    recommended_interval_days: interval ? Number(interval) : null,
    is_active: Boolean(form.is_active),
    updated_at: new Date().toISOString(),
  }
}

export function validateServiceForm(form) {
  if (!form.service_name.trim()) {
    return 'Service name is required.'
  }

  const duration = form.duration_minutes.trim()

  if (duration) {
    const minutes = Number(duration)

    if (!Number.isFinite(minutes) || minutes <= 0) {
      return 'Duration must be a positive number of minutes.'
    }
  }

  const interval = form.recommended_interval_days.trim()

  if (interval) {
    const days = Number(interval)

    if (!Number.isFinite(days) || days <= 0 || !Number.isInteger(days)) {
      return 'Recommended rebooking interval must be a positive whole number of days.'
    }
  }

  return ''
}
