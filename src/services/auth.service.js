const API_URL = 'http://localhost:3000'

// 👇 helper to support both storage types
function getStorage() {
  return localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage
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
  // 👇 store in the right place based on rememberMe
  const storage = rememberMe ? localStorage : sessionStorage
  localStorage.setItem('rememberMe', rememberMe)   // always track the preference
  storage.setItem('token', data.access_token)
  storage.setItem('user', JSON.stringify(data.user))

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
 console.log('data'  ,res.status)

  if (!res.ok) {
    console.log("message", data.message )
    // Map common server messages to user-friendly French text
    const msg = data.message || ''
    if (
      msg.toLowerCase().includes('not found') ||
      msg.toLowerCase().includes('introuvable') ||
      res.status === 404
    ) {
      throw new Error('Email non trouvé. Vérifiez l\'adresse saisie.')
    }
    throw new Error(msg || 'Une erreur est survenue. Veuillez réessayer.')
  }

  return data
}

// ─── Reset Password ───────────────────────────────────────────────────────────
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