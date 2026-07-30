import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getNotificationLogs } from '../../services/client.service'
import './NotificationLogModal.css'

function NotificationLogModal({ clientId, clientName, onClose }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [clientId])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await getNotificationLogs(clientId)
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = typeFilter === 'all' ? logs : logs.filter(l => l.type === typeFilter)

  return (
    <div className="kyc-overlay" onClick={onClose}>
      <div className="kyc-modal" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>

        <div className="kyc-header">
          <h3 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>{t('notifications.title', 'Historique des notifications')}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="kyc-body">
          <div className="profile-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar">🔔</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{clientName}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Notifications envoyées</div>
              </div>
            </div>
            <div className="score-box">
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{logs.length}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>total</div>
            </div>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { value: 'all',   label: t('notifications.filterAll', 'Tout') },
              { value: 'email', label: '📧 Email' },
              { value: 'push',  label: '📱 Push' },
            ].map(f => (
              <button
                key={f.value}
                className={`kyc-filter-btn ${typeFilter === f.value ? 'active' : ''}`}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && <div className="notify-state">{t('common.loading')}</div>}
          {error && <div className="notify-state error">{error}</div>}

          {!loading && !error && (
            filtered.length === 0 ? (
              <div className="notify-empty">{t('notifications.empty', 'Aucune notification')}</div>
            ) : (
              <div className="notify-table-wrap">
                <table className="notify-table">
                  <thead>
                    <tr>
                      <th>{t('notifications.date', 'Date')}</th>
                      <th>{t('notifications.type', 'Type')}</th>
                      <th>{t('notifications.content', 'Contenu')}</th>
                      <th style={{ textAlign: 'center' }}>{t('notifications.status', 'Statut')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(log => (
                      <tr key={log.id}>
                        <td className="notify-cell-date">
                          {new Date(log.sent_at).toLocaleDateString(locale, {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span className={`kyc-status-badge ${log.type}`}>
                            {log.type === 'email' ? '📧' : '📱'} {log.type === 'email' ? 'Email' : 'Push'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{log.content}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`notify-status-dot ${log.status}`}>
                            {log.status === 'sent' ? '✅ Envoyé' : '❌ Échec'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationLogModal
