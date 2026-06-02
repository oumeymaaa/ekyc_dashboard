// kyc.service.js
import { getToken } from './auth.service'  

const BASE_URL = import.meta.env.VITE_API_URL 

export async function getKycRecords({ page = 1, limit = 50 } = {}) {
  const res = await fetch(
    `${BASE_URL}/kyc-records?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,   
      },
    },
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Erreur ${res.status}`)
  }

  const json = await res.json()

  return json.data ?? json
}

/* ── GET /kyc-records/client/:clientId ──────────── */
export async function getKycRecordByClient(clientId) {
  const res = await fetch(
    `${BASE_URL}/kyc-records/client/${clientId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,   
      },
    }
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Erreur ${res.status}`)
  }
  return res.json()
}


/* ── PATCH /kyc-records/:id/status ──────────────── */
export async function updateKycStatus(recordId, status) {
  const res = await fetch(
    `${BASE_URL}/kyc-records/${recordId}/status`,
    {
      method: 'PATCH',
     
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,   
      },
    
      body: JSON.stringify({ status }),
    }
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Erreur ${res.status}`)
  }
  return res.json()
}