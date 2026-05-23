// src/components/modals/OrganisationFormModal.jsx
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
    () => getLogoUrl(initial?.logo_organisation)   // ← handles path normalisation
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const fileRef = useRef()

  // Revoke blob URL on unmount to avoid memory leaks
  useEffect(() => () => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
  }, [])

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name_organisation.trim()) {
      setError('Le nom est obligatoire.')
      return
    }

    const fd = new FormData()
    fd.append('name_organisation',    form.name_organisation.trim())
    fd.append('adresse_organisation', form.adresse_organisation.trim())
    fd.append('phone_organisation',   form.phone_organisation.trim())
    if (logoFile) fd.append('logo_organisation', logoFile)

    try {
      setLoading(true)
      await onSubmit(fd)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box org-form-modal">

        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {isEdit ? "✏️ Modifier l'organisation" : '🏢 Nouvelle organisation'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="org-form" noValidate>

          {/* Logo upload */}
          <div className="org-logo-upload" onClick={() => fileRef.current.click()}>
            {logoPreview
              ? <img
                  src={logoPreview}
                  alt="logo preview"
                  className="org-logo-preview"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              : <div className="org-logo-placeholder">
                  <span className="org-logo-icon">🏢</span>
                  <span>Cliquez pour ajouter un logo</span>
                </div>
            }
            <div className="org-logo-overlay">
              <span>📷 Changer</span>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />

          {/* Fields */}
          <div className="org-field">
            <label className="org-label">
              Nom de l'organisation <span className="required">*</span>
            </label>
            <input
              className="org-input"
              type="text"
              name="name_organisation"
              value={form.name_organisation}
              onChange={handleChange}
              placeholder="Ex: Société Générale"
            />
          </div>

          <div className="org-field">
            <label className="org-label">Adresse</label>
            <input
              className="org-input"
              type="text"
              name="adresse_organisation"
              value={form.adresse_organisation}
              onChange={handleChange}
              placeholder="Ex: 12 Rue de la Paix, Paris"
            />
          </div>

          <div className="org-field">
            <label className="org-label">Téléphone</label>
            <input
              className="org-input"
              type="text"
              name="phone_organisation"
              value={form.phone_organisation}
              onChange={handleChange}
              placeholder="Ex: +33 1 23 45 67 89"
            />
          </div>

          {error && <p className="org-error">{error}</p>}

          {/* Footer */}
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
