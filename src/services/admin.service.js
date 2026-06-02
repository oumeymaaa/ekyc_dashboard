// src/services/admin.service.js
const API_URL = 'http://localhost:3001'

const getHeaders = () => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

const mapAdmin = (admin) => ({
  id:              admin.id,
  firstName:       admin.first_name,
  lastName:        admin.last_name,
  email:           admin.email,
  organisation:   admin.organisation?.name_organisation ?? '—',
  organisationId: admin.organisation?.id ?? null,
  phone:           admin.phone,
  createdAt:       admin.created_at,
  status:          admin.status?.code === 'actif' ? 'active' : 'pending',
  activationToken: admin.activation_token,
})

export async function getAdmins() {
  const res = await fetch(`${API_URL}/users/get-list-admin`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    let errorMessage = 'Failed to fetch admins'
    try {
      const errorBody = await res.json()
      errorMessage = errorBody.message || errorMessage
    } catch {
      console.error('[getAdmins] failed:', res.status, '(no JSON body)')
    }
    throw new Error(errorMessage)
  }
  const data = await res.json()
  return data.map(mapAdmin)
}

export async function createAdmin({ firstName, lastName, email, organisationId, phone }) {
  const res = await fetch(`${API_URL}/users/create-admin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      first_name:      firstName,
      last_name:       lastName,
      email,
      organisation_id: Number(organisationId),   // ← was organization_name
      phone,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to create admin')
  }
  return res.json()
}

export async function updateAdmin(id, { firstName, lastName, email, organisationId, phone }) {
  const res = await fetch(`${API_URL}/users/update-admin/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      first_name:      firstName,
      last_name:       lastName,
      email,
      organisation_id: Number(organisationId),   // ← was organization_name
      phone,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to update admin')
  }
  const data = await res.json()
  return mapAdmin(data.data)
}

export async function deleteAdmin(id) {
  const res = await fetch(`${API_URL}/users/delete-admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to delete admin')
  }
  return res.json()
}

// ── Change password (OTP flow) ─────────────────────────────────────────────

export async function requestChangePasswordOtp(currentPassword) {
  const res = await fetch(`${API_URL}/users/change-password/request-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ current_password: currentPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.ok) return { success: true, message: data.message }
  return {
    success: false,
    message:
      data?.message ||
      (res.status === 401
        ? 'Mot de passe actuel incorrect.'
        : 'Une erreur est survenue. Veuillez réessayer.'),
  }
}

export async function confirmChangePassword(otp, newPassword) {
  const res = await fetch(`${API_URL}/users/change-password/confirm`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ otp, new_password: newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.ok) return { success: true }
  return {
    success: false,
    message:
      data?.message ||
      (res.status === 401
        ? 'Code OTP invalide.'
        : 'Une erreur est survenue. Veuillez réessayer.'),
  }
}
