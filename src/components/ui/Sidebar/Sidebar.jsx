import { useTranslation } from 'react-i18next'
import './Sidebar.css'
import { logout, getUser } from '../../../services/auth.service'


const BASE_URL = 'http://localhost:3001'

function Sidebar({ activePage, onNavigate, onLogout, user: userProp }) {
    const { t, i18n } = useTranslation()
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'

  const user         = userProp ?? getUser()
  const fullName     = user ? `${user.firstName} ${user.lastName}` : 'Super Admin'
  const initials     = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'S'
  const role         = user?.role ?? 'super_admin'
  const organisation = user?.organisation ?? null

  const SUPER_ADMIN_NAV = [
    { key: 'dashboard',     icon: '📊', label: t('sidebar.dashboard')     },
    { key: 'admins',        icon: '👥', label: t('sidebar.admins')         },
    { key: 'organisations', icon: '🏢', label: t('sidebar.organisations')  },
    { key: 'settings',      icon: '⚙️',  label: t('sidebar.settings')      },
  ]

  const ADMIN_NAV = [
    { key: 'dashboard', icon: '📊', label: t('sidebar.dashboard') },
    { key: 'clients',   icon: '🪪', label: t('sidebar.ekyc')      },
    { key: 'settings',  icon: '⚙️',  label: t('sidebar.settings') },
  ]
  const NAV_ITEMS = role === 'admin' ? ADMIN_NAV : SUPER_ADMIN_NAV

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  return (
    <aside className="sidebar" dir={dir}>
      <div className="sidebar-logo">
        {role === 'admin' && organisation?.logo_url ? (
          <img
            src={`${BASE_URL}${organisation.logo_url}`}
            alt={organisation.name_organisation ?? 'Logo'}
            className="logo-img"
          />
        ) : (
          <div className="logo-icon">A</div>
        )}
        <div className="logo-text">
          <span className="logo-title">AdminPanel</span>
          {role === 'admin' && organisation?.name_organisation && (
            <span className="logo-subtitle">{organisation.name_organisation}</span>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{initials}</div>
        <div className="user-info">
          <span className="user-name">{fullName}</span>
          <span className="user-role">{role}</span>
        </div>
      </div>

      <button className="btn-logout" onClick={handleLogout}>
        🚪 {t('sidebar.logout')}
      </button>
    </aside>
  )
}

export default Sidebar