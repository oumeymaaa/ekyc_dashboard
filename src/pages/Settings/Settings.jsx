import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import { getUser } from '../../services/auth.service'
import ChangePasswordModal from '../../components/modals/ChangePasswordModal'
import EditProfileModal from '../../components/modals/EditProfileModal'
import { changeLanguage } from '../../i18n'
import './Settings.css'

function Settings({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const [modal, setModal] = useState(null)
  const [langMenu, setLangMenu] = useState(false)
  const [profile, setProfile] = useState(() => getUser())

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : t('settings.profile.personalInfo')
  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'
  const role = profile?.role ?? 'admin'

  const currentLang = i18n.language

  return (
    <div className="page-layout" dir={currentLang === 'ar' ? 'rtl' : 'ltr'} style={{ flexDirection: currentLang === 'ar' ? 'row-reverse' : 'row' }}>
      <Sidebar activePage="settings" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="settings-page">

          {/* ── Page header ── */}
          <div className="settings-page-header">
            <div>
              <h1 className="settings-page-title">{t('settings.title')}</h1>
              <p className="settings-page-sub">{t('settings.subtitle')}</p>
            </div>

            {/* Profile pill */}
            <div className="settings-profile-pill">
              <div className="settings-pill-avatar">{initials}</div>
              <div>
                <p className="settings-pill-name">{fullName}</p>
                <p className="settings-pill-role">{role}</p>
              </div>
            </div>
          </div>

          {/* ── Section: Profil (admin only) ── */}
          {profile?.role === 'admin' && (
          <section className="settings-section">
            <h2 className="settings-section-title">Profil</h2>
            <div className="settings-cards">
              <div className="settings-card">
                <div className="settings-card-icon settings-card-icon--blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="settings-card-body">
                  <p className="settings-card-label">
                    {profile?.firstName ?? ''} {profile?.lastName ?? ''}
                    <span className="settings-role-tag">Admin</span>
                  </p>
                  <p className="settings-card-desc">{profile?.email}</p>
                </div>
                <button className="settings-card-btn" onClick={() => setModal('edit-profile')}>Modifier</button>
              </div>
            </div>
          </section>
          )}

          {/* ── Section: Sécurité ── */}
          <section className="settings-section">
            <h2 className="settings-section-title">{t('settings.security.title')}</h2>
            <div className="settings-cards">

              {/* Card — change password */}
              <div className="settings-card">
                <div className="settings-card-icon settings-card-icon--blue">🔒</div>
                <div className="settings-card-body">
                  <p className="settings-card-label">{t('settings.security.password')}</p>
                  <p className="settings-card-desc">{t('settings.security.passwordDesc')}</p>
                </div>
                <button
                  className="settings-card-btn"
                  onClick={() => setModal('change-password')}
                >
                  {t('settings.btnEdit')}
                </button>
              </div>

            </div>
          </section>

          {/* ── Section: Préférences ── */}
          <section className="settings-section">
            <h2 className="settings-section-title">{t('settings.preferences.title')}</h2>
            <div className="settings-cards">

              {/* Card — langue */}
              <div className="settings-card">
                <div className="settings-card-icon settings-card-icon--gray">🌍</div>
                <div className="settings-card-body">
                  <p className="settings-card-label">
                    {t('settings.preferences.language')}
                  </p>
                  <p className="settings-card-desc">{t('settings.preferences.languageDesc')}</p>
                  {langMenu && (
                    <div className="settings-lang-options">
                      {['fr', 'en', 'ar'].map(l => (
                        <button key={l}
                          className={`settings-lang-btn${currentLang === l ? ' active' : ''}`}
                          onClick={() => { changeLanguage(l); setLangMenu(false) }}
                        >
                          {t(`settings.languages.${l}`)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="settings-card-btn" onClick={() => setLangMenu(!langMenu)}>
                  {currentLang === 'fr' ? t('settings.languages.fr') : currentLang === 'en' ? t('settings.languages.en') : t('settings.languages.ar')}
                </button>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* ── Modals ── */}
      {modal === 'change-password' && (
        <ChangePasswordModal onClose={() => setModal(null)} />
      )}
      {modal === 'edit-profile' && (
        <EditProfileModal
          user={profile}
          onClose={() => setModal(null)}
          onUpdate={(updated) => setProfile(updated)}
        />
      )}
    </div>
  )
}

export default Settings
