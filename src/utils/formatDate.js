const ARABIC_MONTHS = {
  جانفي: 1, يناير: 1, فيفري: 2, ففري: 2, فبراير: 2, مارس: 3,
  أفريل: 4, افريل: 4, ابريل: 4, نيسان: 4, ماي: 5, مايو: 5,
  جوان: 6, يونيو: 6, جويلية: 7, جويلي: 7, يوليو: 7,
  أوت: 8, اوت: 8, أغسطس: 8, اغسطس: 8, سبتمبر: 9,
  أكتوبر: 10, اكتوبر: 10, نوفمبر: 11, ديسمبر: 12, ديسمبار: 12,
}

export function parseBirthDate(raw) {
  if (!raw) return null

  const value = String(raw).trim()
  if (!value) return null

  try {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const d = new Date(value)
      return isNaN(d) ? null : d
    }
  } catch {
    return null
  }

  const match = value.match(/^(\d{1,2})\s*([^\d]+?)\s*(\d{2,4})$/)
  if (match) {
    const day = parseInt(match[1], 10)
    const month = ARABIC_MONTHS[match[2].trim()]
    const year = parseInt(match[3], 10)
    if (day && month && year) {
      const d = new Date(year, month - 1, day)
      return d.getFullYear() === year && d.getDate() === day && d.getMonth() === month - 1 ? d : null
    }
  }

  const slash = value.match(/^(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const day = parseInt(slash[1], 10)
    const year = parseInt(slash[2], 10)
    if (day && year) {
      const d = new Date(year, 0, day)
      return d.getFullYear() === year && d.getDate() === day ? d : null
    }
  }

  return null
}

export function formatBirthDate(raw, locale) {
  const date = parseBirthDate(raw)
  if (!date) return raw || '-'
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
  return date.toLocaleDateString(locale, options)
}