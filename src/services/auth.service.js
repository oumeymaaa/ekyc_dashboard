const API_URL = import.meta.env.VITE_API_URL 

function getStorage() {
  return localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage
}

// ✅ Normalize the raw API user into the same shape mapAdmin produces
function normalizeUser(raw) {
  // If it's already normalized (has firstName), return as-is
  if (raw.firstName !== undefined) return raw

  return {
    id:             raw.id,
    firstName:      raw.first_name,
    lastName:       raw.last_name,
    email:          raw.email,
    phone:          raw.phone,
    role:           raw.role,
    createdAt:      raw.created_at,
    status:         raw.status?.code === 'actif' ? 'active' : 'pending',
    // ✅ Keep full organisation object
    organisation:   raw.organisation
      ? {
          id:                raw.organisation.id,
          name_organisation: raw.organisation.name_organisation,
          logo_organisation: raw.organisation.logo_organisation,
          logo_url: raw.organisation.logo_url,
        }
      : null,
    organisationId: raw.organisation?.id ?? null,
  }
}

export async function login({ email, password, rememberMe = false }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Email ou mot de passe incorrect.')
  }

  const data = await response.json()
  const storage = rememberMe ? localStorage : sessionStorage
  localStorage.setItem('rememberMe', rememberMe)
  storage.setItem('token', data.access_token)
  storage.setItem('user', JSON.stringify(normalizeUser(data.user)))

  return data
}

export async function logout() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
  } catch (err) {
    console.warn('Logout API call failed:', err)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }
}

export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export function getUser() {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// ✅ Merge update into stored user — organisation is never overwritten
export function setUser(updatedUser) {
  const storage = getStorage()
  const current = getUser()
  const merged = { ...current, ...updatedUser }
  storage.setItem('user', JSON.stringify(merged))
}

export function isAuthenticated() {
  return !!getToken()
}
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data.message || ''
    if (
      msg.toLowerCase().includes('not found') ||
      msg.toLowerCase().includes('introuvable') ||
      res.status === 404
    ) {
      throw new Error("Email non trouvé. Vérifiez l'adresse saisie.")
    }
    throw new Error(msg || 'Une erreur est survenue. Veuillez réessayer.')
  }
  return data
}

export async function verifyOtp(token, otp) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, otp }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data.message || ''
    if (
      msg.toLowerCase().includes('expired') ||
      msg.toLowerCase().includes('expiré')
    ) {
      throw new Error('Code OTP expiré. Veuillez refaire une demande.')
    }
    throw new Error(msg || 'Code OTP invalide.')
  }
  return data
}

export async function resetPassword(token, password, confirm_password) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, confirm_password }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data.message || ''
    if (
      msg.toLowerCase().includes('expired') ||
      msg.toLowerCase().includes('expiré') ||
      res.status === 410
    ) {
      throw new Error('Ce lien de réinitialisation a expiré. Faites une nouvelle demande.')
    }
    if (
      msg.toLowerCase().includes('invalid') ||
      msg.toLowerCase().includes('invalide') ||
      res.status === 400
    ) {
      throw new Error('Token invalide. Vérifiez le lien reçu par email.')
    }
    throw new Error(msg || 'Impossible de réinitialiser le mot de passe.')
  }
  return data
}
export async function activateAccount(token) {
  const res = await fetch(`${API_URL}/auth/activate?token=${token}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lien invalide ou expiré.')
  return data
}