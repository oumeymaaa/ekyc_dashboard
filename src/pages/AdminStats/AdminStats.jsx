import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getAdminStats } from '../../services/statsService'
import {
  getDashboardStats,
  getKycDistribution,
  getEvolution,
  getScoreDistribution,
  getActivity,
} from '../../services/dashboard.service'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import './AdminStats.css'

const SCORE_FILLS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#22c55e']

const ACTION_COLORS = {
  create:              { color: '#3b82f6', bg: '#eff6ff' },
  update:              { color: '#8b5cf6', bg: '#f5f3ff' },
  validate_kyc:        { color: '#22c55e', bg: '#f0fdf4' },
  reject_kyc:          { color: '#ef4444', bg: '#fff5f5' },
  creation_client:     { color: '#3b82f6', bg: '#eff6ff' },
  modification_client: { color: '#8b5cf6', bg: '#f5f3ff' },
  kyc_valide:          { color: '#22c55e', bg: '#f0fdf4' },
  kyc_rejete:          { color: '#ef4444', bg: '#fff5f5' },
}

/* ── KPI Card ───────────────────────────────────── */
function KpiCard({ icon, title, value, delta, deltaLabel, trend, color }) {
  const { t } = useTranslation()
  const isUp    = delta !== undefined ? delta >= 0 : trend?.direction === 'up'
  const badge   = deltaLabel ?? (trend ? `${Math.abs(trend.value)}%` : '—')
  const display = typeof value === 'number' ? value.toLocaleString() : (value ?? '—')
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: color + '18', color }}>{icon}</div>
        <div className={`kpi-trend ${isUp ? 'trend-up' : 'trend-down'}`}>
          {isUp ? '↑' : '↓'} {badge}
        </div>
      </div>
      <div className="kpi-value">{display}</div>
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

/* ── AdminStats page ────────────────────────────── */
function AdminStats({ admin, onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()

  const [stats,         setStats]         = useState(null)
  const [kpiData,       setKpiData]       = useState(null)
  const [kycDistData,   setKycDistData]   = useState(null)
  const [evolutionData, setEvolutionData] = useState(null)
  const [scoreData,     setScoreData]     = useState(null)
  const [activityData,  setActivityData]  = useState(null)
  const [loading,       setLoading]       = useState(true)


  useEffect(() => {
    const id = admin.id
    Promise.all([
      getAdminStats(id).catch(() => null),
      getDashboardStats(id).catch(() => null),
      getKycDistribution(id).catch(() => null),
      getEvolution(id).catch(() => null),
      getScoreDistribution(id).catch(() => null),
      getActivity(5, id).catch(() => null),
    ]).then(([mockData, kpi, kycDist, evolution, score, activity]) => {
      setStats(mockData)
      setKpiData(kpi)
      setKycDistData(kycDist)
      setEvolutionData(evolution)
      setScoreData(score)
      setActivityData(activity)
    }).finally(() => setLoading(false))  
  }, [admin.id])

  const locale   = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'
 const initials = admin.firstName && admin.lastName
    ? `${admin.firstName[0]}${admin.lastName[0]}`
    : '?'

  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
    if (diff < 60)    return t('dashboard.timeAgo.seconds', { n: diff })
    if (diff < 3600)  return t('dashboard.timeAgo.minutes', { n: Math.floor(diff / 60) })
    if (diff < 86400) return t('dashboard.timeAgo.hours',   { n: Math.floor(diff / 3600) })
    return t('dashboard.timeAgo.days', { n: Math.floor(diff / 86400) })
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="as-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
        <Sidebar activePage="admins" onNavigate={onNavigate} onLogout={onLogout} />
        <main className="as-main">
          <div className="as-loading">
            <div className="as-spinner" />
            <p>{t('adminStats.loading')}</p>
          </div>
        </main>
      </div>
    )
  }

  const overview          = stats?.overview          ?? { totalClients: 0, kycValidated: 0, kycRejected: 0, kycPending: 0, avgFacialScore: 0, trends: { totalClients: { value: 0, direction: 'up' }, kycValidated: { value: 0, direction: 'up' }, kycRejected: { value: 0, direction: 'up' }, avgFacialScore: { value: 0, direction: 'up' } } }
  const clientsOverTime   = stats?.clientsOverTime   ?? []
  const kycDistribution   = stats?.kycDistribution   ?? []
  const scoreDistribution = stats?.scoreDistribution ?? []
  const recentActivity    = stats?.recentActivity    ?? []
  const kycTotalMock      = overview.kycValidated + overview.kycRejected + overview.kycPending

  const kycDistributionForChart = kycDistData ? [
    { name: t('dashboard.charts.validated'),   value: kycDistData.valid.count,   fill: '#22c55e' },
    { name: t('clientList.kycStatus.pending'), value: kycDistData.pending.count, fill: '#f59e0b' },
    { name: t('dashboard.charts.rejected'),    value: kycDistData.invalid.count, fill: '#ef4444' },
  ] : kycDistribution
  const kycTotalForChart = kycDistData?.total ?? kycTotalMock

  const evolutionForChart = evolutionData ?? clientsOverTime

  const scoreDistributionForChart = scoreData
    ? scoreData.buckets.map((b, i) => ({ ...b, fill: SCORE_FILLS[i] }))
    : scoreDistribution

  const ACTION_META = {
    create:              { label: t('dashboard.activity.create'),       ...ACTION_COLORS.create },
    update:              { label: t('dashboard.activity.update'),       ...ACTION_COLORS.update },
    validate_kyc:        { label: t('dashboard.activity.validate_kyc'), ...ACTION_COLORS.validate_kyc },
    reject_kyc:          { label: t('dashboard.activity.reject_kyc'),   ...ACTION_COLORS.reject_kyc },
    creation_client:     ACTION_COLORS.creation_client,
    modification_client: ACTION_COLORS.modification_client,
    kyc_valide:          ACTION_COLORS.kyc_valide,
    kyc_rejete:          ACTION_COLORS.kyc_rejete,
  }

  const activityFeed = activityData
    ? activityData.map((item) => ({
        id:          `${item.adminId}_${item.performedAt}`,
        initials:    item.adminInitials,
        action:      item.action,
        actionLabel: item.actionLabel,
        target:      item.clientName,
        timestamp:   item.performedAt,
        timeAgoStr:  item.timeAgo,
      }))
    : recentActivity

  const orgName             = admin.organisation?.name_organisation ?? admin.organization ?? '—'
  const totalClientsDisplay = kpiData?.totalClients.value ?? overview.totalClients
  const avgScoreDisplay     = kpiData?.avgFacialScore.value ?? overview.avgFacialScore
  const isAdminActive       = admin.status === 'active' || admin.status?.code === 'actif'

  return (
    <div className="as-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="admins" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="as-main">
        {/* Breadcrumb */}
        <div className="as-breadcrumb">
          <button className="btn-back" onClick={() => onNavigate('admins')}>
            {t('adminStats.backToAdmins')}
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{admin.firstName} {admin.lastName}</span>

        </div>

        {/* Admin profile card */}
        <div className="as-profile-card">
          <div className="profile-left">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h1 className="profile-name">{admin.firstName} {admin.lastName}</h1>
              <p className="profile-email">{admin.email}</p>
              <p className="profile-meta">
                <span className="org-pill">{orgName}</span>
                <span className={`status-pill status-${isAdminActive ? 'active' : 'pending'}`}>
                  {isAdminActive ? t('adminStats.statusActive') : t('adminStats.statusPending')}
                </span>
              </p>
            </div>
          </div>
          <div className="profile-right">
            <div className="profile-stat">
              <span className="profile-stat-value">
                {typeof totalClientsDisplay === 'number'
                  ? totalClientsDisplay.toLocaleString()
                  : totalClientsDisplay}
              </span>
              <span className="profile-stat-label">{t('adminStats.clientsManaged')}</span>
             </div>
            <div className="profile-divider" />
            <div className="profile-stat">
               <span className="profile-stat-value">{avgScoreDisplay}%</span>
              <span className="profile-stat-label">{t('adminStats.averageScore')}</span>
            </div>
            <div className="profile-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{formatDate(admin.createdAt)}</span>
              <span className="profile-stat-label">{t('adminStats.accountCreatedOn')}</span>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="kpi-grid">
          <KpiCard icon="👥" title={t('dashboard.kpi.totalClients')}
            value={kpiData?.totalClients.value ?? overview.totalClients}
            delta={kpiData?.totalClients.delta}
            deltaLabel={kpiData?.totalClients.deltaLabel}
            trend={!kpiData ? overview.trends.totalClients : undefined}
            color="#0f3460" />
          <KpiCard icon="✅" title={t('dashboard.kpi.kycValidated')}
            value={kpiData?.kycValidated.value ?? overview.kycValidated}
            delta={kpiData?.kycValidated.delta}
            deltaLabel={kpiData?.kycValidated.deltaLabel}
            trend={!kpiData ? overview.trends.kycValidated : undefined}
            color="#22c55e" />
          <KpiCard icon="❌" title={t('dashboard.kpi.kycRejected')}
            value={kpiData?.kycRejected.value ?? overview.kycRejected}
            delta={kpiData?.kycRejected.delta}
            deltaLabel={kpiData?.kycRejected.deltaLabel}
            trend={!kpiData ? overview.trends.kycRejected : undefined}
            color="#ef4444" />
          <KpiCard icon="🎯" title={t('dashboard.kpi.avgFacialScore')}
            value={kpiData?.avgFacialScore.value ?? overview.avgFacialScore}
            delta={kpiData?.avgFacialScore.delta}
            deltaLabel={kpiData?.avgFacialScore.deltaLabel}
            trend={!kpiData ? overview.trends.avgFacialScore : undefined}
            color="#8b5cf6" />
          </div>

        {/* Charts row 1 */}
        <div className="chart-row">
          <div className="chart-card chart-card--wide">
            <div className="chart-card-header">
               <h2>{t('dashboard.charts.clientEvolution')}</h2>
              <span className="chart-badge">{t('adminStats.last6MonthsOrg', { org: orgName })}</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={evolutionForChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gcl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0f3460" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f3460" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gva" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="grj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                  </linearGradient>
                                    <linearGradient id="gpd" x1="0" y1="0" x2="0" y2="1">
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
                        <Area type="monotone" dataKey="clients"   name={t('dashboard.charts.clients')}          stroke="#0f3460" strokeWidth={2} fill="url(#gcl)" dot={false} />
                <Area type="monotone" dataKey="validated" name={t('dashboard.charts.validated')}         stroke="#22c55e" strokeWidth={2} fill="url(#gva)" dot={false} />
                <Area type="monotone" dataKey="rejected"  name={t('dashboard.charts.rejected')}          stroke="#ef4444" strokeWidth={2} fill="url(#grj)" dot={false} />
                <Area type="monotone" dataKey="pending"   name={t('clientList.kycStatus.pending')}       stroke="#f59e0b" strokeWidth={2} fill="url(#gpd)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          <div className="chart-card">
            <div className="chart-card-header">
                    <h2>{t('dashboard.charts.kycDistribution')}</h2>
              <span className="chart-badge">{kycTotalForChart} {t('dashboard.charts.files')}</span>
            </div>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={kycDistributionForChart} cx="50%" cy="50%"
                       innerRadius={62} outerRadius={88} paddingAngle={3} dataKey="value" />
                 <Tooltip formatter={(v, n) => [
                    `${v} (${kycTotalForChart > 0 ? ((v / kycTotalForChart) * 100).toFixed(1) : 0}%)`, n,
                  ]} />
                  <Legend iconType="circle" iconSize={8}
                          formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                    <span className="donut-total">{kycTotalForChart}</span>
                <span className="donut-label">{t('adminStats.donutTotal')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>{t('dashboard.charts.scoreDistribution')}</h2>
              <span className="chart-badge">{t('dashboard.charts.facialMatching')}</span>
           </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={scoreDistributionForChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(v) => [v, t('dashboard.charts.clients')]} />
                <Bar dataKey="count" name={t('dashboard.charts.clients')} radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity feed */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>{t('dashboard.charts.recentActivity')}</h2>
              <span className="chart-badge">{admin.firstName} {admin.lastName}</span>
            </div>
            <ul className="activity-feed">
             {activityFeed.map((item) => {
                const meta = ACTION_META[item.action] ?? { color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <li key={item.id} className="activity-item">
                    <div className="activity-avatar">{item.initials ?? initials}</div>
                    <div className="activity-body">
                      <p className="activity-text">
                        <span className="activity-action-badge"
                              style={{ color: meta.color, background: meta.bg }}>
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

export default AdminStats
