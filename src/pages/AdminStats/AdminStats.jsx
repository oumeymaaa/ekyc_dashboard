import { useEffect, useState } from 'react'
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getAdminStats } from '../../services/statsService'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import './AdminStats.css'

/* ── Helpers ────────────────────────────────────── */
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return `il y a ${diff}s`
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return `il y a ${Math.floor(diff / 86400)}j`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const ACTION_META = {
  create:       { label: 'Création client',     color: '#3b82f6', bg: '#eff6ff' },
  update:       { label: 'Modification client', color: '#8b5cf6', bg: '#f5f3ff' },
  validate_kyc: { label: 'KYC validé',          color: '#22c55e', bg: '#f0fdf4' },
  reject_kyc:   { label: 'KYC rejeté',          color: '#ef4444', bg: '#fff5f5' },
}

/* ── KPI Card ───────────────────────────────────── */
function KpiCard({ icon, title, value, trend, color, suffix = '' }) {
  const isUp = trend?.direction === 'up'
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: color + '18', color }}>{icon}</div>
        <div className={`kpi-trend ${isUp ? 'trend-up' : 'trend-down'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(trend?.value)}%
        </div>
      </div>
      <div className="kpi-value">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}{suffix}</div>
      <div className="kpi-title">{title}</div>
      <div className="kpi-sub">vs mois dernier</div>
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
          {p.name} : <strong>{p.value.toLocaleString('fr-FR')}</strong>
        </p>
      ))}
    </div>
  )
}

/* ── AdminStats page ────────────────────────────── */
function AdminStats({ admin, onNavigate, onLogout }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats(admin.id).then(setStats).finally(() => setLoading(false))
  }, [admin.id])

  const initials = `${admin.firstName[0]}${admin.lastName[0]}`

  if (loading) {
    return (
      <div className="as-page">
        <Sidebar activePage="admins" onNavigate={onNavigate} onLogout={onLogout}/>
        <main className="as-main">
          <div className="as-loading">
            <div className="as-spinner" />
            <p>Chargement des statistiques...</p>
          </div>
        </main>
      </div>
    )
  }

  const { overview, clientsOverTime, kycDistribution, scoreDistribution, recentActivity } = stats
  const kycTotal = overview.kycValidated + overview.kycRejected + overview.kycPending

  return (
    <div className="as-page">
      <Sidebar activePage="admins" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="as-main">
        {/* Breadcrumb */}
        <div className="as-breadcrumb">
          <button className="btn-back" onClick={() => onNavigate('admins')}>
            ← Retour aux admins
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {admin.firstName} {admin.lastName}
          </span>
        </div>

        {/* Admin profile card */}
        <div className="as-profile-card">
          <div className="profile-left">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h1 className="profile-name">{admin.firstName} {admin.lastName}</h1>
              <p className="profile-email">{admin.email}</p>
              <p className="profile-meta">
                <span className="org-pill">{admin.organization}</span>
                <span className={`status-pill status-${admin.status}`}>
                  {admin.status === 'active' ? '● Actif' : '○ En attente'}
                </span>
              </p>
            </div>
          </div>
          <div className="profile-right">
            <div className="profile-stat">
              <span className="profile-stat-value">{overview.totalClients.toLocaleString('fr-FR')}</span>
              <span className="profile-stat-label">clients gérés</span>
            </div>
            <div className="profile-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{overview.avgFacialScore}%</span>
              <span className="profile-stat-label">score moyen</span>
            </div>
            <div className="profile-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{formatDate(admin.createdAt)}</span>
              <span className="profile-stat-label">compte créé le</span>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="kpi-grid">
          <KpiCard icon="👥" title="Total clients"      value={overview.totalClients}   trend={overview.trends.totalClients}   color="#0f3460" />
          <KpiCard icon="✅" title="KYC validés"        value={overview.kycValidated}   trend={overview.trends.kycValidated}   color="#22c55e" />
          <KpiCard icon="❌" title="KYC rejetés"        value={overview.kycRejected}    trend={overview.trends.kycRejected}    color="#ef4444" />
          <KpiCard icon="🎯" title="Score moyen facial" value={overview.avgFacialScore} trend={overview.trends.avgFacialScore} color="#8b5cf6" suffix="%" />
        </div>

        {/* Charts row 1 */}
        <div className="chart-row">
          <div className="chart-card chart-card--wide">
            <div className="chart-card-header">
              <h2>Évolution clients &amp; KYC</h2>
              <span className="chart-badge">6 derniers mois · {admin.organization}</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={clientsOverTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                <Area type="monotone" dataKey="clients"   name="Clients" stroke="#0f3460" strokeWidth={2} fill="url(#gcl)" dot={false} />
                <Area type="monotone" dataKey="validated" name="Validés" stroke="#22c55e" strokeWidth={2} fill="url(#gva)" dot={false} />
                <Area type="monotone" dataKey="rejected"  name="Rejetés" stroke="#ef4444" strokeWidth={2} fill="url(#grj)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>Répartition KYC</h2>
              <span className="chart-badge">{kycTotal} dossiers</span>
            </div>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={kycDistribution} cx="50%" cy="50%"
                       innerRadius={62} outerRadius={88} paddingAngle={3} dataKey="value" />
                  <Tooltip formatter={(v, n) => [`${v} (${((v / kycTotal) * 100).toFixed(1)}%)`, n]} />
                  <Legend iconType="circle" iconSize={8}
                          formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-total">{kycTotal}</span>
                <span className="donut-label">total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>Distribution des scores</h2>
              <span className="chart-badge">Matching facial</span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={scoreDistribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8f9fc' }} formatter={(v) => [v, 'Clients']} />
                <Bar dataKey="count" name="Clients" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity feed */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>Activité récente</h2>
              <span className="chart-badge">{admin.firstName} {admin.lastName}</span>
            </div>
            <ul className="activity-feed">
              {recentActivity.map((item) => {
                const meta = ACTION_META[item.action]
                return (
                  <li key={item.id} className="activity-item">
                    <div className="activity-avatar">{initials}</div>
                    <div className="activity-body">
                      <p className="activity-text">
                        <span className="activity-action-badge"
                              style={{ color: meta.color, background: meta.bg }}>
                          {meta.label}
                        </span>
                      </p>
                      <p className="activity-target">→ {item.target}</p>
                    </div>
                    <span className="activity-time">{timeAgo(item.timestamp)}</span>
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
