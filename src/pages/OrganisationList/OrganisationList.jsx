// src/pages/OrganisationList/OrganisationList.jsx
import { useEffect, useState } from 'react'
import './OrganisationList.css'

import {
  getOrganisations,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from '../../services/organisation.service'

import Sidebar                  from '../../components/ui/Sidebar/Sidebar'
import OrganisationFormModal    from '../../components/modals/CreateOrganisationModal'
import OrganisationDetailModal  from '../../components/modals/OrganisationDetailModal'

const BASE_URL  =  'http://localhost:3000'
const PAGE_SIZE = 10

function OrganisationList({ onNavigate, onLogout }) {
  const [organisations, setOrganisations] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(1)
  const [toast,         setToast]         = useState(null)

  // modal state: null | { mode: 'create' } | { mode: 'edit', org } | { mode: 'detail', org } | { mode: 'delete', org }
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
      setError(err.message || 'Erreur lors du chargement.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Create ───────────────────────────────── */
  const handleCreate = async (formData) => {
    await createOrganisation(formData)
    await fetchOrganisations()
    setModal(null)
    showToast('Organisation créée avec succès.')
  }

  /* ── Update ───────────────────────────────── */
  const handleUpdate = async (formData) => {
    await updateOrganisation(modal.org.id, formData)
    await fetchOrganisations()
    setModal(null)
    showToast('Organisation mise à jour.')
  }

  /* ── Delete (with confirm) ────────────────── */
  const handleDelete = async () => {
    if (!modal?.org) return
    try {
      await deleteOrganisation(modal.org.id)
      await fetchOrganisations()
      setModal(null)
      showToast('Organisation supprimée.')
    } catch (err) {
      showToast(err.message || 'Erreur lors de la suppression.', 'error')
      setModal(null)
    }
  }

  /* ── Filter ───────────────────────────────── */
  const filtered = organisations.filter((org) => {
    const q = search.toLowerCase()
    return (
      (org.name_organisation    || '').toLowerCase().includes(q) ||
      (org.adresse_organisation || '').toLowerCase().includes(q) ||
      (org.phone_organisation   || '').toLowerCase().includes(q)
    )
  })

  /* ── Pagination ───────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const goTo       = (p) => setPage(Math.max(1, Math.min(p, totalPages)))

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
    org.logo_organisation ? `${BASE_URL}/${org.logo_organisation}` : null

  /* ── Render ───────────────────────────────── */
  return (
    <div className="page-layout">
      <Sidebar activePage="organisations" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="client-list">

          {/* Header */}
          <div className="client-list-header">
            <div>
              <h2 className="client-list-title">Organisations</h2>
              <p className="client-list-sub">
                {filtered.length} organisation{filtered.length !== 1 ? 's' : ''} au total
              </p>
            </div>

            <div className="client-list-actions">
              <input
                className="client-search"
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={() => setModal({ mode: 'create' })}
              >
                + Nouvelle organisation
              </button>
            </div>
          </div>

          {loading && <div className="client-state">Chargement...</div>}
          {error   && <div className="client-state error">{error}</div>}

          {!loading && !error && (
            <>
              <div className="client-table-wrapper">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>Organisation</th>
                      <th>Adresse</th>
                      <th>Téléphone</th>
                      <th>Créée le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="client-empty">
                          Aucune organisation trouvée.
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

                            <td>{org.adresse_organisation || <span className="org-empty-cell">—</span>}</td>
                            <td>{org.phone_organisation   || <span className="org-empty-cell">—</span>}</td>

                            <td>
                              {org.created_at
                                ? new Date(org.created_at).toLocaleDateString('fr-FR')
                                : '—'}
                            </td>

                            {/* Actions */}
                            <td>
                              <div className="org-actions">
                                <button
                                  className="btn-consulter"
                                  onClick={() => setModal({ mode: 'detail', org })}
                                  title="Voir les détails"
                                >
                                  🔍 Détails
                                </button>
                                <button
                                  className="btn-edit"
                                  onClick={() => setModal({ mode: 'edit', org })}
                                  title="Modifier"
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => setModal({ mode: 'delete', org })}
                                  title="Supprimer"
                                >
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
                    <span className="pagination-total">sur {filtered.length} organisations</span>
                  </div>

                  <div className="pagination-controls">
                    <button className="page-btn page-nav" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>‹</button>

                    {pageNumbers().map((p, i) =>
                      p === '...'
                        ? <span key={`e-${i}`} className="page-ellipsis">…</span>
                        : <button
                            key={p}
                            className={`page-btn ${p === safePage ? 'page-active' : ''}`}
                            onClick={() => goTo(p)}
                          >{p}</button>
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
        <OrganisationFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}

      {/* ── Edit modal ── */}
      {modal?.mode === 'edit' && (
        <OrganisationFormModal
          mode="edit"
          initial={modal.org}
          onClose={() => setModal(null)}
          onSubmit={handleUpdate}
        />
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

      {/* ── Delete confirm modal ── */}
      {modal?.mode === 'delete' && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box org-confirm-modal">
            <div className="modal-header">
              <h3 className="modal-title">🗑️ Confirmer la suppression</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="org-confirm-body">
              <p>
                Êtes-vous sûr de vouloir supprimer l'organisation{' '}
                <strong>{modal.org.name_organisation}</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            <div className="org-detail-footer">
              <span />
              <div className="org-detail-footer-right">
                <button className="btn-cancel" onClick={() => setModal(null)}>Annuler</button>
                <button className="btn-danger" onClick={handleDelete}>Supprimer</button>
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
