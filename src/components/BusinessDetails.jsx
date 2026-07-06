import { getBrandGradient } from '../lib/businessProfile'

export default function BusinessDetails({ business, services, onRequestService }) {
  const gradient = getBrandGradient(business)

  return (
    <section className="business-details business-branded-page" style={{ background: gradient }}>
      {business.cover_image_url && (
        <img
          className="business-cover business-cover-lg business-cover-on-brand"
          src={business.cover_image_url}
          alt={`${business.name} cover`}
        />
      )}

      <div className="business-branded-content">
        <div className="business-details-header">
          {business.logo_url && (
            <img
              className="business-logo business-logo-lg business-logo-on-brand"
              src={business.logo_url}
              alt={`${business.name} logo`}
            />
          )}
          <div>
            <h2>{business.name}</h2>
            <p className="business-type">{business.business_type || 'Business'}</p>
          </div>
        </div>

        <p>{business.description || 'No description provided.'}</p>

        <section className="business-section business-services-section-branded">
          <h3>Available services</h3>

          {services.length === 0 ? (
            <p className="page-note-branded">This business has no active services yet.</p>
          ) : (
            <ul className="services-list">
              {services.map((service) => (
                <li key={service.id} className="service-card service-card-on-brand">
                  <div className="service-card-header">
                    <h4>{service.name}</h4>
                    <span className="status-badge is-active">Active</span>
                  </div>
                  <p>{service.description || 'No description provided.'}</p>
                  <p>
                    <strong>Price range:</strong> {service.price_range || 'Not set'}
                  </p>
                  <p>
                    <strong>Duration:</strong>{' '}
                    {service.duration_minutes ? `${service.duration_minutes} minutes` : 'Not set'}
                  </p>
                  {onRequestService && (
                    <button
                      type="button"
                      className="btn business-view-btn"
                      onClick={() => onRequestService(service.id)}
                    >
                      Request this service
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
