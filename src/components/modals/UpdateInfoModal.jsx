import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { updateAdmin } from '../../services/admin.service'
import { getUser } from '../../services/auth.service'
import './UpdateInfoModal.css'

function UpdateInfoModal({ onClose, onUpdated }) {
    const { t } = useTranslation()

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
    if (!form.firstName.trim()) errs.firstName = t('common.required')
    if (!form.lastName.trim())  errs.lastName  = t('common.required')
    if (!form.email.trim()) {
      errs.email = t('common.required')
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = t('common.invalidEmail')
    }
    if (!form.phone.trim()) {
      errs.phone = t('common.required')
    } else {
      const clean = form.phone.replace(/\s/g, '')
      if (!/^(\+216)?[0-9]{8}$/.test(clean)) errs.phone = t('common.invalidPhone')

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
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

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
               <h2 className="modal-title">{t('updateInfoModal.title')}</h2>
              <p className="modal-subtitle">{t('updateInfoModal.subtitle')}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label={t('updateInfoModal.close')}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="modal-row">
            <Field label={t('updateInfoModal.firstName')} name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder={t('updateInfoModal.firstName')} />
            <Field label={t('updateInfoModal.lastName')}  name="lastName"  value={form.lastName}  onChange={handleChange} error={errors.lastName}  placeholder={t('updateInfoModal.lastName')} />
          </div>
           <Field label={t('updateInfoModal.email')} name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="email@example.com" />
          <Field label={t('updateInfoModal.phone')} name="phone" type="tel"   value={form.phone} onChange={handleChange} error={errors.phone} placeholder="22333444" />

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              {t('updateInfoModal.btnCancel')}
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? t('updateInfoModal.btnSaving') : t('updateInfoModal.btnSave')}
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