import { useTranslation } from 'react-i18next'
import './OrganisationDetailModal.css'

const BASE_URL = import.meta.env.VITE_API_URL

function OrganisationDetailModal({ organisation, onClose, onEdit, onDelete }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  const logoSrc = organisation.logo_url
    ? `${BASE_URL}${organisation.logo_url}`
    : null

  const fmt = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit', month: 'long', year: 'numeric',
    }) : '—'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box org-detail-modal">

        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{t('organisationDetailModal.title')}</h3>
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
            </div>
          </div>

          <div className="org-detail-divider" />

          {/* Info grid */}
          <div className="org-detail-grid">
            <div className="org-detail-field">
              <span className="org-detail-label">{t('organisationDetailModal.address')}</span>
              <span className="org-detail-value">{organisation.adresse_organisation || '—'}</span>
            </div>
            <div className="org-detail-field">
              <span className="org-detail-label">{t('organisationDetailModal.phone')}</span>
              <span className="org-detail-value">{organisation.phone_organisation || '—'}</span>
            </div>
            <div className="org-detail-field">
              <span className="org-detail-label">{t('organisationDetailModal.createdAt')}</span>
              <span className="org-detail-value">{fmt(organisation.created_at)}</span>
            </div>
            <div className="org-detail-field">
              <span className="org-detail-label">{t('organisationDetailModal.updatedAt')}</span>
              <span className="org-detail-value">{fmt(organisation.updated_at)}</span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="org-detail-footer">
          <button className="btn-delete-outline" onClick={onDelete}>
            {t('organisationDetailModal.btnDelete')}
          </button>
          <div className="org-detail-footer-right">
            <button className="btn-cancel" onClick={onClose}>
              {t('organisationDetailModal.btnClose')}
            </button>
            <button className="btn-submit" onClick={onEdit}>
              {t('organisationDetailModal.btnEdit')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default OrganisationDetailModal
