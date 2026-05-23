// src/components/modals/OrganisationDetailModal.jsx
import './OrganisationDetailModal.css'

const BASE_URL = 'http://localhost:3000'

/**
 * Props:
 *   organisation – Organisation object
 *   onClose      – () => void
 *   onEdit       – () => void   (switches to edit modal)
 *   onDelete     – () => void   (triggers delete confirmation)
 */
function OrganisationDetailModal({ organisation, onClose, onEdit, onDelete }) {
  const logoSrc = organisation.logo_organisation
    ? `${BASE_URL}/${organisation.logo_organisation}`
    : null

  const fmt = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    }) : '—'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box org-detail-modal">

        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">🏢 Détails de l'organisation</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="org-detail-body">

          {/* Logo + name hero */}
          <div className="org-detail-hero">
            {logoSrc
              ? <img src={logoSrc} alt="logo" className="org-detail-logo" />
              : <div className="org-detail-avatar">
                  {organisation.name_organisation?.[0]?.toUpperCase() ?? '?'}
                </div>
            }
            <div>
              <p className="org-detail-name">{organisation.name_organisation}</p>
              <p className="org-detail-id">ID #{organisation.id}</p>
            </div>
          </div>

          <div className="org-detail-divider" />

          {/* Info grid */}
          <div className="org-detail-grid">
            <div className="org-detail-field">
              <span className="org-detail-label">📍 Adresse</span>
              <span className="org-detail-value">
                {organisation.adresse_organisation || '—'}
              </span>
            </div>
            <div className="org-detail-field">
              <span className="org-detail-label">📞 Téléphone</span>
              <span className="org-detail-value">
                {organisation.phone_organisation || '—'}
              </span>
            </div>
            <div className="org-detail-field">
              <span className="org-detail-label">📅 Créée le</span>
              <span className="org-detail-value">{fmt(organisation.created_at)}</span>
            </div>
            <div className="org-detail-field">
              <span className="org-detail-label">🔄 Mise à jour</span>
              <span className="org-detail-value">{fmt(organisation.updated_at)}</span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="org-detail-footer">
          <button className="btn-delete-outline" onClick={onDelete}>
            🗑️ Supprimer
          </button>
          <div className="org-detail-footer-right">
            <button className="btn-cancel" onClick={onClose}>Fermer</button>
            <button className="btn-submit" onClick={onEdit}>✏️ Modifier</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default OrganisationDetailModal
