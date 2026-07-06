import { useCallback, useEffect, useState } from 'react'
import ServiceForm from './ServiceForm'
import ServicesList from './ServicesList'
import EmptyState from './EmptyState'
import FormAlert from './FormAlert'
import { formToServicePayload, serviceToForm } from '../lib/serviceProfile'
import { getFriendlyError } from '../lib/formUtils'
import { supabase } from '../lib/supabaseClient'

export default function ServicesManager({ business }) {
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingService, setEditingService] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadServices = useCallback(async () => {
    if (!business?.id) return

    setLoadingServices(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    setLoadingServices(false)

    if (fetchError) {
      setError(getFriendlyError(fetchError, 'Could not load services.'))
      return
    }

    setServices(data ?? [])
  }, [business?.id])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  async function handleCreate(form) {
    if (!business?.id) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: insertError } = await supabase.from('services').insert({
      business_id: business.id,
      ...formToServicePayload(form),
    })

    setSaving(false)

    if (insertError) {
      setError(getFriendlyError(insertError, 'Could not create this service.'))
      return
    }

    setShowCreateForm(false)
    setMessage('Service created successfully.')
    await loadServices()
  }

  async function handleUpdate(form) {
    if (!business?.id || !editingService?.id) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('services')
      .update(formToServicePayload(form))
      .eq('id', editingService.id)
      .eq('business_id', business.id)

    setSaving(false)

    if (updateError) {
      setError(getFriendlyError(updateError, 'Could not update this service.'))
      return
    }

    setEditingService(null)
    setMessage('Service updated successfully.')
    await loadServices()
  }

  async function handleDelete(service) {
    if (!business?.id) return

    const confirmed = window.confirm(
      `Delete the service "${service.name}"? This cannot be undone.`,
    )

    if (!confirmed) return

    setDeletingId(service.id)
    setMessage('')
    setError('')

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id)
      .eq('business_id', business.id)

    setDeletingId(null)

    if (deleteError) {
      setError(getFriendlyError(deleteError, 'Could not delete this service.'))
      return
    }

    setMessage('Service deleted successfully.')
    await loadServices()
  }

  if (!business) {
    return (
      <section className="business-section">
        <h2>Services</h2>
        <EmptyState message="Create your business profile before adding services." />
      </section>
    )
  }

  return (
    <section className="business-section">
      <h2>Services</h2>

      <FormAlert type="success" message={message} />
      <FormAlert type="error" message={error} />

      {loadingServices ? (
        <p className="loading-text">Loading services...</p>
      ) : (
        <>
          <ServicesList
            services={services}
            onEdit={(service) => {
              setShowCreateForm(false)
              setEditingService(service)
            }}
            onDelete={handleDelete}
            deletingId={deletingId}
          />

          {editingService ? (
            <>
              <p className="page-note">Editing: {editingService.name}</p>
              <ServiceForm
                initialValues={serviceToForm(editingService)}
                submitLabel="Save service"
                onSubmit={handleUpdate}
                onCancel={() => setEditingService(null)}
                loading={saving}
                businessType={business.business_type ?? ''}
              />
            </>
          ) : showCreateForm ? (
            <>
              <p className="page-note">Add a new service for your business.</p>
              <ServiceForm
                submitLabel="Add service"
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
                loading={saving}
                businessType={business.business_type ?? ''}
              />
            </>
          ) : (
            <div className="button-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditingService(null)
                  setShowCreateForm(true)
                }}
                disabled={saving || loadingServices}
              >
                Add service
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
