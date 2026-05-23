// src/components/ui/Sidebar/Sidebar.jsx
import './Sidebar.css'
import { logout, getUser } from '../../../services/auth.service'

const SUPER_ADMIN_NAV = [
  { key: 'dashboard',     icon: '📊', label: 'Dashboard'      },
  { key: 'admins',        icon: '👥', label: 'Admins'         },
  { key: 'organisations', icon: '🏢', label: 'Organisations'  },
  { key: 'settings',      icon: '⚙️',  label: 'Paramètres'    },
]

const ADMIN_NAV = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard'   },
  { key: 'clients',   icon: '🪪', label: 'eKYC'        },
  { key: 'settings',  icon: '⚙️',  label: 'Paramètres' },
]

function Sidebar({ activePage, onNavigate, onLogout }) {
  const user     = getUser()
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Super Admin'
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'S'
  const role = user?.role ?? 'super_admin'

  const NAV_ITEMS = role === 'admin' ? ADMIN_NAV : SUPER_ADMIN_NAV

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">A</div>
        <span>AdminPanel</span>
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
        🚪 Logout
      </button>
    </aside>
  )
}

export default Sidebar
