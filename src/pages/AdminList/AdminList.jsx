// src/pages/AdminList/AdminList.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../services/admin.service'
import { getOrganisations } from '../../services/organisation.service'
import CreateAdminModal from '../../components/modals/CreateAdminModal'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import './AdminList.css'

function formatDate(iso, locale) {
  return new Date(iso).toLocaleDateString(locale, {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function StatusBadge({ status }) {
    const { t } = useTranslation()
  return (
    <span className={`status-badge status-${status}`}>
      {status === 'active' ? t('adminList.status.active') : t('adminList.status.pending')}
    </span>
  )
}

function AdminList({ onNavigate, onViewStats, onLogout }) {
    const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  const [admins,    setAdmins]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [busyId,    setBusyId]    = useState(null)
  const [toast,     setToast]     = useState(null)
  const [orgsNoAdmin, setOrgsNoAdmin] = useState([])

  const fetchData = () => {
    Promise.all([
      getAdmins(),
      getOrganisations().catch(() => []),
    ]).then(([adminsData, orgsData]) => {
      setAdmins(adminsData)
      const orgs = Array.isArray(orgsData) ? orgsData : []
      setOrgsNoAdmin(orgs.filter((o) => !o.admin))
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    const onFocus = () => { fetchData() }
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
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
      showToast(t('adminList.toast.created'))
    } catch (err) {
      setModal(null)
      showToast(err.message || t('adminList.toast.createError'), 'error')
    }
  }

  const handleUpdate = async (formData) => {
    const { id } = modal.admin
    try {
      const updated = await updateAdmin(id, formData)
      setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
      setModal(null)
      showToast(t('adminList.toast.updated', { name: `${updated.firstName} ${updated.lastName}` }))
    } catch (err) {
      setModal(null)
      showToast(err.message || t('adminList.toast.updateError'), 'error')
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    try {
      await deleteAdmin(id)
      setAdmins((prev) => prev.filter((a) => a.id !== id))
      showToast(t('adminList.toast.deleted'))
    } catch (err) {
      showToast(err.message || t('adminList.toast.deleteError'), 'error')
    } finally {
      setBusyId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="admin-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="admins" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>{t('adminList.title')}</h1>
            <p className="page-subtitle">
              {loading ? '—' : t(admins.length !== 1 ? 'adminList.accounts_other' : 'adminList.accounts_one', { count: admins.length })}
            </p>
          </div>
          {orgsNoAdmin.length > 0 && (
            <button className="btn-primary" onClick={() => setModal({ mode: 'create' })}>
              {t('adminList.createAdmin')}
            </button>
          )}
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="state-center">
              <div className="spinner" />
              <p>{t('common.loading')}</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="state-center">
              <div className="empty-icon">👤</div>
              <p className="empty-title">{t('adminList.empty.title')}</p>
              <p className="empty-sub">
                {orgsNoAdmin.length === 0 ? t('adminList.empty.noOrg') : t('adminList.empty.sub')}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('adminList.columns.name')}</th>
                  <th>{t('adminList.columns.email')}</th>
                  <th>{t('adminList.columns.organisation')}</th>
                  <th>{t('adminList.columns.phone')}</th>
                  <th>{t('adminList.columns.status')}</th>
                  <th>{t('adminList.columns.createdAt')}</th>
                  <th>{t('adminList.columns.actions')}</th>
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

                    <td>
                      <span className="org-badge">
                        {admin.organisation ?? t('common.noData')}
                      </span>
                    </td>

                    <td><span className="org-badge">{admin.phone || t('common.noData')}</span></td>


                    <td><StatusBadge status={admin.status} /></td>
                    <td className="cell-date">{formatDate(admin.createdAt, locale)}</td>

                    <td>
                      {confirmId === admin.id ? (
                        <div className="confirm-delete">
                          <span className="confirm-text">{t('adminList.actions.confirmDelete')}</span>
                          <button
                            className="btn-action btn-confirm"
                            onClick={() => handleDelete(admin.id)}
                                 disabled={busyId === admin.id}
                          >
                            {busyId === admin.id ? '...' : t('adminList.actions.yes')}
                                </button>
                          <button
                            className="btn-action btn-cancel-inline"
                             onClick={() => setConfirmId(null)}
                            disabled={busyId === admin.id}
                          >
                            {t('adminList.actions.no')}
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button className="btn-action btn-stats"
                            onClick={() => onViewStats(admin)}
                            title={t('adminList.actions.stats')}
                            disabled={admin?.status !== 'active'}>
                            📊
                          </button>
                          <button className="btn-action btn-edit"
                            onClick={() => setModal({ mode: 'edit', admin })}
                            title={t('adminList.actions.edit')}>
                            ✏️
                          </button>
                          <button className="btn-action btn-delete"
                            onClick={() => setConfirmId(admin.id)}
                            title={t('adminList.actions.delete')}>
                            🗑️
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
