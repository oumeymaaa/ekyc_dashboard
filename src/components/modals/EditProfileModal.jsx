import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateProfile, setUser } from '../../services/auth.service'
import './EditProfileModal.css'

function EditProfileModal({ user, onClose, onUpdate }) {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = t('common.required')
    if (!form.last_name.trim())  errs.last_name  = t('common.required')
    if (!form.email.trim())      errs.email      = t('common.required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t('common.invalidEmail')
    if (!form.phone.trim())      errs.phone      = t('common.required')
    else if (!/^\d{8}$/.test(form.phone)) errs.phone = t('common.invalidPhone')
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const clean = name === 'phone' ? value.replace(/\D/g, '').slice(0, 8) : value
    setForm((prev) => ({ ...prev, [name]: clean }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    setStatus(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setStatus(null)
    try {
      const result = await updateProfile(form)
      setUser(result.user)
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès.' })
      if (onUpdate) onUpdate({ ...result.user })
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h2 className="modal-title">Modifier le profil</h2>
              <p className="modal-subtitle">Mettez à jour vos informations personnelles</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Prénom</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Votre prénom"
                value={form.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'input-error' : ''}
              />
              {errors.first_name && <span className="field-error">{errors.first_name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Nom</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Votre nom"
                value={form.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'input-error' : ''}
              />
              {errors.last_name && <span className="field-error">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="12345678"
              value={form.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          {status && (
            <p className={`form-msg form-msg--${status.type}`}>
              {status.type === 'success' ? '✅' : '⚠️'} {status.message}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
