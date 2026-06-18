import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import { getActivity } from '../../services/dashboard.service'
import './ActivitiesPage.css'

const ACTION_META = {
  creation_client:     { color: '#3b82f6', bg: '#eff6ff' },
  modification_client: { color: '#8b5cf6', bg: '#f5f3ff' },
  modification_profil: { color: '#06b6d4', bg: '#ecfeff' },
  kyc_valide:          { color: '#22c55e', bg: '#f0fdf4' },
  kyc_rejete:          { color: '#ef4444', bg: '#fff5f5' },
}

function ActivitiesPage({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivity(200)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [])

  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="ap-page" dir={dir} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="activities" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="ap-main">
        <div className="ap-header">
          <div>
            <h1>Activités</h1>
            <p className="ap-subtitle">Toutes les actions effectuées par les administrateurs</p>
          </div>
          <div className="ap-total">{activities.length} actions</div>
        </div>

        {loading ? (
          <div className="ap-loading">Chargement…</div>
        ) : activities.length === 0 ? (
          <div className="ap-empty">Aucune activité pour le moment</div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Cible</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((item) => {
                  const meta = ACTION_META[item.action] ?? {}
                  const ts = new Date(item.performedAt)
                  return (
                    <tr key={`${item.adminId}_${item.performedAt}`}>
                      <td className="ap-cell-admin">
                        <div className="ap-avatar">{item.adminInitials}</div>
                        <span>{item.adminName}</span>
                      </td>
                      <td>
                        <span className="ap-badge" style={{ color: meta.color, background: meta.bg }}>
                          {item.actionLabel}
                        </span>
                      </td>
                      <td className="ap-cell-target">{item.clientName}</td>
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
