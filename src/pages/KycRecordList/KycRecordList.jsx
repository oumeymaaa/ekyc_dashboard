import { useEffect, useState } from 'react'
import './KycRecordList.css'

import { getKycRecords } from '../../services/kyc.service'
import { createClient } from '../../services/client.service'

import Sidebar from '../../components/ui/Sidebar/Sidebar'
import KycDossierModal from '../../components/modals/KycDossierModal'
import CreateClientModal from '../../components/modals/CreateClientModal'

const BASE_URL = 'http://localhost:3000'

function KycRecordList({ onNavigate, onLogout }) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [lightbox, setLightbox] = useState(null)
  const [dossier, setDossier]   = useState(null)
  const [modal, setModal]       = useState(null)   // ← create client modal
  const [toast, setToast]       = useState(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const data = await getKycRecords()
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des dossiers KYC.')
    } finally {
      setLoading(false)
    }
  }

  // ── Create client ──────────────────────────────────
  const handleCreate = async (form) => {
    try {
      await createClient(form)
      await fetchRecords()
      setModal(null)
      showToast('Compte client créé et email envoyé.', 'success')
    } catch (err) {
      setModal(null)
      showToast(err.message || 'Erreur lors de la création du client.', 'error')
    }
  }

  /* ── Filter ──────────────────────────────────────── */
  const filtered = records.filter((r) => {
    const q = search.toLowerCase()
    const client = r.client || {}
    return (
      (client.email        || '').toLowerCase().includes(q) ||
      (client.phone        || '').toLowerCase().includes(q) ||
      (r.cinData?.cin      || '').toLowerCase().includes(q) ||
      (r.cinData?.firstName|| '').toLowerCase().includes(q) ||
      (r.cinData?.lastName || '').toLowerCase().includes(q) ||
      (r.status            || '').toLowerCase().includes(q)
    )
  })

  /* ── Helpers ─────────────────────────────────────── */
  const statusMeta = (status) => {
    switch (status) {
      case 'valide':     return { label: 'Valide',      cls: 'valide'     }
      case 'non_valide': return { label: 'Non valide',  cls: 'non-valide' }
      case 'en_attente': return { label: 'En attente',  cls: 'en-attente' }
      default:           return { label: status,        cls: 'unknown'    }
    }
  }

  const scoreColor = (score) => {
    if (score >= 0.9) return 'score-high'
    if (score >= 0.7) return 'score-mid'
    return 'score-low'
  }

  const imgSrc = (path) => path

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR') : '-'

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="page-layout">
      <Sidebar
        activePage="kyc"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="page-content">
        <div className="client-list">

          {/* Header */}
          <div className="client-list-header">
            <div>
              <h2 className="client-list-title">Dossiers eKYC</h2>
              <p className="client-list-sub">
                {filtered.length} dossier{filtered.length !== 1 ? 's' : ''} au total
              </p>
            </div>

            <div className="client-list-actions">
              <input
                className="client-search"
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* ✅ Create client button */}
              <button
                className="btn-primary"
                onClick={() => setModal({ mode: 'create' })}
              >
                + Nouveau client
              </button>
            </div>
          </div>

          {/* States */}
          {loading && <div className="client-state">Chargement…</div>}
          {error   && <div className="client-state error">{error}</div>}

          {/* Table */}
          {!loading && !error && (
            <div className="client-table-wrapper">
              <table className="client-table kyc-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Téléphone</th>       
                    <th>Code d'accès</th>    
                    <th>Statut KYC</th>
                    <th>Score</th>
                    <th>Selfie</th>
                    <th>Créé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="client-empty">
                        Aucun dossier KYC trouvé.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const client = r.client || {}
                      const cin    = r.cinData || {}
                      const { label, cls } = statusMeta(r.status)

                      return (
                        <tr key={r.id}>

                          {/* Client name + email */}
                          <td>
                            <div className="client-name">
                              <div className="client-avatar">
                                {(client.firstName?.[0] || '').toUpperCase()}
                                {(client.lastName?.[0]  || '').toUpperCase()}
                              </div>
                              <div className="client-name-stack">
                                <span className="client-fullname">
                                  {client.firstName} {client.lastName}
                                </span>
                                <span className="client-email-sub">
                                  {client.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ✅ Phone */}
                          <td>{client.phone}</td>

                          {/* ✅ Access code + code status */}
                          <td>
                            <div className="code-cell">
                            
                              <span className={`status-badge ${client.isCodeUsed ? 'used' : 'unused'}`}>
                                {client.isCodeUsed ? 'Utilisé' : 'Non utilisé'}
                              </span>
                            </div>
                          </td>

                          {/* KYC Status */}
                          <td>
                            <span className={`status-badge ${cls}`}>
                              {label}
                            </span>
                          </td>

                          {/* Score */}
                          <td>
                            <span className={`score-badge ${scoreColor(r.facialMatchingScore)}`}>
                              {r.facialMatchingScore != null
                                ? `${Math.round(r.facialMatchingScore * 100)} %`
                                : '-'}
                            </span>
                          </td>

                          {/* CIN data */}
                          <td>
                            <div className="cin-details">
                              <span className="cin-row"><b>CIN :</b> {cin.cin || '-'}</span>
                              <span className="cin-row"><b>Nom :</b> {cin.firstName} {cin.lastName}</span>
                              <span className="cin-row">
                                <b>Naissance :</b>{' '}
                                {cin.birthDate
                                  ? new Date(cin.birthDate).toLocaleDateString('fr-FR')
                                  : '-'}
                              </span>
                              <span className="cin-row"><b>Adresse :</b></span>
                              <span className="cin-row cin-address">{cin.address || '-'}</span>
                            </div>
                          </td>

                          {/* CIN image */}
                          <td>
                            {imgSrc(r.cinImageUrl) ? (
                              <img
                                className="kyc-thumb"
                                src={imgSrc(r.cinImageUrl)}
                                alt="CIN"
                                onClick={() =>
                                  setLightbox({ src: imgSrc(r.cinImageUrl), label: 'Photo CIN' })
                                }
                              />
                            ) : (
                              <span className="no-img">—</span>
                            )}
                          </td>

                          {/* Selfie image */}
                          <td>
                            {imgSrc(r.selfieImageUrl) ? (
                              <img
                                className="kyc-thumb kyc-thumb-round"
                                src={imgSrc(r.selfieImageUrl)}
                                alt="Selfie"
                                onClick={() =>
                                  setLightbox({ src: imgSrc(r.selfieImageUrl), label: 'Selfie' })
                                }
                              />
                            ) : (
                              <span className="no-img">—</span>
                            )}
                          </td>

                          {/* Created at */}
                          <td>{formatDate(r.createdAt)}</td>

                          {/* Actions */}
                          <td>
                            {r.status === 'en_attente' && (
                              <button
                                className="btn-consulter"
                                onClick={() => setDossier({ clientId: r.client?.id })}
                              >
                                🔍 Consulter dossier
                              </button>
                            )}
                          </td>

                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ✅ Create Client Modal */}
      {modal?.mode === 'create' && (
        <CreateClientModal
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}

      {/* Dossier KYC modal */}
      {dossier && (
        <KycDossierModal
          clientId={dossier.clientId}
          onClose={() => setDossier(null)}
          onUpdated={() => {
            setDossier(null)
            fetchRecords()
            showToast('Statut mis à jour avec succès.', 'success')
          }}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span>{lightbox.label}</span>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            </div>
            <img className="lightbox-img" src={lightbox.src} alt={lightbox.label} />
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

export default KycRecordList
