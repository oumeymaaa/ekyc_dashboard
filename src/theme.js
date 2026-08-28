const THEME_KEY = 'ekyc_admin_theme'

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

export function initTheme() {
  applyTheme(getTheme())
}

initTheme()