import { useTranslation } from 'react-i18next'
import './AdminDetailModal.css'

function AdminDetailModal({ admin, onClose }) {
  const { t } = useTranslation()
  if (!admin) return null

  const statusLabel = admin.status?.label ?? t('common.noData')
  const statusClass = admin.status?.code === 'actif' ? 'status-active' : 'status-pending'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box admin-detail-modal">
        <div className="modal-header">
          <h3 className="modal-title">{t('adminDetailModal.title')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-detail-body">
          <div className="admin-detail-avatar">
            <span>{admin.first_name?.[0]}{admin.last_name?.[0]}</span>
          </div>

          <div className="admin-detail-info">
            <div className="detail-row">
              <span className="detail-label">{t('adminDetailModal.fullName')}</span>
              <span className="detail-value">{admin.first_name} {admin.last_name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t('adminDetailModal.email')}</span>
              <span className="detail-value">{admin.email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t('adminDetailModal.status')}</span>
              <span className={`detail-value ${statusClass}`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  )
}

export default AdminDetailModal
