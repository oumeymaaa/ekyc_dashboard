// src/services/organisation.service.js

const BASE_URL = 'http://localhost:3000'

// ─── LOGO URL HELPER ───────────────────────────────────────────────────────
// Normalises whatever path Multer stored into a full usable URL.
// Handles: "uploads/logos/x.png" | "./uploads/logos/x.png" | "uploads\\logos\\x.png"

export function getLogoUrl(path) {
  if (!path) return null
  const clean = path
    .replace(/\\/g, '/')   // Windows backslashes → forward slashes
    .replace(/^\.\//, '')  // strip leading "./"
  return `${BASE_URL}/${clean}`
}

// ─── HEADERS ───────────────────────────────────────────────────────────────

// JSON headers — for GET / DELETE (no body) and future JSON endpoints
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${
    localStorage.getItem('token') || sessionStorage.getItem('token')
  }`,
})

// Multipart headers — Content-Type intentionally omitted so the browser
// sets it automatically with the correct multipart boundary
const getMultipartHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem('token') || sessionStorage.getItem('token')
  }`,
})

// ─── LIST ──────────────────────────────────────────────────────────────────

export async function getOrganisations() {
  const res = await fetch(`${BASE_URL}/organisations/get-list`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Erreur lors du chargement des organisations.')
  return res.json()
}

// ─── GET ONE ───────────────────────────────────────────────────────────────

export async function getOrganisation(id) {
  const res = await fetch(`${BASE_URL}/organisations/get-organisation/${id}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`Organisation #${id} introuvable.`)
  return res.json()
}

// ─── CREATE ────────────────────────────────────────────────────────────────

export async function createOrganisation(data) {
  const res = await fetch(`${BASE_URL}/organisations/create`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: data,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.message ?? 'Erreur lors de la création.')
  return body
}

// ─── UPDATE ────────────────────────────────────────────────────────────────

export async function updateOrganisation(id, data) {
  const res = await fetch(`${BASE_URL}/organisations/update/${id}`, {
    method: 'PATCH',
    headers: getMultipartHeaders(),
    body: data,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.message ?? 'Erreur lors de la mise à jour.')
  return body
}

// ─── DELETE ────────────────────────────────────────────────────────────────

export async function deleteOrganisation(id) {
  const res = await fetch(`${BASE_URL}/organisations/delete/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.message ?? 'Erreur lors de la suppression.')
  return body
}