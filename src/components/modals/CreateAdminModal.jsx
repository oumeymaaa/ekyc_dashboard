// src/components/modals/CreateAdminModal.jsx
import { useState, useEffect } from 'react'
import './CreateAdminModal.css'
import { getOrganisations } from '../../services/organisation.service'

// admin prop = null → create mode | object → edit mode
function CreateAdminModal({ onClose, onSubmit, admin = null }) {
  const isEdit = admin !== null

  const [form, setForm] = useState({
    firstName:      isEdit ? admin.firstName      : '',
    lastName:       isEdit ? admin.lastName       : '',
    email:          isEdit ? admin.email          : '',
    organisationId: isEdit ? String(admin.organisationId ?? '') : '',
    phone:          isEdit ? (admin.phone || '')  : '',
  })

  const [organisations, setOrganisations] = useState([])
  const [orgLoading,    setOrgLoading]    = useState(true)
  const [orgError,      setOrgError]      = useState('')

  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  // Load organisations for the select
  useEffect(() => {
    getOrganisations()
      .then(setOrganisations)
      .catch(() => setOrgError('Impossible de charger les organisations.'))
      .finally(() => setOrgLoading(false))
  }, [])

  /* ── Validation ─────────────────────────────────────────────────────────── */

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim())      errs.firstName      = 'Champ requis'
    if (!form.lastName.trim())       errs.lastName       = 'Champ requis'
    if (!form.email.trim())          errs.email          = 'Champ requis'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide'
    if (!form.organisationId)        errs.organisationId = 'Champ requis'

    if (!form.phone.trim()) {
      errs.phone = 'Champ requis'
    } else {
      const clean = form.phone.replace(/\s/g, '')
      if (!/^(\+216)?[0-9]{8}$/.test(clean))
        errs.phone = 'Numéro tunisien invalide (8 chiffres)'
    }
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
          <h2>{isEdit ? 'Modifier le compte admin' : 'Créer un compte admin'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>

          {/* First / Last name */}
          <div className="form-row">
            <Field
              label="Prénom" name="firstName" value={form.firstName}
              onChange={handleChange} error={errors.firstName} placeholder="Ex: Karim"
            />
            <Field
              label="Nom" name="lastName" value={form.lastName}
              onChange={handleChange} error={errors.lastName} placeholder="Ex: Benali"
            />
          </div>

          {/* Email */}
          <Field
            label="Email" name="email" type="email" value={form.email}
            onChange={handleChange} error={errors.email} placeholder="admin@example.com"
          />

          {/* Phone */}
          <Field
            label="Téléphone" name="phone" type="tel" value={form.phone}
            onChange={handleChange} error={errors.phone} placeholder="22333444"
          />

          {/* Organisation select */}
          <div className="field">
            <label htmlFor="organisationId">Organisation</label>

            {orgLoading ? (
              <div className="org-select-loading">Chargement des organisations...</div>
            ) : orgError ? (
              <div className="org-select-error">{orgError}</div>
            ) : (
              <select
                id="organisationId"
                name="organisationId"
                value={form.organisationId}
                onChange={handleChange}
                className={errors.organisationId ? 'input-error' : ''}
              >
                <option value="">— Sélectionner une organisation —</option>
                {organisations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name_organisation}
                  </option>
                ))}
              </select>
            )}

            {errors.organisationId && (
              <span className="field-error">{errors.organisationId}</span>
            )}
          </div>

          {/* Info banner (create only) */}
          {!isEdit && (
            <div className="info-banner">
              <span className="info-icon">📧</span>
              <p>
                Un <strong>mot de passe généré automatiquement</strong> et un{' '}
                <strong>lien d'activation</strong> seront envoyés par email à l'agent.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading
                ? isEdit ? 'Enregistrement...' : 'Création...'
                : isEdit ? 'Enregistrer' : "Créer et envoyer l'email"}
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

export default CreateAdminModal
