import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr'
import en from './en'
import ar from './ar'

const savedLang = localStorage.getItem('lang') || 'fr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  })

function applyDir(lang) {
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
}

applyDir(savedLang)
i18n.on('languageChanged', applyDir)

export function changeLanguage(lang) {
  localStorage.setItem('lang', lang)
  applyDir(lang)
  i18n.changeLanguage(lang)
}

export default i18n
