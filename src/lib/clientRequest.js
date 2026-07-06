export const emptyRequestForm = {
  request_title: '',
  request_details: '',
  preferred_date: '',
  service_id: '',
}

export function requestToForm(request) {
  return {
    request_title: request.request_title ?? '',
    request_details: request.request_details ?? request.client_message ?? '',
    preferred_date: request.preferred_date ?? '',
    service_id: request.service_id ?? '',
  }
}

export function formToRequestPayload(form, { clientId, businessId, status = 'pending' }) {
  const details = form.request_details.trim()

  return {
    client_id: clientId,
    business_id: businessId,
    service_id: form.service_id || null,
    status,
    request_title: form.request_title.trim(),
    request_details: details,
    preferred_date: form.preferred_date || null,
    client_message: details,
    updated_at: new Date().toISOString(),
  }
}

export function formToRequestUpdatePayload(form) {
  const details = form.request_details.trim()

  return {
    service_id: form.service_id || null,
    request_title: form.request_title.trim(),
    request_details: details,
    preferred_date: form.preferred_date || null,
    client_message: details,
    updated_at: new Date().toISOString(),
  }
}

export function validateRequestForm(form, { businessId, clientId } = {}) {
  if (!form.request_title.trim()) {
    return 'Request title is required.'
  }

  if (!form.request_details.trim()) {
    return 'Request details are required.'
  }

  if (!businessId) {
    return 'A business must be selected before submitting a request.'
  }

  if (!clientId) {
    return 'You must be logged in as a client to submit a request.'
  }

  return ''
}

export const ADMIN_BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
]

export function formatRequestStatus(status) {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    canceled: 'Canceled',
    reviewed: 'Confirmed',
    in_progress: 'Confirmed',
  }

  return labels[status] ?? status
}

export function formatRequestDate(dateString) {
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleString()
}
