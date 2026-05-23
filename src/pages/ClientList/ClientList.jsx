import { useEffect, useState } from 'react'
import './ClientList.css'

import { getClients, createClient } from '../../services/client.service'

import Sidebar from '../../components/ui/Sidebar/Sidebar'
import CreateClientModal from '../../components/modals/CreateClientModal'
import KycDossierModal   from '../../components/modals/KycDossierModal'

const PAGE_SIZE = 10

function ClientList({ onNavigate, onLogout }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null)
  const [dossier, setDossier] = useState(null)
  const [toast,   setToast]   = useState(null)
  const [page,    setPage]    = useState(1)      // ← current page

  useEffect(() => { fetchClients() }, [])

  // Reset to page 1 whenever search changes
  useEffect(() => { setPage(1) }, [search])

  /* ── Toast helper ─────────────────────────────── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── Data fetching ────────────────────────────── */
  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await getClients()
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des clients.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (form) => {
  try {
    await createClient(form)

    // Refresh clients from API
    await fetchClients()

    setModal(null)
    showToast('Client créé avec succès.', 'success')
  } catch (err) {
    setModal(null)
    showToast(err.message || 'Erreur lors de la création du client.', 'error')
  }
}

  /* ── Filter ───────────────────────────────────── */
  const filtered = clients.filter((client) => {
    const q = search.toLowerCase()
    return (
      `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase().includes(q) ||
      (client.email      || '').toLowerCase().includes(q) ||
      (client.accessCode || '').toLowerCase().includes(q)
    )
  })

  /* ── Pagination ───────────────────────────────── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(page, totalPages)
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const goTo  = (p) => setPage(Math.max(1, Math.min(p, totalPages)))

  // Build page number array with ellipsis: [1, '...', 4, 5, 6, '...', 12]
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

  const kycBadge = (kyc) => {
    if (!kyc) return <span className="status-badge unused">Aucun KYC</span>

    // Safety: if deletedAt is present, always show non_valide
    const status = kyc.deletedAt ? 'non_valide' : kyc.status

    const map = {
      en_attente: { label: 'En attente', cls: 'en-attente' },
      valide:     { label: 'Validé',     cls: 'valide'     },
      non_valide: { label: 'Non valide', cls: 'non-valide' },
    }
    const { label, cls } = map[status] ?? { label: status, cls: 'unknown' }
    return <span className={`status-badge ${cls}`}>{label}</span>
  }

  /* ── Render ───────────────────────────────────── */
  return (
    <div className="page-layout">
      <Sidebar activePage="clients" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="client-list">

          {/* Header */}
          <div className="client-list-header">
            <div>
              <h2 className="client-list-title">Dossiers eKYC</h2>
              <p className="client-list-sub">
                {filtered.length} client{filtered.length !== 1 ? 's' : ''} au total
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
                + Nouveau client
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
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Statut code</th>
                      <th>KYC</th>
                      <th>Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="client-empty">
                          Aucun client trouvé.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((client) => (
                        <tr key={client.id}>

                          {/* Name */}
                          <td>
                            <div className="client-name">
                              <div className="client-avatar">
                                {(client.firstName?.[0] || '').toUpperCase()}
                                {(client.lastName?.[0]  || '').toUpperCase()}
                              </div>
                              <span>{client.firstName} {client.lastName}</span>
                            </div>
                          </td>

                          <td>{client.email}</td>
                          <td>{client.phone}</td>

                          <td>
                            <span className={`status-badge ${client.isCodeUsed ? 'used' : 'unused'}`}>
                              {client.isCodeUsed ? 'Utilisé' : 'Non utilisé'}
                            </span>
                          </td>

                          <td>{kycBadge(client.kyc)}</td>

                          <td>
                            {client.createdAt
                              ? new Date(client.createdAt).toLocaleDateString('fr-FR')
                              : '-'}
                          </td>

                          {/* Actions column — show "Consulter" for ALL kyc statuses including non_valide */}
                            <td>
                              {client.kyc && (
                                <button
                                  className="btn-consulter"
                                  onClick={() => setDossier({ clientId: client.id })}
                                >
                                  🔍 Consulter dossier
                                </button>
                              )}
                            </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

             {/* ── Pagination ─────────────────────────────── */}
{totalPages > 1 && (
  <div className="pagination">

    <div className="pagination-info">
      <span className="pagination-count">
        {(safePage - 1) * PAGE_SIZE + 1}
        -
        {Math.min(safePage * PAGE_SIZE, filtered.length)}
      </span>

      <span className="pagination-total">
        sur {filtered.length} clients
      </span>
    </div>

    <div className="pagination-controls">

      {/* Previous */}
      <button
        className="page-btn page-nav"
        onClick={() => goTo(safePage - 1)}
        disabled={safePage === 1}
      >
        ‹
      </button>

      {/* Pages */}
      {pageNumbers().map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="page-ellipsis"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn ${
              p === safePage ? 'page-active' : ''
            }`}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        className="page-btn page-nav"
        onClick={() => goTo(safePage + 1)}
        disabled={safePage === totalPages}
      >
        ›
      </button>

    </div>
  </div>
)}
            </>
          )}
        </div>
      </main>

      {/* Create client modal */}
      {modal?.mode === 'create' && (
        <CreateClientModal
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}

      {/* KYC dossier modal */}
      {dossier && (
        <KycDossierModal
          clientId={dossier.clientId}
          onClose={() => setDossier(null)}
          onUpdated={() => {
            setDossier(null)
            fetchClients()
            showToast('Statut mis à jour avec succès.', 'success')
          }}
        />
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

export default ClientList