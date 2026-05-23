import { useState } from 'react'
import './CreateClientModal.css'

// client prop = null → create mode | object → edit mode
function CreateClientModal({ onClose, onSubmit, client = null }) {
  const isEdit = client !== null

  const [form, setForm] = useState(
    isEdit
      ? {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone || '',
          sendVia: client.sendVia ?? 1,
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          sendVia: 1,
        }
  )

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Champ requis'
    if (!form.lastName.trim()) errs.lastName = 'Champ requis'
    if (!form.email.trim()) errs.email = 'Champ requis'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide'
    if (!form.phone.trim()) errs.phone = 'Champ requis'
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone))
      errs.phone = 'Numéro invalide'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'sendVia' ? Number(value) : value })
    if (errors[name]) setErrors({ ...errors, [name]: undefined })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Modifier le client' : 'Créer un client'}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Field
              label="Prénom"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="Ex: Karim"
            />
            <Field
              label="Nom"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Ex: Benali"
            />
          </div>

          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="client@example.com"
          />

          <Field
            label="Téléphone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+21622333444"
          />

          {/* send_via selector */}
          <div className="field">
            <label htmlFor="sendVia">Envoyer le code via</label>
            <select
              id="sendVia"
              name="sendVia"
              value={form.sendVia}
              onChange={handleChange}
              className="select-input"
            >
              <option value={1}>Email</option>
              <option value={2}>SMS</option>
            </select>
          </div>

          {!isEdit && (
            <div className="info-banner">
              <span className="info-icon">📧</span>
              <p>
                Un <strong>code d'accès généré automatiquement</strong> sera
                envoyé au client via le canal sélectionné.
              </p>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading
                ? isEdit
                  ? 'Enregistrement...'
                  : 'Création...'
                : isEdit
                ? 'Enregistrer'
                : 'Créer et envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
        autoComplete="off"
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default CreateClientModal
