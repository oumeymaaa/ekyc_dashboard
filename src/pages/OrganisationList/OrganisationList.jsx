import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './OrganisationList.css'

import {
  getOrganisations,
  createOrganisationWithAdmin,
  updateOrganisation,
  deleteOrganisation,
} from '../../services/organisation.service'

import Sidebar from '../../components/ui/Sidebar/Sidebar'
import OrganisationFormModal from '../../components/modals/CreateOrganisationModal'
import OrganisationDetailModal from '../../components/modals/OrganisationDetailModal'
import AdminDetailModal from '../../components/modals/AdminDetailModal'

const BASE_URL = import.meta.env.VITE_API_URL
const PAGE_SIZE = 10

function OrganisationList({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  const [organisations, setOrganisations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(null)

  const [modal, setModal] = useState(null)

  useEffect(() => { fetchOrganisations() }, [])
  useEffect(() => { setPage(1) }, [search])

  /* ── Toast ────────────────────────────────── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── Fetch ────────────────────────────────── */
  const fetchOrganisations = async () => {
    try {
      setLoading(true)
      const data = await getOrganisations()
      setOrganisations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || t('organisationList.toast.loadError'))
    } finally {
      setLoading(false)
    }
  }

  /* ── Create ───────────────────────────────── */
  const handleCreate = async (formData) => {
    await createOrganisationWithAdmin(formData)
    await fetchOrganisations()
    setModal(null)
    showToast(t('organisationList.toast.created'))
  }

  /* ── Update ───────────────────────────────── */
  const handleUpdate = async (formData) => {
    await updateOrganisation(modal.org.id, formData)
    await fetchOrganisations()
    setModal(null)
    showToast(t('organisationList.toast.updated'))
  }

  /* ── Delete (with confirm) ────────────────── */
  const handleDelete = async () => {
    if (!modal?.org) return
    try {
      await deleteOrganisation(modal.org.id)
      await fetchOrganisations()
      setModal(null)
      showToast(t('organisationList.toast.deleted'))
    } catch (err) {
      showToast(err.message || t('organisationList.toast.deleteError'), 'error')
      setModal(null)
    }
  }

  /* ── Filter ───────────────────────────────── */
  const filtered = organisations.filter((org) => {
    const q = search.toLowerCase()
    const adminName = org.admin
      ? `${org.admin.first_name} ${org.admin.last_name}`.toLowerCase()
      : ''
    return (
      (org.name_organisation || '').toLowerCase().includes(q) ||
      (org.adresse_organisation || '').toLowerCase().includes(q) ||
      (org.phone_organisation || '').toLowerCase().includes(q) ||
      adminName.includes(q)
    )
  })

  /* ── Pagination ───────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)))

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = []
    if (safePage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (safePage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages)
    }
    return pages
  }

  /* ── Logo helper ──────────────────────────── */
  const logoSrc = (org) =>
    org.logo_url ? `${BASE_URL}${org.logo_url}` : null

  /* ── Render ───────────────────────────────── */
  return (
    <div className="page-layout" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="organisations" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="client-list">

          {/* Header */}
          <div className="client-list-header">
            <div>
              <h2 className="client-list-title">{t('organisationList.title')}</h2>
              <p className="client-list-sub">
                {t(filtered.length !== 1 ? 'organisationList.total_other' : 'organisationList.total_one', { count: filtered.length })}
              </p>
            </div>

            <div className="client-list-actions">
              <input
                className="client-search"
                type="text"
                placeholder={t('organisationList.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-primary" onClick={() => setModal({ mode: 'create' })}>
                {t('organisationList.newOrganisation')}
              </button>
            </div>
          </div>

          {loading && <div className="client-state">{t('common.loading')}</div>}
          {error && <div className="client-state error">{error}</div>}

          {!loading && !error && (
            <>
              <div className="client-table-wrapper">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>{t('organisationList.columns.name')}</th>
                      <th>{t('organisationList.columns.address')}</th>
                      <th>{t('organisationList.columns.phone')}</th>
                      <th>{t('organisationList.columns.createdAt')}</th>
                      <th>{t('organisationList.columns.admin')}</th>
                      <th>{t('organisationList.columns.actions')}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="client-empty">
                          {t('organisationList.empty')}
                        </td>
                      </tr>
                    ) : (
                      paginated.map((org) => {
                        const src = logoSrc(org)
                        return (
                          <tr key={org.id}>

                            {/* Name + logo */}
                            <td>
                              <div className="client-name">
                                <div className="org-avatar-cell">
                                  {src
                                    ? <img src={src} alt="logo" className="org-logo-cell" />
                                    : <span>{org.name_organisation?.[0]?.toUpperCase() ?? '?'}</span>
                                  }
                                </div>
                                <span>{org.name_organisation}</span>
                              </div>
                            </td>

                            <td>{org.adresse_organisation || <span className="org-empty-cell">{t('common.noData')}</span>}</td>
                            <td>{org.phone_organisation || <span className="org-empty-cell">{t('common.noData')}</span>}</td>

                            <td>
                              {org.created_at
                                ? new Date(org.created_at).toLocaleDateString(locale)
                                : <span className="org-empty-cell">{t('common.noData')}</span>}
                            </td>

                            <td>
                              {org.admin
                                ? <span
                                  className="admin-link"
                                  onClick={() => setModal({ mode: 'admin-detail', org })}
                                  title={t('organisationList.adminViewDetail')}
                                >
                                  {org.admin.first_name} {org.admin.last_name}
                                </span>
                                : <span className="org-empty-cell">{t('common.noData')}</span>}
                            </td>

                            {/* Actions */}
                            <td>
                              <div className="org-actions">
                                <button className="btn-consulter"
                                  onClick={() => setModal({ mode: 'detail', org })}>
                                  {t('organisationList.actions.details')}
                                </button>
                                <button className="btn-edit"
                                  onClick={() => setModal({ mode: 'edit', org })}>
                                  {t('organisationList.actions.edit')}
                                </button>
                                <button className="btn-delete"
                                  onClick={() => setModal({ mode: 'delete', org })}>
                                  🗑️
                                </button>
                              </div>
                            </td>

                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    <span className="pagination-count">
                      {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
                    </span>
                    <span className="pagination-total">
                      {t('organisationList.pagination.of')} {filtered.length} {t('organisationList.pagination.organisations')}
                    </span>
                  </div>

                  <div className="pagination-controls">
                    <button className="page-btn page-nav" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>‹</button>

                    {pageNumbers().map((p, i) =>
                      p === '...'
                        ? <span key={`e-${i}`} className="page-ellipsis">…</span>
                        : <button key={p} className={`page-btn ${p === safePage ? 'page-active' : ''}`} onClick={() => goTo(p)}>{p}</button>

                    )}

                    <button className="page-btn page-nav" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}>›</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Create modal ── */}
      {modal?.mode === 'create' && (
        <OrganisationFormModal mode="create" onClose={() => setModal(null)} onSubmit={handleCreate} />

      )}

      {/* ── Edit modal ── */}
      {modal?.mode === 'edit' && (
        <OrganisationFormModal mode="edit" initial={modal.org} onClose={() => setModal(null)} onSubmit={handleUpdate} />

      )}

      {/* ── Detail modal ── */}
      {modal?.mode === 'detail' && (
        <OrganisationDetailModal
          organisation={modal.org}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', org: modal.org })}
          onDelete={() => setModal({ mode: 'delete', org: modal.org })}
        />
      )}

      {/* ── Admin detail modal ── */}
      {modal?.mode === 'admin-detail' && (
        <AdminDetailModal
          admin={modal.org.admin}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {modal?.mode === 'delete' && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box org-confirm-modal">
            <div className="modal-header">
              <h3 className="modal-title">{t('organisationList.confirmDelete.title')}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="org-confirm-body">
              <p>
                {t('organisationList.confirmDelete.text', { name: modal.org.name_organisation })}

              </p>
            </div>
            <div className="org-detail-footer">
              <span />
              <div className="org-detail-footer-right">
                <button className="btn-cancel" onClick={() => setModal(null)}>
                  {t('organisationList.confirmDelete.cancel')}
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  {t('organisationList.confirmDelete.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default OrganisationList
