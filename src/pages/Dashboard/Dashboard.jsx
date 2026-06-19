import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getStats } from '../../services/statsService'
import { getDashboardStats, getKycDistribution, getEvolution, getActivity, getScoreDistribution } from '../../services/dashboard.service'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import './Dashboard.css'

function KpiCard({ icon, title, value, delta, deltaLabel, color }) {
  const { t } = useTranslation()
  const isUp = delta >= 0
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: color + '18', color }}>
          {icon}
        </div>
        <div className={`kpi-trend ${isUp ? 'trend-up' : 'trend-down'}`}>
          {isUp ? '↑' : '↓'} {deltaLabel}
        </div>
      </div>
      <div className="kpi-value">{displayValue}</div>
      <div className="kpi-title">{title}</div>
      <div className="kpi-sub">{t('dashboard.vsPreviousMonth')}</div>
    </div>
  )
}


/* ── Custom tooltip ─────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      {label && <p className="tooltip-label">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: 13 }}>
          {p.name} : <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  )
}

/* ── Dashboard ──────────────────────────────────── */
function Dashboard({ onNavigate, onLogout }) {
 const { t, i18n } = useTranslation()
  const [stats, setStats]         = useState(null)
  const [kpiStats, setKpiStats]   = useState(null)
  const [kycDistData, setKycDist]   = useState(null)
  const [evolutionData, setEvolution]   = useState(null)
  const [activityData, setActivity]         = useState(null)
  const [scoreDistApiData, setScoreDist]    = useState(null)
  const [loading, setLoading]               = useState(true)

  const timeAgo = (iso) => {
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60)    return t('dashboard.timeAgo.seconds', { n: diff })
    if (diff < 3600)  return t('dashboard.timeAgo.minutes', { n: Math.floor(diff / 60) })
    if (diff < 86400) return t('dashboard.timeAgo.hours',   { n: Math.floor(diff / 3600) })
    return t('dashboard.timeAgo.days', { n: Math.floor(diff / 86400) })
  }


  useEffect(() => {
    const loadData = () => Promise.all([
      getStats(),
      getDashboardStats().catch(() => null),
      getKycDistribution().catch(() => null),
      getEvolution().catch(() => null),
      getActivity(5).catch(() => null),
      getScoreDistribution().catch(() => null),
    ]).then(([mockData, apiData, kycDist, evolution, activity, scoreDist]) => {
      setStats(mockData)
      setKpiStats(apiData)
      setKycDist(kycDist)
      setEvolution(evolution)
      setActivity(activity)
      setScoreDist(scoreDist)
    }).catch(() => {}).finally(() => setLoading(false))

    loadData()
    const interval = setInterval(loadData, 60000)
    const onFocus = () => { loadData() }
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (loading) {
    return (
      <div className="dash-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
        <Sidebar activePage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <main className="dash-main">
          <div className="dash-loading">
            <div className="dash-spinner" />
            <p>{t('dashboard.loading')}</p>
          </div>
        </main>
      </div>
    )
  }

  const { overview, clientsOverTime, kycDistribution, scoreDistribution, recentActivity } = stats
  const kycTotal = overview.kycValidated + overview.kycRejected + overview.kycPending

  const kycDistributionForChart = kycDistData ? [
    { name: t('dashboard.charts.validated'),    value: kycDistData.valid.count,    fill: '#22c55e' },
    { name: t('clientList.kycStatus.pending'),  value: kycDistData.pending.count,  fill: '#f59e0b' },
    { name: t('dashboard.charts.rejected'),     value: kycDistData.invalid.count,  fill: '#ef4444' },
  ] : kycDistribution
  const kycTotalForChart = kycDistData?.total ?? kycTotal

  const SCORE_FILLS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#22c55e']
  const scoreDistributionForChart = scoreDistApiData
    ? scoreDistApiData.buckets.map((b, i) => ({ ...b, fill: SCORE_FILLS[i] }))
    : scoreDistribution

  const ACTION_META = {
    create:              { label: t('dashboard.activity.create'),       color: '#3b82f6', bg: '#eff6ff' },
    update:              { label: t('dashboard.activity.update'),       color: '#8b5cf6', bg: '#f5f3ff' },
    validate_kyc:        { label: t('dashboard.activity.validate_kyc'), color: '#22c55e', bg: '#f0fdf4' },
    reject_kyc:          { label: t('dashboard.activity.reject_kyc'),   color: '#ef4444', bg: '#fff5f5' },
    creation_client:     { color: '#3b82f6', bg: '#eff6ff' },
    modification_client: { color: '#8b5cf6', bg: '#f5f3ff' },
    modification_profil: { color: '#f59e0b', bg: '#fffbeb' },
    deletion_client:     { color: '#ef4444', bg: '#fef2f2' },
    kyc_valide:          { color: '#22c55e', bg: '#f0fdf4' },
    kyc_rejete:          { color: '#ef4444', bg: '#fff5f5' },
  }

  const activityFeed = activityData
    ? activityData.map((item) => ({
        id:          `${item.adminId}_${item.performedAt}`,
        adminName:   item.adminName,
        initials:    item.adminInitials,
        action:      item.action,
        actionLabel: item.actionLabel,
        target:      item.clientName,
        timestamp:   item.performedAt,
      }))
    : recentActivity

  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'
  const dateStr = new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="dash-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="dash-main">
        {/* Page header */}
        <div className="dash-header">
          <div>
            <h1>{t('dashboard.title')}</h1>
            <p className="dash-subtitle">
              {t('dashboard.subtitle')} — {t('dashboard.updatedOn', { date: dateStr })}

            </p>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="kpi-grid">
           <KpiCard icon="👥" title={t('dashboard.kpi.totalClients')}
            value={kpiStats?.totalClients.value ?? overview.totalClients}
            delta={kpiStats?.totalClients.delta ?? overview.trends.totalClients.value}
            deltaLabel={kpiStats?.totalClients.deltaLabel ?? `${overview.trends.totalClients.value}%`}
            color="#0f3460" />
          <KpiCard icon="✅" title={t('dashboard.kpi.kycValidated')}
            value={kpiStats?.kycValidated.value ?? overview.kycValidated}
            delta={kpiStats?.kycValidated.delta ?? overview.trends.kycValidated.value}
            deltaLabel={kpiStats?.kycValidated.deltaLabel ?? `${overview.trends.kycValidated.value}%`}
            color="#22c55e" />
          <KpiCard icon="❌" title={t('dashboard.kpi.kycRejected')}
            value={kpiStats?.kycRejected.value ?? overview.kycRejected}
            delta={kpiStats?.kycRejected.delta ?? overview.trends.kycRejected.value}
            deltaLabel={kpiStats?.kycRejected.deltaLabel ?? `${overview.trends.kycRejected.value}%`}
            color="#ef4444" />
          <KpiCard icon="🎯" title={t('dashboard.kpi.avgFacialScore')}
            value={kpiStats?.avgFacialScore.value ?? overview.avgFacialScore}
            delta={kpiStats?.avgFacialScore.delta ?? overview.trends.avgFacialScore.value}
            deltaLabel={kpiStats?.avgFacialScore.deltaLabel ?? `${overview.trends.avgFacialScore.value}%`}
            color="#8b5cf6" />
        </div>

        {/* ── Charts row 1 ── */}
        <div className="chart-row">

          {/* Area chart — client evolution */}
          <div className="chart-card chart-card--wide">
            <div className="chart-card-header">
              <h2>{t('dashboard.charts.clientEvolution')}</h2>
              <span className="chart-badge">{t('dashboard.charts.last6Months')}</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={evolutionData ?? clientsOverTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0f3460" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f3460" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gradValidated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                <Area type="monotone" dataKey="clients"   name={t('dashboard.charts.clients')}   stroke="#0f3460" strokeWidth={2} fill="url(#gradClients)"   dot={false} />
                <Area type="monotone" dataKey="validated" name={t('dashboard.charts.validated')} stroke="#22c55e" strokeWidth={2} fill="url(#gradValidated)" dot={false} />
                <Area type="monotone" dataKey="rejected"  name={t('dashboard.charts.rejected')}              stroke="#ef4444" strokeWidth={2} fill="url(#gradRejected)"  dot={false} />
                <Area type="monotone" dataKey="pending"   name={t('clientList.kycStatus.pending')} stroke="#f59e0b" strokeWidth={2} fill="url(#gradPending)"   dot={false} />              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart — KYC distribution */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>{t('dashboard.charts.kycDistribution')}</h2>
              <span className="chart-badge">{kycTotalForChart.toLocaleString()} {t('dashboard.charts.files')}</span>
            </div>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={kycDistributionForChart} cx="50%" cy="50%" innerRadius={68} outerRadius={96} paddingAngle={3} dataKey="value" />
                  <Tooltip formatter={(v, n) => [`${v.toLocaleString()} (${((v / kycTotalForChart) * 100).toFixed(1)}%)`, n]} />
                  <Legend iconType="circle" iconSize={8}
                          formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label via CSS — avoids Recharts label-per-slice issue */}
              <div className="donut-center">
                <span className="donut-total">{kycTotalForChart.toLocaleString()}</span>
                <span className="donut-label">{t('dashboard.total')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Charts row 2 ── */}
        <div className="chart-row">

          {/* Bar chart — score distribution */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>{t('dashboard.charts.scoreDistribution')}</h2>
              <span className="chart-badge">{t('dashboard.charts.facialMatching')}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistributionForChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
               <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(v) => [v.toLocaleString(), t('dashboard.charts.clients')]} />
                <Bar dataKey="count" name={t('dashboard.charts.clients')} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity feed */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>{t('dashboard.charts.recentActivity')}</h2>
              <span className="chart-badge">{t('dashboard.charts.admins')}</span>
            </div>
            <ul className="activity-feed">
              {activityFeed.map((item) => {
                const meta = ACTION_META[item.action] ?? { color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <li key={item.id} className="activity-item">
                    <div className="activity-avatar">{item.initials}</div>
                    <div className="activity-body">
                      <p className="activity-text">
                        <strong>{item.adminName}</strong>{' '}
                        <span className="activity-action-badge" style={{ color: meta.color, background: meta.bg }}>
                          {item.actionLabel ?? meta.label}
                        </span>
                      </p>
                      <p className="activity-target">→ {item.target}</p>
                    </div>
                    <span className="activity-time">{item.timeAgoStr ?? timeAgo(item.timestamp)}</span>
                  </li>
                )
              })}
            </ul>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Dashboard
