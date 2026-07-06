export const emptyServiceForm = {
  service_name: '',
  description: '',
  price_range: '',
  duration_minutes: '',
  is_active: true,
}

export function serviceToForm(service) {
  return {
    service_name: service.name ?? '',
    description: service.description ?? '',
    price_range: service.price_range ?? '',
    duration_minutes:
      service.duration_minutes != null ? String(service.duration_minutes) : '',
    is_active: service.is_active ?? true,
  }
}

export function formToServicePayload(form) {
  const duration = form.duration_minutes.trim()

  return {
    name: form.service_name.trim(),
    description: form.description.trim() || null,
    price_range: form.price_range.trim() || null,
    duration_minutes: duration ? Number(duration) : null,
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

  return ''
}
