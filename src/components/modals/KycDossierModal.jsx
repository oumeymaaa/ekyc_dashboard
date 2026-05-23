import { useEffect, useState } from 'react'
import './KycDossierModal.css'

import {
  getKycRecordByClient,
  updateKycStatus,
} from '../../services/kyc.service'

function KycDossierModal({ clientId, onClose, onUpdated }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const [zoomImage, setZoomImage] = useState(null)

  useEffect(() => {
    fetchKyc()
  }, [clientId])

  const fetchKyc = async () => {
    try {
      setLoading(true)
      const data = await getKycRecordByClient(clientId)
      setRecord(data?.data ?? data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    try {
      setUpdating(true)
      await updateKycStatus(record.id, status)
      await fetchKyc()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const score = Math.round((record?.facialMatchingScore || 0) * 100)

  return (
    <>
      <div className="kyc-overlay" onClick={onClose}>
        <div className="kyc-modal" onClick={(e) => e.stopPropagation()}>

          {/* HEADER */}
          <div className="kyc-header">
            <div>
              <h2>KYC Verification</h2>
              <p>Identity validation & document comparison</p>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="kyc-body">

            {loading && <div className="kyc-state">Loading...</div>}
            {error && <div className="kyc-error">{error}</div>}

            {record && (
              <>
                {/* ================= PROFILE ================= */}
                <div className="profile-card">

                  <div className="avatar">
                    {record.client?.firstName?.[0]}
                    {record.client?.lastName?.[0]}
                  </div>

                  <div className="profile-info">
                    <h3>
                      {record.client?.firstName} {record.client?.lastName}
                    </h3>
                    <p>{record.client?.email}</p>
                  </div>

                  {/* SCORE */}
                  <div className="score-box">
                    <span>Face Match</span>
                    <div className="score">{score}%</div>

                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ================= MAIN GRID ================= */}
                <div className="kyc-grid">

                  {/* LEFT: CIN INFO */}
                  <div className="card">
                    <h4>📄 CIN Data</h4>

                    <div className="info">
                      <p><b>CIN:</b> {record.cinData?.cin}</p>
                      <p>
                        <b>Name:</b> {record.cinData?.firstName} {record.cinData?.lastName}
                      </p>
                      <p>
                        <b>Birth:</b> {record.cinData?.birthDate}
                      </p>
                      <p><b>Place:</b> {record.cinData?.lieu}</p>
                      <p><b>Address:</b> {record.cinData?.address}</p>
                    </div>
                  </div>

                  {/* RIGHT: IMAGE COMPARISON */}
                  <div className="card image-card">

                    <h4>🧠 Identity Comparison</h4>

                    {/* CIN */}
                    <div className="img-block">
                      <div className="img-title">CIN Document</div>
                      <img
                        src={record.cinImageUrl}
                        onClick={() => setZoomImage(record.cinImageUrl)}
                      />
                    </div>

                    {/* SELFIE */}
                    <div className="img-block">
                      <div className="img-title">Selfie</div>
                      <img
                        src={record.selfieImageUrl}
                        onClick={() => setZoomImage(record.selfieImageUrl)}
                      />
                    </div>
                  </div>
                </div>

                <div className="actions">

  {record.status === 'valide' ? (
    <div className="kyc-approved-badge">
      ✅ Approved
    </div>
  ) : record.status === 'non_valide' ? (
    <div className="kyc-rejected-badge">
      ❌ Rejected
    </div>
  ) : (
    <>
      <button
        className="approve-btn"
        disabled={updating}
        onClick={() => handleStatusChange('valide')}
      >
        Approve
      </button>

      <button
        className="reject-btn"
        disabled={updating}
        onClick={() => handleStatusChange('non_valide')}
      >
        Reject
      </button>
    </>
  )}

</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ZOOM */}
      {zoomImage && (
        <div className="zoom-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} />
        </div>
      )}
    </>
  )
}

export default KycDossierModal