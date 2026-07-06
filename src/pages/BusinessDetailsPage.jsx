import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BusinessDetails from '../components/BusinessDetails'
import LogoutButton from '../components/LogoutButton'
import PageLayout from '../components/PageLayout'
import RequestForm from '../components/RequestForm'
import FormAlert from '../components/FormAlert'
import { getBrandPageBackground } from '../lib/businessProfile'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function BusinessDetailsPage() {
  const { businessId } = useParams()
  const location = useLocation()
  const suggestionState = location.state ?? {}
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [servicesError, setServicesError] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState(suggestionState.initialServiceId ?? '')

  useEffect(() => {
    if (suggestionState.initialServiceId) {
      setSelectedServiceId(suggestionState.initialServiceId)
    }
  }, [suggestionState.initialServiceId])

  useEffect(() => {
    async function loadBusinessDetails() {
      setLoading(true)
      setError('')
      setServicesError('')

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .maybeSingle()

      if (businessError) {
        setLoading(false)
        setError(getFriendlyError(businessError, 'Could not load this business.'))
        return
      }

      if (!businessData) {
        setLoading(false)
        setError('Business not found.')
        return
      }

      const { data: servicesData, error: fetchServicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      setLoading(false)

      if (fetchServicesError) {
        setBusiness(businessData)
        setServices([])
        setServicesError(getFriendlyError(fetchServicesError, 'Could not load services for this business.'))
        return
      }

      setBusiness(businessData)
      setServices(servicesData ?? [])
    }

    loadBusinessDetails()
  }, [businessId])

  return (
    <PageLayout>
      <main
        className="page page-wide business-details-page"
        style={business ? { background: getBrandPageBackground(business) } : undefined}
      >
        <Link className="back-link" to="/client">
          ← Back to businesses
        </Link>

        <h1>Business details</h1>

        {loading && <p className="loading-text">Loading business details...</p>}
        <FormAlert type="error" message={error} />
        <FormAlert type="error" message={servicesError} />

        {!loading && business && (
          <>
            <BusinessDetails
              business={business}
              services={services}
              onRequestService={setSelectedServiceId}
            />

            <RequestForm
              businessId={business.id}
              businessName={business.name}
              services={services}
              initialServiceId={selectedServiceId}
              initialRequestTitle={suggestionState.initialRequestTitle ?? ''}
              initialRequestDetails={suggestionState.initialRequestDetails ?? ''}
            />
          </>
        )}

        <div className="button-row">
          <Link className="btn btn-secondary" to="/client">
            Back to dashboard
          </Link>
          <LogoutButton />
        </div>
      </main>
    </PageLayout>
  )
}
