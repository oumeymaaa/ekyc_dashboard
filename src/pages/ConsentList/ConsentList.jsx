import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import { getHeaders } from '../../services/api'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
import './ConsentList.css'

const formatDate = (d, locale) =>
  new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

function ConsentList({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const [consents, setConsents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchConsents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/consent`, { headers: getHeaders() })
      const data = await res.json()
      setConsents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsents()
    const interval = setInterval(fetchConsents, 10000)
    return () => clearInterval(interval)
  }, [])

  const filtered = consents.filter(c => {
    if (filterStatus === 'all') return true
    return c.status === filterStatus
  })

  const exportCsv = () => {
    const rows = [['Client', 'Email', 'Statut', 'IP', 'Date'].join(',')]
    consents.forEach(c => {
      rows.push([`"${c.client?.first_name} ${c.client?.last_name}"`, `"${c.client?.email}"`, c.status, c.ip_address, c.accepted_at].join(','))
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'consentements.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const initials = (f, l) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase()

  return (
    <div className="page-layout" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="consents" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="consent-page">

          {/* Header */}
          <div className="consent-header">
            <div className="consent-header-left">
              <div className="consent-header-icon">🔒</div>
            <div>
              <h1>{t('consentList.title')}</h1>
              <p>{t('consentList.subtitle')}</p>
            </div>
          </div>
          </div>

          {/* Status filter + Export row */}
          <div className="consent-toolbar">
            <div className="consent-filter-bar">
              {[
                { value: 'all', label: t('consentList.filterAll') },
                { value: 'accepted', label: `✅ ${t('consentList.filterAccepted')}` },
                { value: 'withdrawn', label: `❌ ${t('consentList.filterWithdrawn')}` },
              ].map((f) => (
                <button
                  key={f.value}
                  className={`consent-filter-btn ${filterStatus === f.value ? 'active' : ''}`}
                  onClick={() => setFilterStatus(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="consent-header-actions">
              <button className="consent-btn consent-btn-primary" onClick={exportCsv}><span>📥</span> {t('consentList.exportCsv')}</button>
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="consent-state">
              <div className="consent-spinner" />
              <p>{t('common.loading', 'Chargement...')}</p>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="consent-state">
              <span className="consent-state-emoji">📭</span>
              <p>{filterStatus !== 'all' ? t('consentList.noMatch') : t('consentList.empty')}</p>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div className="consent-table-wrap">
              <table className="consent-table">
                <thead>
                  <tr>
                    <th>{t('consentList.client')}</th>
                    <th>{t('consentList.email')}</th>
                    <th>{t('consentList.status')}</th>
                    <th>{t('consentList.ip')}</th>
                    <th>{t('consentList.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="consent-client-cell">
                          <div className="consent-avatar" title={`${c.client?.first_name} ${c.client?.last_name}`}>
                            {initials(c.client?.first_name, c.client?.last_name) || '?'}
                          </div>
                          <div>
                            <div className="consent-client-name">{c.client?.first_name} {c.client?.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="consent-cell-muted">{c.client?.email}</td>
                      <td>
                        <span className={`consent-badge ${c.status === 'accepted' ? 'badge-accepted' : 'badge-withdrawn'}`}>
                          {c.status === 'accepted' ? `✅ ${t('consentList.filterAccepted')}` : `❌ ${t('consentList.filterWithdrawn')}`}
                        </span>
                      </td>
                      <td>
                        <code className="consent-ip">{c.ip_address || '—'}</code>
                      </td>
                      <td className="consent-cell-date">{formatDate(c.accepted_at, i18n.language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ConsentList
