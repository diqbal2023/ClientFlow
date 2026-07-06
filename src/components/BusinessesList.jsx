import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from './EmptyState'
import FormAlert from './FormAlert'
import { getBrandGradient } from '../lib/businessProfile'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function BusinessesList() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .order('name', { ascending: true })

      setLoading(false)

      if (fetchError) {
        setError(getFriendlyError(fetchError, 'Could not load businesses.'))
        return
      }

      setBusinesses(data ?? [])
    }

    loadBusinesses()
  }, [])

  if (loading) {
    return <p className="loading-text">Loading businesses...</p>
  }

  if (error) {
    return <FormAlert type="error" message={error} />
  }

  if (businesses.length === 0) {
    return (
      <EmptyState message="No businesses are available yet. Check back after an admin creates a business profile." />
    )
  }

  return (
    <ul className="businesses-list">
      {businesses.map((business) => {
        const gradient = getBrandGradient(business)

        return (
          <li
            key={business.id}
            className="business-browse-card business-branded-card"
            style={{ background: gradient }}
          >
            {business.cover_image_url && (
              <img
                className="business-cover business-cover-on-brand"
                src={business.cover_image_url}
                alt={`${business.name} cover`}
              />
            )}

            <div className="business-browse-body">
              <div className="business-browse-header">
                {business.logo_url && (
                  <img
                    className="business-logo business-logo-on-brand"
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                  />
                )}
                <div>
                  <h3>{business.name}</h3>
                  <p className="business-type">{business.business_type || 'Business'}</p>
                </div>
              </div>

              <p>{business.description || 'No description provided.'}</p>

              <Link className="btn business-view-btn" to={`/client/business/${business.id}`}>
                View business
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
