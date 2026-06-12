import './AdminDetailModal.css'

function AdminDetailModal({ admin, onClose }) {
  if (!admin) return null

  const statusLabel = admin.status?.label ?? 'Inconnu'
  const statusClass = admin.status?.code === 'actif' ? 'status-active' : 'status-pending'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box admin-detail-modal">
        <div className="modal-header">
          <h3 className="modal-title">👤 Détails de l'administrateur</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-detail-body">
          <div className="admin-detail-avatar">
            <span>{admin.first_name?.[0]}{admin.last_name?.[0]}</span>
          </div>

          <div className="admin-detail-info">
            <div className="detail-row">
              <span className="detail-label">Nom complet</span>
              <span className="detail-value">{admin.first_name} {admin.last_name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{admin.email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Statut</span>
              <span className={`detail-value ${statusClass}`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default AdminDetailModal
