import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ClientList.css'

import { getClients, createClient, updateClient, deleteClient } from '../../services/client.service'

import Sidebar from '../../components/ui/Sidebar/Sidebar'
import CreateClientModal from '../../components/modals/CreateClientModal'
import KycDossierModal   from '../../components/modals/KycDossierModal'

const PAGE_SIZE = 10

function ClientList({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null)
  const [dossier, setDossier] = useState(null)
  const [toast,   setToast]   = useState(null)
  const [filterKyc, setFilterKyc] = useState('all')
  const [page,      setPage]      = useState(1)

  useEffect(() => {
    fetchClients()
    const interval = setInterval(fetchClients, 30000)
    const onFocus = () => { fetchClients() }
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

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
      setError(err.message || t('clientList.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (form) => {
  try {
    await createClient(form)
    await fetchClients()
    setModal(null)
      showToast(t('clientList.toast.created'), 'success')
  } catch (err) {
    setModal(null)
      showToast(err.message || t('clientList.toast.createError'), 'error')
  }
}

  const handleUpdate = async (id, form) => {
    try {
      await updateClient(id, form)
      await fetchClients()
      setModal(null)
      showToast('Client modifié avec succès.', 'success')
    } catch (err) {
      setModal(null)
      showToast(err.message || 'Erreur lors de la modification du client.', 'error')
    }
  }

  const handleDelete = async (client) => {
    const confirmed = window.confirm(
      `Supprimer définitivement ${client.firstName} ${client.lastName} et son dossier KYC ?`
    )
    if (!confirmed) return
    try {
      await deleteClient(client.id)
      await fetchClients()
      showToast('Client supprimé avec succès.', 'success')
    } catch (err) {
      showToast(err.message || 'Erreur lors de la suppression du client.', 'error')
    }
  }

  /* ── Filter ───────────────────────────────────── */
  const getKycStatus = (client) => {
    if (!client.kyc) return 'none'
    return client.kyc.deletedAt ? 'non_valide' : client.kyc.status
  }

  const filtered = clients.filter((client) => {
    const q = search.toLowerCase()
    const matchesSearch = (
      `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase().includes(q) ||
      (client.email      || '').toLowerCase().includes(q) ||
      (client.accessCode || '').toLowerCase().includes(q)
    )
    if (!matchesSearch) return false

    if (filterKyc === 'all') return true
    return getKycStatus(client) === filterKyc
  })

  /* ── Pagination ───────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const goTo       = (p) => setPage(Math.max(1, Math.min(p, totalPages)))

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
    if (!kyc) return <span className="status-badge unused">{t('clientList.kycStatus.noKyc')}</span>
    const status = kyc.deletedAt ? 'non_valide' : kyc.status

    const map = {
      en_attente: { label: t('clientList.kycStatus.pending'), cls: 'en-attente' },
      valide:     { label: t('clientList.kycStatus.valid'),   cls: 'valide'     },
      non_valide: { label: t('clientList.kycStatus.invalid'), cls: 'non-valide' },
    }
    const { label, cls } = map[status] ?? { label: status, cls: 'unknown' }
    return <span className={`status-badge ${cls}`}>{label}</span>
  }

  /* ── Render ───────────────────────────────────── */
  return (
    <div className="page-layout" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="clients" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="client-list">

          {/* Header */}
          <div className="client-list-header">
            <div>
              <h2 className="client-list-title">{t('clientList.title')}</h2>
              <p className="client-list-sub">
                {t(filtered.length !== 1 ? 'clientList.total_other' : 'clientList.total_one', { count: filtered.length })}
              </p>
            </div>

            <div className="client-list-actions">
              <input
                className="client-search"
                type="text"
                placeholder={t('clientList.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-primary" onClick={() => setModal({ mode: 'create' })}>
                {t('clientList.newClient')}
              </button>
            </div>
          </div>

          {/* KYC Status filter */}
          <div className="kyc-filter-bar">
            {[
              { value: 'all',        label: 'Tous' },
              { value: 'en_attente', label: 'En attente' },
              { value: 'valide',     label: 'Validé' },
              { value: 'non_valide', label: 'Non valide' },
              { value: 'none',       label: 'Aucun KYC' },
            ].map((f) => (
              <button
                key={f.value}
                className={`kyc-filter-btn ${filterKyc === f.value ? 'active' : ''}`}
                onClick={() => { setFilterKyc(f.value); setPage(1) }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && <div className="client-state">{t('common.loading')}</div>}
          {error   && <div className="client-state error">{error}</div>}

          {!loading && !error && (
            <>
              <div className="client-table-wrapper">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>{t('clientList.columns.name')}</th>
                      <th>{t('clientList.columns.email')}</th>
                      <th>{t('clientList.columns.phone')}</th>
                      <th>{t('clientList.columns.codeStatus')}</th>
                      <th>{t('clientList.columns.kyc')}</th>
                      <th>{t('clientList.columns.createdAt')}</th>
                      <th>{t('clientList.columns.actions')}</th>

                    </tr>
                  </thead>

                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="client-empty">
                          {t('clientList.empty')}
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
                              {client.isCodeUsed ? t('clientList.codeStatus.used') : t('clientList.codeStatus.unused')}
                            </span>
                          </td>

                          <td>{kycBadge(client.kyc)}</td>

                          <td>
                            {client.createdAt
                              ? new Date(client.createdAt).toLocaleDateString(locale)
                              : '-'}
                          </td>

                          {/* Actions column */}
                            <td>
                              <div className="client-actions">
                                {!client.isCodeUsed && !client.kyc && (
                                  <>
                                    <button
                                      className="btn-edit"
                                      onClick={() => setModal({ mode: 'edit', client })}
                                    >
                                      ✏️ Modifier
                                    </button>
                                    <button
                                      className="btn-delete"
                                      onClick={() => handleDelete(client)}
                                    >
                                      🗑️ Supprimer
                                    </button>
                                  </>
                                )}
                                {client.kyc && (
                                  <button
                                    className="btn-consulter"
                                    onClick={() => setDossier({ clientId: client.id })}
                                  >
                                {t('clientList.consultFile')}
                                  </button>
                                )}
                              </div>
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
       {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}

      </span>

      <span className="pagination-total">
                      {t('clientList.pagination.of')} {filtered.length} {t('clientList.pagination.clients')}
      </span>
    </div>

    <div className="pagination-controls">


      {/* Pages */}
      <button className="page-btn page-nav" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>‹</button>
      {pageNumbers().map((p, i) =>
                      p === '...'
                        ? <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
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

      {/* Create / Edit client modal */}
      {modal?.mode === 'create' && (
        <CreateClientModal onClose={() => setModal(null)} onSubmit={handleCreate} />

      )}
      {modal?.mode === 'edit' && (
        <CreateClientModal
          client={modal.client}
          onClose={() => setModal(null)}
          onSubmit={(form) => handleUpdate(modal.client.id, form)}
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
            showToast(t('clientList.toast.statusUpdated'), 'success')
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