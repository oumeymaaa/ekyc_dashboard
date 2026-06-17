import { getHeaders } from './api'

const API_URL = import.meta.env.VITE_API_URL

function qs(adminId) {
  return adminId ? `?adminId=${adminId}` : ''
}

export async function getDashboardStats(adminId) {
  const res = await fetch(`${API_URL}/dashboard/stats${qs(adminId)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch dashboard stats')
  return res.json()
}

export async function getKycDistribution(adminId) {
  const res = await fetch(`${API_URL}/dashboard/kyc-distribution${qs(adminId)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch kyc distribution')
  return res.json()
}

export async function getEvolution(adminId) {
  const res = await fetch(`${API_URL}/dashboard/evolution${qs(adminId)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch evolution')
  return res.json()
}

export async function getScoreDistribution(adminId) {
  const res = await fetch(`${API_URL}/dashboard/score-distribution${qs(adminId)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch score distribution')
  return res.json()
}

export async function getActivity(limit = 10, adminId) {
  const base = `${API_URL}/dashboard/activity?limit=${limit}`
  const url  = adminId ? `${base}&adminId=${adminId}` : base
  const res  = await fetch(url, { headers: getHeaders() })
  if (!res.ok) throw new Error('Failed to fetch activity')
  return res.json()
}
