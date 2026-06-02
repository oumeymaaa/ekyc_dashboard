import { useState } from 'react'
import { updateAdmin } from '../../services/admin.service'
import { getUser } from '../../services/auth.service'
import './UpdateInfoModal.css'

function UpdateInfoModal({ onClose, onUpdated }) {
  const user = getUser()

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
    phone:     user?.phone     ?? '',
    //  organisationId: user?.organisation?.id ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Champ requis'
    if (!form.lastName.trim())  errs.lastName  = 'Champ requis'
    if (!form.email.trim()) {
      errs.email = 'Champ requis'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Email invalide'
    }
    if (!form.phone.trim()) {
      errs.phone = 'Champ requis'
    } else {
      const clean = form.phone.replace(/\s/g, '')
      if (!/^(\+216)?[0-9]{8}$/.test(clean)) {
        errs.phone = 'Numéro invalide (8 chiffres)'
      }
    }
    return errs
  }

  const handleChange = (e) => {
    let { name, value } = e.target
    if (name === 'phone') value = value.replace(/[^\d+ ]/g, '')
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    try {
      setLoading(true)
      const updated = await updateAdmin(user.id, form)
      // ✅ Show toast first, then close after a tick so React paints the toast
      onUpdated?.(updated)
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon modal-icon--purple">✏️</div>
            <div>
              <h2 className="modal-title">Modifier mes informations</h2>
              <p className="modal-subtitle">Mettez à jour vos informations personnelles</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="modal-row">
            <Field label="Prénom"  name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Prénom" />
            <Field label="Nom"     name="lastName"  value={form.lastName}  onChange={handleChange} error={errors.lastName}  placeholder="Nom" />
          </div>
          <Field label="Email"     name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="email@example.com" />
          <Field label="Téléphone" name="phone" type="tel"   value={form.phone} onChange={handleChange} error={errors.phone} placeholder="22333444" />

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div className="modal-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type}
        value={value} onChange={onChange}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
        autoComplete="off"
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default UpdateInfoModal