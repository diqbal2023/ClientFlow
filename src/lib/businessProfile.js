const DEFAULT_BRAND_COLOR = '#6366f1'

export const BRAND_COLOR_PRESETS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Coral', value: '#f97316' },
]

export const emptyBusinessForm = {
  business_name: '',
  business_type: '',
  description: '',
  brand_color: DEFAULT_BRAND_COLOR,
  brand_color_2: '',
  brand_color_3: '',
  logo_url: '',
  cover_image_url: '',
}

export function getBusinessBrandColors(business) {
  if (!business) {
    return [DEFAULT_BRAND_COLOR]
  }

  const colors = [business.brand_color, business.brand_color_2, business.brand_color_3]
    .map((color) => color?.trim())
    .filter(Boolean)

  return colors.length > 0 ? colors : [DEFAULT_BRAND_COLOR]
}

export function getBrandGradient(business) {
  const colors = getBusinessBrandColors(business)

  if (colors.length === 1) {
    return colors[0]
  }

  if (colors.length === 2) {
    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
  }

  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
}

export function getBrandPageBackground(business) {
  const colors = getBusinessBrandColors(business)
  const first = colors[0]
  const second = colors[1] || first
  const third = colors[2] || second

  return `linear-gradient(180deg, ${first} 0%, ${second} 42%, ${third} 72%, #ffffff 100%)`
}

export function businessToForm(business) {
  return {
    business_name: business.name ?? '',
    business_type: business.business_type ?? '',
    description: business.description ?? '',
    brand_color: business.brand_color || DEFAULT_BRAND_COLOR,
    brand_color_2: business.brand_color_2 ?? '',
    brand_color_3: business.brand_color_3 ?? '',
    logo_url: business.logo_url ?? '',
    cover_image_url: business.cover_image_url ?? '',
  }
}

export function formToBusinessPayload(form) {
  return {
    name: form.business_name.trim(),
    business_type: form.business_type.trim(),
    description: form.description.trim() || null,
    brand_color: form.brand_color.trim() || DEFAULT_BRAND_COLOR,
    brand_color_2: form.brand_color_2?.trim() || null,
    brand_color_3: form.brand_color_3?.trim() || null,
    logo_url: form.logo_url.trim() || null,
    cover_image_url: form.cover_image_url.trim() || null,
    updated_at: new Date().toISOString(),
  }
}

function isValidOptionalUrl(value) {
  if (!value?.trim()) {
    return true
  }

  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateBusinessForm(form) {
  if (!form.business_name.trim()) {
    return 'Business name is required.'
  }

  if (!form.business_type.trim()) {
    return 'Business type is required.'
  }

  if (!isValidOptionalUrl(form.logo_url)) {
    return 'Logo URL must be a valid http or https link, or left blank.'
  }

  if (!isValidOptionalUrl(form.cover_image_url)) {
    return 'Cover image URL must be a valid http or https link, or left blank.'
  }

  return ''
}

export function formToGradientPreviewBusiness(form) {
  return {
    brand_color: form.brand_color,
    brand_color_2: form.brand_color_2,
    brand_color_3: form.brand_color_3,
  }
}

export { DEFAULT_BRAND_COLOR }
