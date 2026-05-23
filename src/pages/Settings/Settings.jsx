import { useState } from 'react'
import Sidebar from '../../components/ui/Sidebar/Sidebar'
import { getUser } from '../../services/auth.service'
import ChangePasswordModal from '../../components/modals/ChangePasswordModal'   
import './Settings.css'

function Settings({ onNavigate, onLogout }) {
  const user     = getUser()
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'
  const role = user?.role ?? 'admin'

  const [modal, setModal] = useState(null) // 'change-password' | null

  return (
    <div className="page-layout">
      <Sidebar activePage="settings" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-content">
        <div className="settings-page">

          {/* ── Page header ── */}
          <div className="settings-page-header">
            <div>
              <h1 className="settings-page-title">Paramètres</h1>
              <p className="settings-page-sub">Gérez vos préférences et la sécurité de votre compte</p>
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

          {/* ── Section: Sécurité ── */}
          <section className="settings-section">
            <h2 className="settings-section-title">🛡️ Sécurité</h2>
            <div className="settings-cards">

              {/* Card — change password */}
              <div className="settings-card">
                <div className="settings-card-icon settings-card-icon--blue">🔒</div>
                <div className="settings-card-body">
                  <p className="settings-card-label">Mot de passe</p>
                  <p className="settings-card-desc">Modifiez votre mot de passe de connexion</p>
                </div>
                <button
                  className="settings-card-btn"
                  onClick={() => setModal('change-password')}
                >
                  Modifier
                </button>
              </div>

            </div>
          </section>

          {/* ── Section: Préférences ── */}
          <section className="settings-section">
            <h2 className="settings-section-title">🌐 Préférences</h2>
            <div className="settings-cards">

              {/* Card — langue (disabled / coming soon) */}
              <div className="settings-card settings-card--disabled">
                <div className="settings-card-icon settings-card-icon--gray">🌍</div>
                <div className="settings-card-body">
                  <p className="settings-card-label">
                    Langue
                    <span className="settings-card-badge">Bientôt disponible</span>
                  </p>
                  <p className="settings-card-desc">Choisissez la langue de l'interface</p>
                </div>
                <button className="settings-card-btn settings-card-btn--disabled" disabled>
                  Modifier
                </button>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* ── Modal ── */}
      {modal === 'change-password' && (
        <ChangePasswordModal onClose={() => setModal(null)} />
      )}
    </div>
  )
}

export default Settings
