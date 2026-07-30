import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
const PAGE_SIZE = 10
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import { getActivity } from '../../services/dashboard.service'
import './ActivitiesPage.css'

const ACTIONS = ['creation_client', 'modification_client', 'modification_profil', 'deletion_client', 'kyc_valide', 'kyc_rejete']

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
  const [filterAction, setFilterAction] = useState('all')
  const [page, setPage] = useState(0)
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

  const filtered = useMemo(() => {
    const f = filterAction === 'all' ? activities : activities.filter(a => a.action === filterAction)
    return f
  }, [activities, filterAction])

  const totalPages = useMemo(() => {
    const n = Math.ceil(filtered.length / PAGE_SIZE)
    return n || 1
  }, [filtered])

  const paginated = useMemo(() =>
    filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
  [filtered, page])

  useEffect(() => { setPage(0) }, [filterAction])

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
          </div>
        </div>

        <div className="ap-filter-row">
          {ACTIONS.map(action => (
            <button
              key={action}
              className={`ap-filter-btn${filterAction === action ? ' active' : ''}`}
              style={filterAction === action ? { color: ACTION_META[action].color, background: ACTION_META[action].bg, borderColor: ACTION_META[action].color } : {}}
              onClick={() => setFilterAction(action)}
            >
              {t(`activities.actions.${action}`)}
            </button>
          ))}
          <button
            className={`ap-filter-btn${filterAction === 'all' ? ' active' : ''}`}
            onClick={() => setFilterAction('all')}
          >
            {t('activities.all')}
          </button>
        </div>

        {loading ? (
          <div className="ap-loading">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
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
                {paginated.map((item) => {
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
            {totalPages > 1 && (
              <div className="ap-pagination">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
                <span className="ap-page-info">{page + 1} / {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ActivitiesPage
