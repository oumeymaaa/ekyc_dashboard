const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms))

/* ── Global stats ───────────────────────────────── */
const mockStats = {
  overview: {
    totalClients:   1284,
    kycValidated:   897,
    kycRejected:    143,
    kycPending:     244,
    avgFacialScore: 87.3,
    trends: {
      totalClients:   { value: +12.4, direction: 'up'   },
      kycValidated:   { value: +8.2,  direction: 'up'   },
      kycRejected:    { value: -3.1,  direction: 'down' },
      avgFacialScore: { value: +1.2,  direction: 'up'   },
    },
  },
  clientsOverTime: [
    { month: 'Nov', clients: 820,  validated: 612, rejected: 98  },
    { month: 'Déc', clients: 950,  validated: 701, rejected: 115 },
    { month: 'Jan', clients: 1050, validated: 768, rejected: 128 },
    { month: 'Fév', clients: 1100, validated: 810, rejected: 135 },
    { month: 'Mar', clients: 1210, validated: 863, rejected: 141 },
    { month: 'Avr', clients: 1284, validated: 897, rejected: 143 },
  ],
  kycDistribution: [
    { name: 'Validés',    value: 897, fill: '#22c55e' },
    { name: 'En attente', value: 244, fill: '#f59e0b' },
    { name: 'Rejetés',   value: 143, fill: '#ef4444' },
  ],
  scoreDistribution: [
    { range: '< 60',   count: 42,  fill: '#ef4444' },
    { range: '60–69',  count: 78,  fill: '#f97316' },
    { range: '70–79',  count: 134, fill: '#f59e0b' },
    { range: '80–89',  count: 285, fill: '#3b82f6' },
    { range: '90–100', count: 358, fill: '#22c55e' },
  ],
  recentActivity: [
    { id: 1, adminName: 'Karim Benali',   initials: 'KB', action: 'create',       target: 'Ahmed Mansouri',      timestamp: new Date(Date.now() - 5   * 60 * 1000).toISOString() },
    { id: 2, adminName: 'Sara Meziani',   initials: 'SM', action: 'validate_kyc', target: 'Fatima Zohra Alaoui', timestamp: new Date(Date.now() - 28  * 60 * 1000).toISOString() },
    { id: 3, adminName: 'Amine Djelloul', initials: 'AD', action: 'reject_kyc',   target: 'Youssef Brahim',      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
    { id: 4, adminName: 'Karim Benali',   initials: 'KB', action: 'update',       target: 'Nadia Chekroun',      timestamp: new Date(Date.now() - 3   * 60 * 60 * 1000).toISOString() },
    { id: 5, adminName: 'Sara Meziani',   initials: 'SM', action: 'create',       target: 'Omar Belkacem',       timestamp: new Date(Date.now() - 5   * 60 * 60 * 1000).toISOString() },
    { id: 6, adminName: 'Amine Djelloul', initials: 'AD', action: 'validate_kyc', target: 'Lina Hamdani',        timestamp: new Date(Date.now() - 8   * 60 * 60 * 1000).toISOString() },
  ],
}

/* ── Per-admin stats ────────────────────────────── */
const adminStatsData = {
  '1': {
    overview: {
      totalClients: 342, kycValidated: 241, kycRejected: 38, kycPending: 63, avgFacialScore: 91.2,
      trends: {
        totalClients:   { value: +15.3, direction: 'up'   },
        kycValidated:   { value: +11.8, direction: 'up'   },
        kycRejected:    { value: -5.2,  direction: 'down' },
        avgFacialScore: { value: +2.1,  direction: 'up'   },
      },
    },
    clientsOverTime: [
      { month: 'Nov', clients: 198, validated: 142, rejected: 18 },
      { month: 'Déc', clients: 230, validated: 168, rejected: 22 },
      { month: 'Jan', clients: 265, validated: 193, rejected: 28 },
      { month: 'Fév', clients: 295, validated: 215, rejected: 32 },
      { month: 'Mar', clients: 318, validated: 229, rejected: 35 },
      { month: 'Avr', clients: 342, validated: 241, rejected: 38 },
    ],
    kycDistribution: [
      { name: 'Validés',    value: 241, fill: '#22c55e' },
      { name: 'En attente', value: 63,  fill: '#f59e0b' },
      { name: 'Rejetés',   value: 38,  fill: '#ef4444' },
    ],
    scoreDistribution: [
      { range: '< 60',   count: 6,  fill: '#ef4444' },
      { range: '60–69',  count: 14, fill: '#f97316' },
      { range: '70–79',  count: 38, fill: '#f59e0b' },
      { range: '80–89',  count: 92, fill: '#3b82f6' },
      { range: '90–100', count: 192,fill: '#22c55e' },
    ],
    recentActivity: [
      { id: 1, action: 'create',       target: 'Ahmed Mansouri',  timestamp: new Date(Date.now() - 5  * 60 * 1000).toISOString() },
      { id: 2, action: 'update',       target: 'Nadia Chekroun',  timestamp: new Date(Date.now() - 3  * 60 * 60 * 1000).toISOString() },
      { id: 3, action: 'validate_kyc', target: 'Samir Ouali',     timestamp: new Date(Date.now() - 6  * 60 * 60 * 1000).toISOString() },
      { id: 4, action: 'create',       target: 'Yasmine Cherif',  timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
      { id: 5, action: 'reject_kyc',   target: 'Khalid Amrani',   timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  '2': {
    overview: {
      totalClients: 218, kycValidated: 156, kycRejected: 31, kycPending: 31, avgFacialScore: 85.7,
      trends: {
        totalClients:   { value: +9.4,  direction: 'up'   },
        kycValidated:   { value: +6.1,  direction: 'up'   },
        kycRejected:    { value: +2.3,  direction: 'up'   },
        avgFacialScore: { value: +0.8,  direction: 'up'   },
      },
    },
    clientsOverTime: [
      { month: 'Nov', clients: 130, validated: 94,  rejected: 18 },
      { month: 'Déc', clients: 152, validated: 108, rejected: 21 },
      { month: 'Jan', clients: 170, validated: 122, rejected: 24 },
      { month: 'Fév', clients: 190, validated: 136, rejected: 26 },
      { month: 'Mar', clients: 204, validated: 147, rejected: 29 },
      { month: 'Avr', clients: 218, validated: 156, rejected: 31 },
    ],
    kycDistribution: [
      { name: 'Validés',    value: 156, fill: '#22c55e' },
      { name: 'En attente', value: 31,  fill: '#f59e0b' },
      { name: 'Rejetés',   value: 31,  fill: '#ef4444' },
    ],
    scoreDistribution: [
      { range: '< 60',   count: 10, fill: '#ef4444' },
      { range: '60–69',  count: 22, fill: '#f97316' },
      { range: '70–79',  count: 42, fill: '#f59e0b' },
      { range: '80–89',  count: 78, fill: '#3b82f6' },
      { range: '90–100', count: 66, fill: '#22c55e' },
    ],
    recentActivity: [
      { id: 1, action: 'validate_kyc', target: 'Fatima Zohra Alaoui', timestamp: new Date(Date.now() - 28  * 60 * 1000).toISOString() },
      { id: 2, action: 'create',       target: 'Omar Belkacem',       timestamp: new Date(Date.now() - 5   * 60 * 60 * 1000).toISOString() },
      { id: 3, action: 'reject_kyc',   target: 'Hamza Berrada',       timestamp: new Date(Date.now() - 9   * 60 * 60 * 1000).toISOString() },
      { id: 4, action: 'update',       target: 'Rania Oueld Brahm',   timestamp: new Date(Date.now() - 15  * 60 * 60 * 1000).toISOString() },
      { id: 5, action: 'validate_kyc', target: 'Tarek Zitouni',       timestamp: new Date(Date.now() - 22  * 60 * 60 * 1000).toISOString() },
    ],
  },
  '3': {
    overview: {
      totalClients: 156, kycValidated: 98,  kycRejected: 24, kycPending: 34, avgFacialScore: 82.4,
      trends: {
        totalClients:   { value: +7.2,  direction: 'up'   },
        kycValidated:   { value: +4.5,  direction: 'up'   },
        kycRejected:    { value: +1.8,  direction: 'up'   },
        avgFacialScore: { value: -0.6,  direction: 'down' },
      },
    },
    clientsOverTime: [
      { month: 'Nov', clients: 88,  validated: 55, rejected: 14 },
      { month: 'Déc', clients: 102, validated: 64, rejected: 16 },
      { month: 'Jan', clients: 118, validated: 74, rejected: 18 },
      { month: 'Fév', clients: 132, validated: 83, rejected: 20 },
      { month: 'Mar', clients: 145, validated: 91, rejected: 22 },
      { month: 'Avr', clients: 156, validated: 98, rejected: 24 },
    ],
    kycDistribution: [
      { name: 'Validés',    value: 98, fill: '#22c55e' },
      { name: 'En attente', value: 34, fill: '#f59e0b' },
      { name: 'Rejetés',   value: 24, fill: '#ef4444' },
    ],
    scoreDistribution: [
      { range: '< 60',   count: 12, fill: '#ef4444' },
      { range: '60–69',  count: 28, fill: '#f97316' },
      { range: '70–79',  count: 44, fill: '#f59e0b' },
      { range: '80–89',  count: 52, fill: '#3b82f6' },
      { range: '90–100', count: 20, fill: '#22c55e' },
    ],
    recentActivity: [
      { id: 1, action: 'reject_kyc',   target: 'Youssef Brahim',  timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
      { id: 2, action: 'validate_kyc', target: 'Lina Hamdani',    timestamp: new Date(Date.now() - 8   * 60 * 60 * 1000).toISOString() },
      { id: 3, action: 'create',       target: 'Mehdi Bouziane',  timestamp: new Date(Date.now() - 12  * 60 * 60 * 1000).toISOString() },
      { id: 4, action: 'update',       target: 'Sonia Lahlou',    timestamp: new Date(Date.now() - 20  * 60 * 60 * 1000).toISOString() },
      { id: 5, action: 'reject_kyc',   target: 'Rachid Mokhtar',  timestamp: new Date(Date.now() - 30  * 60 * 60 * 1000).toISOString() },
    ],
  },
}

/** Fallback stats for dynamically created admins not in the mock data */
function generateFallbackStats(adminId) {
  const seed = adminId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const r = (min, max) => min + (seed % (max - min + 1))
  const total = r(40, 120)
  const validated = Math.floor(total * 0.62)
  const rejected  = Math.floor(total * 0.12)
  const pending   = total - validated - rejected
  return {
    overview: {
      totalClients: total, kycValidated: validated, kycRejected: rejected, kycPending: pending,
      avgFacialScore: r(78, 92),
      trends: {
        totalClients:   { value: r(3, 15),  direction: 'up'   },
        kycValidated:   { value: r(2, 12),  direction: 'up'   },
        kycRejected:    { value: r(1, 8),   direction: 'down' },
        avgFacialScore: { value: r(0, 3),   direction: 'up'   },
      },
    },
    clientsOverTime: ['Nov','Déc','Jan','Fév','Mar','Avr'].map((month, i) => {
      const c = Math.floor(total * (0.55 + i * 0.09))
      return { month, clients: c, validated: Math.floor(c * 0.63), rejected: Math.floor(c * 0.11) }
    }),
    kycDistribution: [
      { name: 'Validés',    value: validated, fill: '#22c55e' },
      { name: 'En attente', value: pending,   fill: '#f59e0b' },
      { name: 'Rejetés',   value: rejected,  fill: '#ef4444' },
    ],
    scoreDistribution: [
      { range: '< 60',   count: Math.floor(total * 0.04), fill: '#ef4444' },
      { range: '60–69',  count: Math.floor(total * 0.09), fill: '#f97316' },
      { range: '70–79',  count: Math.floor(total * 0.18), fill: '#f59e0b' },
      { range: '80–89',  count: Math.floor(total * 0.31), fill: '#3b82f6' },
      { range: '90–100', count: Math.floor(total * 0.38), fill: '#22c55e' },
    ],
    recentActivity: [
      { id: 1, action: 'create',       target: 'Client A', timestamp: new Date(Date.now() - 2  * 60 * 60 * 1000).toISOString() },
      { id: 2, action: 'validate_kyc', target: 'Client B', timestamp: new Date(Date.now() - 5  * 60 * 60 * 1000).toISOString() },
      { id: 3, action: 'update',       target: 'Client C', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ],
  }
}

/* ── Exports ────────────────────────────────────── */
export async function getStats() {
  await delay()
  return mockStats
}

export async function getAdminStats(adminId) {
  await delay()
  return adminStatsData[adminId] ?? generateFallbackStats(adminId)
}
