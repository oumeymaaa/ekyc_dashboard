import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import { getActivity } from '../../services/dashboard.service'
import './ActivitiesPage.css'

const ACTION_META = {
  creation_client:     { color: '#3b82f6', bg: '#eff6ff' },
  modification_client: { color: '#8b5cf6', bg: '#f5f3ff' },
  modification_profil: { color: '#06b6d4', bg: '#ecfeff' },
  deletion_client:     { color: '#ef4444', bg: '#fef2f2' },
  kyc_valide:          { color: '#22c55e', bg: '#f0fdf4' },
  kyc_rejete:          { color: '#ef4444', bg: '#fff5f5' },
}

function ActivitiesPage({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const fetchActivities = useCallback(() => {
    getActivity(200)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchActivities()
    intervalRef.current = setInterval(fetchActivities, 30000)
    return () => clearInterval(intervalRef.current)
  }, [fetchActivities])

  useEffect(() => {
    const onFocus = () => fetchActivities()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchActivities])

  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="ap-page" dir={dir} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="activities" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="ap-main">
        <div className="ap-header">
          <div>
            <h1>{t('dashboard.activity.title')}</h1>
            <p className="ap-subtitle">{t('dashboard.activity.subtitle')}</p>
          </div>
          <div className="ap-header-actions">
            <span className="ap-total">{t('activities.count', { count: activities.length })}</span>
            <button className="ap-refresh-btn" onClick={fetchActivities} title={t('activities.refresh')}>
              ↻
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ap-loading">{t('common.loading')}</div>
        ) : activities.length === 0 ? (
          <div className="ap-empty">{t('activities.empty')}</div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                  <tr>
                    <th>{t('activities.table.admin')}</th>
                    <th>{t('activities.table.action')}</th>
                    <th>{t('activities.table.target')}</th>
                    <th>{t('activities.table.date')}</th>
                  </tr>
              </thead>
              <tbody>
                {activities.map((item) => {
                  const meta = ACTION_META[item.action] ?? { color: '#6b7280', bg: '#f3f4f6' }
                  const ts = new Date(item.performedAt)
                  return (
                    <tr key={`${item.adminId}_${item.performedAt}`}>
                      <td className="ap-cell-admin">
                        <div className="ap-avatar">{item.adminInitials || '?'}</div>
                        <span>{item.adminName || t('activities.unknownAdmin')}</span>
                      </td>
                      <td>
                        <span className="ap-badge" style={{ color: meta.color, background: meta.bg }}>
                          {item.actionLabel}
                        </span>
                      </td>
                      <td className="ap-cell-target">{item.clientName || '—'}</td>
                      <td className="ap-cell-date">
                        {ts.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="ap-time">{ts.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default ActivitiesPage
