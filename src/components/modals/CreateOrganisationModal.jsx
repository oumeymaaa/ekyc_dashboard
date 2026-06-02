import { useState, useEffect, useRef } from 'react'
import './CreateOrganisationModal.css'
import { getLogoUrl } from '../../services/organisation.service'

function CreateOrganisationModal({ mode, initial, onClose, onSubmit }) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    name_organisation:    initial?.name_organisation    ?? '',
    adresse_organisation: initial?.adresse_organisation ?? '',
    phone_organisation:   initial?.phone_organisation   ?? '',
  })
  const [logoFile,    setLogoFile]    = useState(null)
  const [logoPreview, setLogoPreview] = useState(
    () => getLogoUrl(initial?.logo_organisation)
  )
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const fileRef = useRef()

  useEffect(() => () => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
  }, [])

  const validate = () => {
    const errs = {}

    // ✅ Logo required
    if (!logoFile && !logoPreview) {
      errs.logo = 'Le logo est obligatoire.'
    }

    // ✅ Nom required
    if (!form.name_organisation.trim()) {
      errs.name_organisation = 'Le nom est obligatoire.'
    } else if (form.name_organisation.trim().length < 2) {
      errs.name_organisation = 'Le nom doit contenir au moins 2 caractères.'
    }

    // ✅ Adresse required
    if (!form.adresse_organisation.trim()) {
      errs.adresse_organisation = "L'adresse est obligatoire."
    } else if (form.adresse_organisation.trim().length < 5) {
      errs.adresse_organisation = "L'adresse doit contenir au moins 5 caractères."
    }

    // ✅ Téléphone required
    if (!form.phone_organisation.trim()) {
      errs.phone_organisation = 'Le téléphone est obligatoire.'
    } else {
      const clean = form.phone_organisation.replace(/\s/g, '')
       if (!/^(\+216)?[0-9]{8}$/.test(clean)) {
        errs.phone_organisation = 'Numéro invalide (8 chiffres)'
      }
    }

    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, logo: 'Le fichier doit être une image.' }))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "L'image ne doit pas dépasser 2 Mo." }))
      return
    }
    setErrors((prev) => ({ ...prev, logo: undefined }))
    setLogoFile(file)
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const fd = new FormData()
    fd.append('name_organisation',    form.name_organisation.trim())
    fd.append('adresse_organisation', form.adresse_organisation.trim())
    fd.append('phone_organisation',   form.phone_organisation.trim())
    if (logoFile) fd.append('logo_organisation', logoFile)

    try {
      setLoading(true)
      await onSubmit(fd)
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Une erreur est survenue.' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box org-form-modal">

        <div className="modal-header">
          <h3 className="modal-title">
            {isEdit ? "✏️ Modifier l'organisation" : '🏢 Nouvelle organisation'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="org-form" noValidate>

          {/* Logo */}
          <div
            className={`org-logo-upload ${errors.logo ? 'org-logo-upload--error' : ''}`}
            onClick={() => fileRef.current.click()}
          >
            {logoPreview
              ? <img src={logoPreview} alt="logo preview" className="org-logo-preview"
                  onError={(e) => { e.currentTarget.style.display = 'none' }} />
              : <div className="org-logo-placeholder">
                  <span className="org-logo-icon">🏢</span>
                  <span>Cliquez pour ajouter un logo <span className="required">*</span></span>
                </div>
            }
            <div className="org-logo-overlay"><span>📷 Changer</span></div>
          </div>
          {errors.logo && <span className="field-error">{errors.logo}</span>}

          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleFile} />

          {/* Nom */}
          <div className="org-field">
            <label className="org-label">
              Nom de l'organisation <span className="required">*</span>
            </label>
            <input
              className={`org-input ${errors.name_organisation ? 'input-error' : ''}`}
              type="text" name="name_organisation"
              value={form.name_organisation} onChange={handleChange}
              placeholder="Ex: Société Générale"
            />
            {errors.name_organisation && <span className="field-error">{errors.name_organisation}</span>}
          </div>

          {/* Adresse */}
          <div className="org-field">
            <label className="org-label">
              Adresse <span className="required">*</span>
            </label>
            <input
              className={`org-input ${errors.adresse_organisation ? 'input-error' : ''}`}
              type="text" name="adresse_organisation"
              value={form.adresse_organisation} onChange={handleChange}
              placeholder="Ex: 12 Rue de la Paix, Paris"
            />
            {errors.adresse_organisation && <span className="field-error">{errors.adresse_organisation}</span>}
          </div>

          {/* Téléphone */}
          <div className="org-field">
            <label className="org-label">
              Téléphone <span className="required">*</span>
            </label>
            <input
              className={`org-input ${errors.phone_organisation ? 'input-error' : ''}`}
              type="tel" name="phone_organisation"
              value={form.phone_organisation} onChange={handleChange}
              placeholder="Ex: +21622333444"
            />
            {errors.phone_organisation && <span className="field-error">{errors.phone_organisation}</span>}
          </div>

          {errors.submit && <p className="org-error">{errors.submit}</p>}

          <div className="org-form-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateOrganisationModal