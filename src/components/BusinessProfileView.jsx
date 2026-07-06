import BrandGradientPreview from './BrandGradientPreview'

export default function BusinessProfileView({ business }) {
  return (
    <section className="info-card business-view">
      <BrandGradientPreview business={business} tall />

      <p>
        <strong>Business name:</strong> {business.name}
      </p>
      <p>
        <strong>Business type:</strong> {business.business_type || 'Not set'}
      </p>
      <p>
        <strong>Description:</strong> {business.description || 'No description yet.'}
      </p>
      {business.logo_url && (
        <p>
          <strong>Logo URL:</strong>{' '}
          <a href={business.logo_url} target="_blank" rel="noreferrer">
            {business.logo_url}
          </a>
        </p>
      )}
      {business.cover_image_url && (
        <p>
          <strong>Cover image URL:</strong>{' '}
          <a href={business.cover_image_url} target="_blank" rel="noreferrer">
            {business.cover_image_url}
          </a>
        </p>
      )}
    </section>
  )
}
