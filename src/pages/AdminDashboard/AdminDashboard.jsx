import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getUser } from '../../services/auth.service'
import { getDashboardStats, getKycDistribution, getEvolution, getScoreDistribution } from '../../services/dashboard.service'
import { getClients } from '../../services/client.service'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import './AdminDashboard.css'

function AdminDashboard({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const user = getUser()
  const adminId = user?.id

  const [kpiStats, setKpiStats]       = useState(null)
  const [kycDistData, setKycDist]     = useState(null)
  const [evolutionData, setEvolution] = useState(null)
  const [scoreData, setScoreData]     = useState(null)
  const [clients, setClients]         = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const loadData = () => Promise.all([
      getDashboardStats(adminId).catch(() => null),
      getKycDistribution(adminId).catch(() => null),
      getEvolution(adminId).catch(() => null),
      getScoreDistribution(adminId).catch(() => null),
      getClients().catch(() => []),
    ]).then(([kpi, kyc, evo, score, cl]) => {
      setKpiStats(kpi)
      setKycDist(kyc)
      setEvolution(evo)
      setScoreData(score)
      setClients(cl ?? [])
    }).catch(() => {}).finally(() => setLoading(false))

    loadData()
    const interval = setInterval(loadData, 60000)
    const onFocus = () => { loadData() }
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [adminId])

  const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-GB' : 'fr-FR'
  const dateStr = new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

  /* ── Derived stats ── */
  const today = useMemo(() => {
    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)
    const newToday = clients.filter(c => c.createdAt?.startsWith(todayKey)).length
    const kycToday = clients.filter(c => {
      if (!c.kyc || !c.kyc.createdAt) return false
      return c.kyc.createdAt.startsWith(todayKey)
    }).length
    const validatedToday = clients.filter(c => {
      if (!c.kyc || !c.kyc.createdAt) return false
      const realStatus = c.kyc.deletedAt ? 'non_valide' : c.kyc.status
      return c.kyc.createdAt.startsWith(todayKey) && realStatus === 'valide'
    }).length
    const rejectedToday = clients.filter(c => {
      if (!c.kyc || !c.kyc.createdAt) return false
      const realStatus = c.kyc.deletedAt ? 'non_valide' : c.kyc.status
      return c.kyc.createdAt.startsWith(todayKey) && realStatus === 'non_valide'
    }).length
    return { newToday, kycToday, validatedToday, rejectedToday }
  }, [clients])

  const recentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [clients])

  const pendingClients = useMemo(() => {
    return clients.filter(c => {
      if (!c.kyc) return false
      const realStatus = c.kyc.deletedAt ? 'non_valide' : c.kyc.status
      return realStatus === 'en_attente'
    }).slice(0, 5)
  }, [clients])

  const total    = kpiStats?.totalClients.value   ?? 0
  const validated = kpiStats?.kycValidated.value  ?? 0
  const rejected  = kpiStats?.kycRejected.value   ?? 0
  const pending   = (kycDistData?.pending?.count   ?? 0)
  const avgScore  = kpiStats?.avgFacialScore.value ?? 0

  const validationRate = (validated + rejected) > 0
    ? Math.round((validated / (validated + rejected)) * 100)
    : 0

  const conversionRate = total > 0
    ? Math.round(((validated + rejected) / total) * 100)
    : 0

  const evo = evolutionData ?? []
  const thisMonth = evo.length > 0 ? evo[evo.length - 1] : null
  const thisMonthClients = thisMonth?.clients ?? 0

  const kycDistForChart = kycDistData
    ? [
        { name: t('dashboard.charts.validated'), value: kycDistData.valid.count,  fill: '#22c55e' },
        { name: t('clientList.kycStatus.pending'), value: kycDistData.pending.count, fill: '#f59e0b' },
        { name: t('dashboard.charts.rejected'),  value: kycDistData.invalid.count, fill: '#ef4444' },
      ]
    : []

  const kycTotal = kycDistData
    ? kycDistData.valid.count + kycDistData.pending.count + kycDistData.invalid.count
    : 0

  const SCORE_FILLS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#22c55e']
  const scoreDistForChart = scoreData
    ? scoreData.buckets.map((b, i) => ({ ...b, fill: SCORE_FILLS[i] }))
    : []

  function getKycBadge(kyc) {
    if (!kyc) return { label: '—', cls: 'no-kyc' }
    const status = kyc.deletedAt ? 'non_valide' : kyc.status
    const map = {
      valide:     { label: t('clientList.kycStatus.valid'),   cls: 'valide' },
      en_attente: { label: t('clientList.kycStatus.pending'), cls: 'en-attente' },
      non_valide: { label: t('clientList.kycStatus.invalid'), cls: 'non-valide' },
    }
    return map[status] ?? { label: '—', cls: 'no-kyc' }
  }

  function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="admin-chart-tooltip">
        {label && <p className="tt-label">{label}</p>}
        {payload.map((p) => (
          <p key={p.name} className="tt-row" style={{ color: p.color }}>
            {p.name} : <strong>{p.value.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-dash" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
        <Sidebar activePage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <main className="admin-main">
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>{t('dashboard.loadingDashboard')}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-dash" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="admin-main">
        <div className="admin-main-inner">

        {/* ═══ Header ═══ */}
        <div className="admin-header">
          <div className="admin-welcome">
            <h1>{t('dashboard.greeting', { name: user?.firstName })}</h1>
            <p>{t('dashboard.activityOverview')}</p>
          </div>
          <div className="admin-header-right">
            <div className="date">{dateStr}</div>
            <div>{t('dashboard.updatedAt')} {timeStr}</div>
          </div>
        </div>

        {/* ═══ Résumé du jour ═══ */}
        <div className="admin-today">
          <div className="admin-today-card">
            <div className="admin-today-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div className="admin-today-body">
              <div className="admin-today-value">{today.newToday}</div>
              <div className="admin-today-label">{t('dashboard.today.newClients')}</div>
            </div>
          </div>
          <div className="admin-today-card">
            <div className="admin-today-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="admin-today-body">
              <div className="admin-today-value">{today.validatedToday}</div>
              <div className="admin-today-label">{t('dashboard.today.kycValidated')}</div>
            </div>
          </div>
          <div className="admin-today-card">
            <div className="admin-today-icon" style={{ background: '#fff5f5', color: '#ef4444' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div className="admin-today-body">
              <div className="admin-today-value">{today.rejectedToday}</div>
              <div className="admin-today-label">{t('dashboard.today.kycRejected')}</div>
            </div>
          </div>
        </div>

        {/* ═══ KPI Cards ═══ */}
        <div className="admin-kpi-grid">
          {[
            { icon: '👥', value: total, label: t('dashboard.kpi.totalClients'), color: '#6366f1', bg: '#eef2ff', delta: kpiStats?.totalClients.delta ?? 0, deltaLabel: kpiStats?.totalClients.deltaLabel },
            { icon: '✅', value: validated, label: t('dashboard.kpi.kycValidated'), color: '#22c55e', bg: '#f0fdf4', delta: kpiStats?.kycValidated.delta ?? 0, deltaLabel: kpiStats?.kycValidated.deltaLabel },
            { icon: '❌', value: rejected, label: t('dashboard.kpi.kycRejected'), color: '#ef4444', bg: '#fff5f5', delta: kpiStats?.kycRejected.delta ?? 0, deltaLabel: kpiStats?.kycRejected.deltaLabel },
            { icon: '🎯', value: avgScore, label: t('dashboard.kpi.avgFacialScore'), color: '#8b5cf6', bg: '#f5f3ff', delta: kpiStats?.avgFacialScore.delta ?? 0, deltaLabel: kpiStats?.avgFacialScore.deltaLabel },
          ].map((k) => (
            <div className="admin-kpi" key={k.label}>
              <div className="admin-kpi-top">
                <div className="admin-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
                {k.delta !== 0 && (
                  <div className={`admin-kpi-trend ${k.delta >= 0 ? 'trend-up' : 'trend-down'}`}>
                    {k.delta >= 0 ? '↑' : '↓'} {k.deltaLabel ?? `${Math.abs(k.delta)}%`}
                  </div>
                )}
              </div>
              <div className="admin-kpi-value">{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}{k.suffix ?? ''}</div>
              <div className="admin-kpi-label">{k.label}</div>
              <div className="admin-kpi-sub">{t('dashboard.vsPreviousMonth')}</div>
            </div>
          ))}
        </div>

        {/* ═══ Secondary Metrics ═══ */}
        <div className="admin-metrics">
          {[
            { icon: '📊', value: `${validationRate}%`, label: t('dashboard.metrics.validationRate'), color: validated > rejected ? '#22c55e' : '#ef4444', bg: validated > rejected ? '#f0fdf4' : '#fff5f5' },
            { icon: '⏳', value: pending, label: t('dashboard.metrics.pending'), color: '#f59e0b', bg: '#fffbeb' },
            { icon: '📅', value: thisMonthClients, label: t('dashboard.metrics.newThisMonth'), color: '#3b82f6', bg: '#eff6ff' },
            { icon: '📈', value: `${conversionRate}%`, label: t('dashboard.metrics.kycCompletion'), color: '#8b5cf6', bg: '#f5f3ff' },
          ].map((m) => (
            <div className="admin-metric" key={m.label}>
              <div className="admin-metric-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
              <div className="admin-metric-body">
                <div className="admin-metric-value">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
                <div className="admin-metric-label">{m.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ Recent clients + Pending ═══ */}
        <div className="admin-mixed-row">
          <div className="admin-clients-card">
            <div className="admin-clients-header">
              <h3>{t('dashboard.section.recentClients')}</h3>
              {recentClients.length > 0 && <span className="badge">{recentClients.length}</span>}
            </div>
            <table className="admin-client-table">
              <thead>
                  <tr>
                    <th>{t('dashboard.tableHeader.client')}</th>
                    <th>{t('dashboard.tableHeader.email')}</th>
                    <th>{t('dashboard.tableHeader.kyc')}</th>
                  </tr>
              </thead>
              <tbody>
                {recentClients.map(c => {
                  const badge = getKycBadge(c.kyc)
                  return (
                    <tr key={c.id}>
                      <td className="admin-client-name">{c.firstName} {c.lastName}</td>
                      <td style={{ color: '#6b7280' }}>{c.email}</td>
                      <td><span className={`admin-kyc-badge ${badge.cls}`}>{badge.label}</span></td>
                    </tr>
                  )
                })}
                {recentClients.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px 0' }}>{t('dashboard.empty.noClients')}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pending-card">
            <div className="admin-pending-header">
              <h3>{t('dashboard.section.pendingFiles')}</h3>
              <span className="admin-chart-badge">{pending} {t('dashboard.total')}</span>
            </div>
            <div className="admin-pending-big">{pending}</div>
            <p className="admin-pending-sub">{t('dashboard.pendingSubtitle')}</p>
            <ul className="admin-pending-list">
              {pendingClients.length === 0 && (
                <li style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0', fontSize: 13 }}>{t('dashboard.empty.noPending')}</li>
              )}
              {pendingClients.map(c => (
                <li key={c.id} className="admin-pending-item">
                  <span className="admin-pending-item-name">{c.firstName} {c.lastName}</span>
                    <span className="admin-pending-item-link" onClick={() => onNavigate && onNavigate('clients')}>
                      {t('dashboard.viewLink')} →
                    </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ═══ Charts ═══ */}
        <div className="admin-chart-row">
          <div className="admin-chart-card wide">
            <div className="admin-chart-header">
              <h3>{t('dashboard.charts.clientEvolution')}</h3>
              <span className="admin-chart-badge">{t('dashboard.charts.last6Months')}</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={evolutionData ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                  <linearGradient id="ag3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="ag4" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                <Area type="monotone" dataKey="clients" name={t('dashboard.charts.clients')} stroke="#6366f1" strokeWidth={2} fill="url(#ag1)" dot={false} />
                <Area type="monotone" dataKey="validated" name={t('dashboard.charts.validated')} stroke="#22c55e" strokeWidth={2} fill="url(#ag2)" dot={false} />
                <Area type="monotone" dataKey="rejected" name={t('dashboard.charts.rejected')} stroke="#ef4444" strokeWidth={2} fill="url(#ag3)" dot={false} />
                <Area type="monotone" dataKey="pending" name={t('clientList.kycStatus.pending')} stroke="#f59e0b" strokeWidth={2} fill="url(#ag4)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h3>{t('dashboard.charts.kycDistribution')}</h3>
              <span className="admin-chart-badge">{kycTotal.toLocaleString()} {t('dashboard.charts.files')}</span>
            </div>
            <div className="admin-donut-wrap">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={kycDistForChart} cx="50%" cy="50%" innerRadius={68} outerRadius={100} paddingAngle={3} dataKey="value" />
                  <Tooltip formatter={(v, n) => [`${v.toLocaleString()} (${kycTotal ? ((v / kycTotal) * 100).toFixed(1) : 0}%)`, n]} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="admin-donut-center">
                <span className="admin-donut-total">{kycTotal.toLocaleString()}</span>
                <span className="admin-donut-label">{t('dashboard.total')}</span>
              </div>
            </div>
          </div>

          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h3>{t('dashboard.charts.scoreDistribution')}</h3>
              <span className="admin-chart-badge">{t('dashboard.charts.facialMatching')}</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistForChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(v) => [v.toLocaleString(), t('dashboard.charts.clients')]} />
                <Bar dataKey="count" name={t('dashboard.charts.clients')} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        </div>{/* admin-main-inner */}
      </main>
    </div>
  )
}

export default AdminDashboard
