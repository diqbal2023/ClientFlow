import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BusinessProfileForm from '../components/BusinessProfileForm'
import BusinessProfileView from '../components/BusinessProfileView'
import LogoutButton from '../components/LogoutButton'
import PageLayout from '../components/PageLayout'
import ServicesManager from '../components/ServicesManager'
import AdminBookingRequests from '../components/AdminBookingRequests'
import EmptyState from '../components/EmptyState'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'
import { businessToForm, formToBusinessPayload } from '../lib/businessProfile'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const redirectMessage = location.state?.message

  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState('view')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadBusiness = useCallback(async () => {
    if (!profile?.id) return

    setLoadingBusiness(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', profile.id)
      .maybeSingle()

    setLoadingBusiness(false)

    if (fetchError) {
      setError(getFriendlyError(fetchError, 'Could not load your business profile.'))
      return
    }

    setBusiness(data)
    setMode(data ? 'view' : 'create')

    if (data?.id) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('name, description')
        .eq('business_id', data.id)
        .order('created_at', { ascending: false })

      setServices(serviceData ?? [])
    } else {
      setServices([])
    }
  }, [profile?.id])

  useEffect(() => {
    loadBusiness()
  }, [loadBusiness])

  async function handleCreate(form) {
    if (!profile?.id) return

    setSaving(true)
    setMessage('')
    setError('')

    const { data, error: insertError } = await supabase
      .from('businesses')
      .insert({
        owner_id: profile.id,
        ...formToBusinessPayload(form),
      })
      .select('*')
      .single()

    setSaving(false)

    if (insertError) {
      setError(getFriendlyError(insertError, 'Could not create your business profile.'))
      return
    }

    setBusiness(data)
    setMode('view')
    setMessage('Business profile created successfully.')
  }

  async function handleUpdate(form) {
    if (!profile?.id || !business?.id) return

    setSaving(true)
    setMessage('')
    setError('')

    const { data, error: updateError } = await supabase
      .from('businesses')
      .update(formToBusinessPayload(form))
      .eq('id', business.id)
      .eq('owner_id', profile.id)
      .select('*')
      .single()

    setSaving(false)

    if (updateError) {
      setError(getFriendlyError(updateError, 'Could not update your business profile.'))
      return
    }

    setBusiness(data)
    setMode('view')
    setMessage('Business profile updated successfully.')
    await loadBusiness()
  }

  async function handleDelete() {
    if (!profile?.id || !business?.id) return

    const confirmed = window.confirm(
      'Delete your business profile? Related services and booking requests will also be removed. This cannot be undone.',
    )

    if (!confirmed) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .eq('id', business.id)
      .eq('owner_id', profile.id)

    setSaving(false)

    if (deleteError) {
      setError(getFriendlyError(deleteError, 'Could not delete your business profile.'))
      return
    }

    setBusiness(null)
    setMode('create')
    setMessage('Business profile deleted.')
  }

  return (
    <PageLayout>
      <main className="page page-wide">
        <h1>Admin Dashboard</h1>
        <p className="page-subtitle">
          Welcome, {profile?.full_name || user?.email}. Manage your business profile below.
        </p>

        <FormAlert type="success" message={redirectMessage} />
        <FormAlert type="success" message={message} />
        <FormAlert type="error" message={error} />

        <section className="info-card">
          <p>
            <strong>Role:</strong> {profile?.role}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
        </section>

        <section className="business-section">
          <h2>Business profile</h2>

          {loadingBusiness ? (
            <p className="loading-text">Loading business profile...</p>
          ) : mode === 'create' ? (
            <>
              <EmptyState message="You do not have a business profile yet. Create one below to get started." />
              <BusinessProfileForm
                submitLabel="Create business profile"
                onSubmit={handleCreate}
                loading={saving}
                services={services}
              />
            </>
          ) : mode === 'edit' ? (
            <>
              <p className="page-note">Update your business profile details.</p>
              <BusinessProfileForm
                key={`${business.id}-${business.updated_at}`}
                initialValues={businessToForm(business)}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
                onCancel={() => setMode('view')}
                loading={saving}
                services={services}
              />
            </>
          ) : (
            <>
              <BusinessProfileView business={business} />
              <div className="button-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setMode('edit')}
                  disabled={saving}
                >
                  Edit profile
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? 'Working...' : 'Delete profile'}
                </button>
              </div>
            </>
          )}
        </section>

        <ServicesManager business={business} />

        <AdminBookingRequests business={business} />

        <div className="button-row">
          <Link className="btn btn-secondary" to="/">
            Back to home
          </Link>
          <LogoutButton />
        </div>
      </main>
    </PageLayout>
  )
}
