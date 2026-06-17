import { getToken } from './auth.service'

const getLang = () => localStorage.getItem('lang') || 'fr'

export const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
  'Accept-Language': getLang(),
})

// Omit Content-Type so the browser sets the multipart boundary automatically
export const getMultipartHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Accept-Language': getLang(),
})
