import { useState } from 'react'
import './CreateClientModal.css'

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
          lastName:  '',
          email:     '',
          phone:     '',
          sendVia:   1,
        }
  )

  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Champ requis'
    if (!form.lastName.trim())  errs.lastName  = 'Champ requis'
    if (!form.email.trim())     errs.email     = 'Champ requis'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide'

    // ✅ digits only, exactly 8
    if (!form.phone.trim()) {
      errs.phone = 'Champ requis'
    } else if (!/^\d{8}$/.test(form.phone)) {
      errs.phone = 'Numéro invalide (8 chiffres)'
    }

    return errs
  }

  const handleChange = (e) => {
    let { name, value } = e.target

    // ✅ strip anything that isn't a digit for phone
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 8)
    }
    setForm({ ...form, [name]: name === 'sendVia' ? Number(value) : value })
    if (errors[name]) setErrors({ ...errors, [name]: undefined })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Modifier le client' : 'Créer un client'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Field label="Prénom"  name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Ex: Karim" />
            <Field label="Nom"     name="lastName"  value={form.lastName}  onChange={handleChange} error={errors.lastName}  placeholder="Ex: Benali" />
          </div>

          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="client@example.com" />

          {/* ✅ type="tel", maxLength enforced via handleChange */}
          <Field
            label="Téléphone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="22333444"
            maxLength={8}
          />

          <div className="field">
            <label htmlFor="sendVia">Envoyer le code via</label>
            <select id="sendVia" name="sendVia" value={form.sendVia} onChange={handleChange} className="select-input">
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
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading
                ? isEdit ? 'Enregistrement...' : 'Création...'
                : isEdit ? 'Enregistrer'        : 'Créer et envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, maxLength }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type}
        value={value} onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={error ? 'input-error' : ''}
        autoComplete="off"
        inputMode={type === 'tel' ? 'numeric' : undefined}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default CreateClientModal