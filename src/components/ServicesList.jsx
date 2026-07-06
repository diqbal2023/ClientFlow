import EmptyState from './EmptyState'

export default function ServicesList({ services, onEdit, onDelete, deletingId }) {
  if (services.length === 0) {
    return <EmptyState message="No services yet. Add your first service below." />
  }

  return (
    <ul className="services-list">
      {services.map((service) => (
        <li key={service.id} className="service-card">
          <div className="service-card-header">
            <h3>{service.name}</h3>
            <span className={`status-badge${service.is_active ? ' is-active' : ''}`}>
              {service.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p>{service.description || 'No description provided.'}</p>

          <p>
            <strong>Price range:</strong> {service.price_range || 'Not set'}
          </p>
          <p>
            <strong>Duration:</strong>{' '}
            {service.duration_minutes ? `${service.duration_minutes} minutes` : 'Not set'}
          </p>

          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={() => onEdit(service)}>
              Edit
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onDelete(service)}
              disabled={deletingId === service.id}
            >
              {deletingId === service.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
