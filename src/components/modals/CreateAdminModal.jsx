// src/components/modals/CreateAdminModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import './CreateAdminModal.css'
import { getOrganisations } from '../../services/organisation.service'

// admin prop = null → create mode | object → edit mode
function CreateAdminModal({ onClose, onSubmit, admin = null }) {
  const { t } = useTranslation()
  const isEdit = admin !== null

  const [form, setForm] = useState({
    firstName: isEdit ? admin.firstName : '',
    lastName: isEdit ? admin.lastName : '',
    email: isEdit ? admin.email : '',
    organisationId: isEdit ? String(admin.organisationId ?? '') : '',
    phone: isEdit ? (admin.phone || '') : '',
  })

  const [organisations, setOrganisations] = useState([])
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgError, setOrgError] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Load organisations for the select (only those without an admin)
  useEffect(() => {
    getOrganisations()
      .then((data) => {
        const orgs = Array.isArray(data) ? data : []
        // In create mode: show only orgs without an admin
        // In edit mode: show all orgs
        const filtered = isEdit ? orgs : orgs.filter((o) => !o.admin)
        setOrganisations(filtered)
      })
      .catch(() => setOrgError(t('createAdminModal.orgError')))
      .finally(() => setOrgLoading(false))
  }, [])

  /* ── Validation ─────────────────────────────────────────────────────────── */

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = t('common.required')
    if (!form.lastName.trim()) errs.lastName = t('common.required')
    if (!form.email.trim()) errs.email = t('common.required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t('common.invalidEmail')
    if (!form.organisationId) errs.organisationId = t('common.required')

    if (!form.phone.trim()) {
      errs.phone = t('common.required')
    } else {
      const clean = form.phone.replace(/\s/g, '')
      if (!/^(\+216)?[0-9]{8}$/.test(clean)) errs.phone = t('common.invalidPhone')

      return errs
    }

    /* ── Handlers ───────────────────────────────────────────────────────────── */

    const handleChange = (e) => {
      let { name, value } = e.target
      if (name === 'phone') value = value.replace(/[^\d+ ]/g, '')
      setForm((f) => ({ ...f, [name]: value }))
      if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errs = validate()
      if (Object.keys(errs).length) { setErrors(errs); return }
      setLoading(true)
      await onSubmit(form)
      setLoading(false)
    }

    /* ── Render ─────────────────────────────────────────────────────────────── */

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="modal-header">
            <h2>{isEdit ? t('createAdminModal.titleEdit') : t('createAdminModal.titleCreate')}</h2>
            <button className="modal-close" onClick={onClose} aria-label={t('createAdminModal.close')}>✕</button>
          </div>

          {/* Form */}
          <form className="modal-form" onSubmit={handleSubmit} noValidate>

            {/* First / Last name */}
            <div className="form-row">
              <Field label={t('createAdminModal.firstName')} name="firstName" value={form.firstName}
                onChange={handleChange} error={errors.firstName} placeholder="Ex: Karim" />
              <Field label={t('createAdminModal.lastName')} name="lastName" value={form.lastName}
                onChange={handleChange} error={errors.lastName} placeholder="Ex: Benali" />

            </div>

            {/* Email */}
            <Field label={t('createAdminModal.email')} name="email" type="email" value={form.email}
              onChange={handleChange} error={errors.email} placeholder="admin@example.com" />

            {/* Phone */}
            <Field label={t('createAdminModal.phone')} name="phone" type="tel" value={form.phone}
              onChange={handleChange} error={errors.phone} placeholder="22333444" />

            {/* Organisation select */}
            <div className="field">
              <label htmlFor="organisationId">{t('createAdminModal.organisation')}</label>

              {orgLoading ? (
                <div className="org-select-loading">{t('createAdminModal.orgLoading')}</div>
              ) : organisations.length === 0 && !isEdit ? (
                <div className="org-select-error">
                  Toutes les organisations ont déjà un administrateur.
                </div>
              ) : orgError ? (
                <div className="org-select-error">{orgError}</div>
              ) : (
                <select
                  id="organisationId" name="organisationId"
                  value={form.organisationId} onChange={handleChange}

                  className={errors.organisationId ? 'input-error' : ''}
                >
                  <option value="">{t('createAdminModal.orgSelect')}</option>
                  {organisations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name_organisation}</option>

                  ))}
                </select>
              )}
              {errors.organisationId && <span className="field-error">{errors.organisationId}</span>}

            </div>

            {/* Info banner (create only) */}
            {!isEdit && (
              <div className="info-banner">
                <span className="info-icon">📧</span>
                <p>{t('createAdminModal.infoBanner')}</p>

              </div>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                {t('createAdminModal.btnCancel')}
              </button>
              <button type="submit" className="btn-create" disabled={loading}>
                {loading
                  ? (isEdit ? t('createAdminModal.btnSaving') : t('createAdminModal.btnCreating'))
                  : (isEdit ? t('createAdminModal.btnSave') : t('createAdminModal.btnCreate'))}
              </button>
            </div>

          </form>
        </div>
      </div>
    )
  }

  /* ── Field component ──────────────────────────────────────────────────────── */

  function Field({ label, name, type = 'text', value, onChange, error, placeholder }) {
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          className={error ? 'input-error' : ''}
          autoComplete="off"
        />
        {error && <span className="field-error">{error}</span>}
      </div>
    )
  }
}
  export default CreateAdminModal
