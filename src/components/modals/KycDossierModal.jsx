import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './KycDossierModal.css'

import { getKycRecordByClient, updateKycStatus } from '../../services/kyc.service'


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const imgUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

const statusLabel = (status, deletedAt) => {
  if (deletedAt) return { label: 'Rejeté (archivé)', cls: 'non-valide' }
  switch (status) {
    case 'valide':     return { label: 'Valide',      cls: 'valide' }
    case 'non_valide': return { label: 'Non valide',  cls: 'non-valide' }
    case 'en_attente': return { label: 'En attente',  cls: 'en-attente' }
    default:           return { label: status,        cls: 'unknown' }
  }
}

function KycDossierModal({ clientId, onClose, onUpdated }) {
  const { t } = useTranslation()
  const [records, setRecords]     = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [updating, setUpdating]   = useState(false)
  const [zoomImage, setZoomImage] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [clientId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await getKycRecordByClient(clientId)
      const list = res?.data ?? []
      setRecords(list)
      setSelectedIdx(0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const record = records[selectedIdx] ?? null
  const { label: statusText, cls: statusCls } = record
    ? statusLabel(record.status, record.deletedAt)
    : { label: '', cls: '' }

  const handleStatusChange = async (status) => {
    try {
      setUpdating(true)
      await updateKycStatus(record.id, status)
      await fetchHistory()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <div className="kyc-overlay" onClick={onClose}>
        <div className="kyc-modal kyc-modal-wide" onClick={(e) => e.stopPropagation()}>

          <div className="kyc-header">
            <div>
              <h2>{t('kycDossierModal.title')}</h2>
              <p>{t('kycDossierModal.subtitle')}</p>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="kyc-body">
            {loading && <div className="kyc-state">{t('kycDossierModal.loading')}</div>}
            {error   && <div className="kyc-error">{error}</div>}

            {!loading && records.length === 0 && (
              <div className="kyc-state">Aucun dossier KYC trouvé pour ce client.</div>
            )}

            {record && (
              <div className="kyc-layout">
                {/* ─── HISTORY SIDEBAR ─── */}
                {records.length > 1 && (
                  <aside className="kyc-history-sidebar">
                    <h4>Historique ({records.length})</h4>
                    <ul>
                      {records.map((r, i) => {
                        const { label, cls } = statusLabel(r.status, r.deletedAt)
                        return (
                          <li
                            key={r.id}
                            className={`kyc-history-item ${i === selectedIdx ? 'active' : ''}`}
                            onClick={() => setSelectedIdx(i)}
                          >
                            <span className={`status-dot ${cls}`} />
                            <div>
                              <div className="history-status">{label}</div>
                              <div className="history-date">
                                {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </aside>
                )}

                {/* ─── MAIN CONTENT ─── */}
                <div className="kyc-main">
                  <div className="kyc-main-header">
                    <div>
                      <span className={`kyc-status-badge ${statusCls}`}>{statusText}</span>
                      <span className="kyc-date">
                        {new Date(record.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="profile-card">
                    <div className="avatar">
                      {record.client?.firstName?.[0]}
                      {record.client?.lastName?.[0]}
                    </div>
                    <div className="profile-info">
                    <h3>{record.client?.firstName} {record.client?.lastName}</h3>
                      <p>{record.client?.email}</p>
                    </div>
                    <div className="score-box">
                    <span>{t('kycDossierModal.faceMatch')}</span>
                      <div className="score">
                        {record.facialMatchingScore != null
                          ? `${Math.round(record.facialMatchingScore * 100)}%`
                          : '-'}
                      </div>
                      {record.facialMatchingScore != null && (
                        <div className="bar">
                          <div
                            className="bar-fill"
                            style={{ width: `${Math.round(record.facialMatchingScore * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="kyc-grid">
                    <div className="card">
                    <h4>{t('kycDossierModal.cinData')}</h4>
                      <div className="info">
                      <p><b>{t('kycDossierModal.cin')}:</b> {record.cinData?.cin}</p>
                      <p><b>{t('kycDossierModal.name')}:</b> {record.cinData?.firstName} {record.cinData?.lastName}</p>
                      <p><b>{t('kycDossierModal.birth')}:</b> {record.cinData?.birthDate}</p>
                      <p><b>{t('kycDossierModal.place')}:</b> {record.cinData?.lieu}</p>
                       </div>
                    </div>

                    <div className="card image-card">
                    <h4>{t('kycDossierModal.identityComparison')}</h4>
                      <div className="img-block">
                        <div className="img-title">CIN Document</div>
                        {imgUrl(record.cinImageUrl) ? (
                          <img src={imgUrl(record.cinImageUrl)} onClick={() => setZoomImage(imgUrl(record.cinImageUrl))} />
                        ) : (
                          <div className="no-img-block">Aucune image CIN</div>
                        )}
                      </div>
                      <div className="img-block">
                        <div className="img-title">Selfie</div>
                        {imgUrl(record.selfieImageUrl) ? (
                          <img src={imgUrl(record.selfieImageUrl)} onClick={() => setZoomImage(imgUrl(record.selfieImageUrl))} />
                        ) : (
                          <div className="no-img-block">Aucune image selfie</div>
                        )}
                      </div>
                      <div className="img-block">
                        <div className="img-title">Visage détecté</div>
                        {imgUrl(record.faceImageUrl) ? (
                          <img src={imgUrl(record.faceImageUrl)} onClick={() => setZoomImage(imgUrl(record.faceImageUrl))} />
                        ) : (
                          <div className="no-img-block">Aucun visage détecté</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {record.status === 'en_attente' && !record.deletedAt && (
                    <div className="actions">
                      <button className="approve-btn" disabled={updating} onClick={() => handleStatusChange('valide')}>
                        Approuver
                      </button>
                      <button className="reject-btn" disabled={updating} onClick={() => handleStatusChange('non_valide')}>
                        Rejeter
                      </button>
                    </div>
                  )}
                  {record.status === 'valide' && (
                    <div className="kyc-approved-badge">{t('kycDossierModal.approved')}</div>
                  )}
                  {record.status === 'non_valide' && (
                    <div className="kyc-rejected-badge">{t('kycDossierModal.rejected')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {zoomImage && (
        <div className="zoom-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} />
        </div>
      )}
    </>
  )
}

export default KycDossierModal