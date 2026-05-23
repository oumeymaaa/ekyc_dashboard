// src/pages/AdminList/AdminList.jsx
import { useEffect, useState } from 'react'
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../services/admin.service'
import CreateAdminModal from '../../components/modals/CreateAdminModal'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import './AdminList.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === 'active' ? '● Actif' : '○ En attente'}
    </span>
  )
}

function AdminList({ onNavigate, onViewStats, onLogout }) {
  const [admins,    setAdmins]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [busyId,    setBusyId]    = useState(null)
  const [toast,     setToast]     = useState(null)

  useEffect(() => {
    getAdmins().then(setAdmins).finally(() => setLoading(false))
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleCreate = async (formData) => {
    try {
      await createAdmin(formData)
      const updated = await getAdmins()
      setAdmins(updated)
      setModal(null)
      showToast('Compte admin créé et email envoyé.')
    } catch (err) {
      setModal(null)
      showToast(err.message || 'Erreur lors de la création.', 'error')
    }
  }

  const handleUpdate = async (formData) => {
    const { id } = modal.admin
    try {
      const updated = await updateAdmin(id, formData)
      setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
      setModal(null)
      showToast(`Compte de ${updated.firstName} ${updated.lastName} mis à jour.`)
    } catch (err) {
      setModal(null)
      showToast(err.message || 'Erreur lors de la mise à jour.', 'error')
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    try {
      await deleteAdmin(id)
      setAdmins((prev) => prev.filter((a) => a.id !== id))
      showToast('Compte admin supprimé.')
    } catch (err) {
      showToast(err.message || 'Erreur lors de la suppression.', 'error')
    } finally {
      setBusyId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="admin-page">
      <Sidebar activePage="admins" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Gestion des admins</h1>
            <p className="page-subtitle">
              {loading ? '—' : `${admins.length} compte${admins.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setModal({ mode: 'create' })}>
            + Créer un admin
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="state-center">
              <div className="spinner" />
              <p>Chargement...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="state-center">
              <div className="empty-icon">👤</div>
              <p className="empty-title">Aucun admin trouvé</p>
              <p className="empty-sub">Créez le premier compte admin pour commencer.</p>
              <button className="btn-primary" onClick={() => setModal({ mode: 'create' })}>
                + Créer un admin
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom &amp; Prénom</th>
                  <th>Email</th>
                  <th>Organisation</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className={busyId === admin.id ? 'row-busy' : ''}>
                    <td>
                      <div className="cell-name">
                        <div className="row-avatar">
                          {admin.firstName[0]}{admin.lastName[0]}
                        </div>
                        <span>{admin.firstName} {admin.lastName}</span>
                      </div>
                    </td>

                    <td className="cell-email">{admin.email}</td>

                    {/* ← was admin.organization (wrong key), now admin.organisation */}
                    <td>
                      <span className="org-badge">
                        {admin.organisation}
                      </span>
                    </td>

                    <td>
                      <span className="org-badge">{admin.phone}</span>
                    </td>

                    <td><StatusBadge status={admin.status} /></td>
                    <td className="cell-date">{formatDate(admin.createdAt)}</td>

                    <td>
                      {confirmId === admin.id ? (
                        <div className="confirm-delete">
                          <span className="confirm-text">Supprimer ?</span>
                          <button className="btn-action btn-confirm"
                            onClick={() => handleDelete(admin.id)}
                            disabled={busyId === admin.id}>
                            {busyId === admin.id ? '...' : 'Oui'}
                          </button>
                          <button className="btn-action btn-cancel-inline"
                            onClick={() => setConfirmId(null)}
                            disabled={busyId === admin.id}>
                            Non
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button className="btn-action btn-stats"
                            onClick={() => onViewStats(admin)} title="Statistiques">
                            📊 Stats
                          </button>
                          <button className="btn-action btn-edit"
                            onClick={() => setModal({ mode: 'edit', admin })} title="Modifier">
                            ✏️ Modifier
                          </button>
                          <button className="btn-action btn-delete"
                            onClick={() => setConfirmId(admin.id)} title="Supprimer">
                            🗑️ Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modal?.mode === 'create' && (
        <CreateAdminModal onClose={() => setModal(null)} onSubmit={handleCreate} />
      )}
      {modal?.mode === 'edit' && (
        <CreateAdminModal admin={modal.admin} onClose={() => setModal(null)} onSubmit={handleUpdate} />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default AdminList
