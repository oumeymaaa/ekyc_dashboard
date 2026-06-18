import { useState, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Login from './pages/Login/Login'
import AdminList from './pages/AdminList/AdminList'
import AdminStats from './pages/AdminStats/AdminStats'
import Dashboard from './pages/Dashboard/Dashboard'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import ActivationCompte from './pages/ActivationCompte/ActivationCompte'
import ClientList from './pages/ClientList/ClientList'
import OrganisationList from './pages/OrganisationList/OrganisationList'   // ← ADD
import ActivitiesPage from './pages/ActivitiesPage/ActivitiesPage'
import KycRecordList from './pages/KycRecordList/KycRecordList'
import ForgotPassword from './pages/Login/Forgotpassword'
import ResetPassword from './pages/Login/ResetPassword'
import Settings from './pages/Settings/Settings'

import {
  isAuthenticated,
  logout,
  getUser,
} from './services/auth.service'

// ── URL token helpers ────────────────────────────────────────────────────────

function getTokenFromUrl() {
  return new URLSearchParams(window.location.search).get('token')
}

function isResetPasswordPath() {
  return window.location.pathname === '/reset-password'
}

function clearTokenFromUrl() {
  const url = new URL(window.location)
  url.searchParams.delete('token')
  window.history.replaceState({}, '', url)
}
// Resets BOTH the /reset-password pathname AND the ?token= query param
function clearResetPasswordUrl() {
  window.history.replaceState({}, '', '/')
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
    const { i18n } = useTranslation()

  useLayoutEffect(() => {
    document.documentElement.dir  = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const user = getUser()
  const role = user?.role
  const DashboardPage = role === 'admin' ? AdminDashboard : Dashboard

  const [page, setPage] = useState(() => {
    const token = getTokenFromUrl()
    // Priority 1 — activation link (must work even if already authenticated)
    if (token && !isResetPasswordPath()) return 'activation-compte'
    // Priority 2 — reset-password link
    if (token && isResetPasswordPath()) return 'reset-password'
    // Priority 3 — already logged in
    if (isAuthenticated()) return 'dashboard'
    return 'login'
  })

  const [selectedAdmin, setSelectedAdmin] = useState(null)

  const token = getTokenFromUrl()

  const handleLogout = () => {
    logout()
    setPage('login')
  }

  const handleViewStats = (admin) => {
    setSelectedAdmin(admin)
    setPage('admin-stats')
  }

  // =========================
  // RESET PASSWORD PAGE
  // =========================
  if (page === 'reset-password') {
    if (isAuthenticated()) {
      clearResetPasswordUrl()
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <ResetPassword
        tokenProp={token || undefined}
        onSuccess={() => {
          clearResetPasswordUrl()
          setPage('login')
        }}
      />
    )
  }

  // =========================
  // FORGOT PASSWORD PAGE
  // =========================
  if (page === 'forgot-password') {
    if (isAuthenticated()) {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return <ForgotPassword onBack={() => setPage('login')} />
  }

  // =========================
  // ACTIVATION COMPTE PAGE
  // =========================
  if (page === 'activation-compte' && token) {
    return (
      <ActivationCompte
        token={token}
        onActivated={() => {
          const url = new URL(window.location)
          url.searchParams.delete('token')
          url.searchParams.set('login', '1')
          window.location.href = url.toString()
        }}
      />
    )
  }

  // =========================
  // LOGIN PAGE
  // =========================
  if (page === 'login') {
    // Force login page after activation (?login=1), bypass auth redirect
    const forceLogin = new URLSearchParams(window.location.search).get('login') === '1'
    if (isAuthenticated() && !forceLogin) {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <Login
        onLogin={() => setPage('dashboard')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )
  }

  // =========================
  // DASHBOARD
  // =========================
  if (page === 'dashboard') {
    return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
  }

  // =========================
  // ADMIN LIST — super_admin only
  // =========================
  if (page === 'admins') {
    if (role !== 'super_admin') {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <AdminList
        onNavigate={setPage}
        onViewStats={handleViewStats}
        onLogout={handleLogout}
      />
    )
  }

  // =========================
  // ORGANISATIONS — super_admin only
  // =========================
  if (page === 'organisations') {
    if (role !== 'super_admin') {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <OrganisationList
        onNavigate={setPage}
        onLogout={handleLogout}
      />
    )
  }

  // =========================
  // ACTIVITIES — super_admin only
  // =========================
  if (page === 'activities') {
    if (role !== 'super_admin') {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <ActivitiesPage
        onNavigate={setPage}
        onLogout={handleLogout}
      />
    )
  }

  // =========================
  // CLIENT LIST — admin only
  // =========================
  if (page === 'clients') {
    if (role !== 'admin') {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return <ClientList onNavigate={setPage} onLogout={handleLogout} />
  }

  // =========================
  // KYC RECORDS
  // =========================
  if (page === 'kyc') {
    return <KycRecordList onNavigate={setPage} onLogout={handleLogout} />
  }

  // =========================
  // SETTINGS
  // =========================
  if (page === 'settings') {
    return <Settings onNavigate={setPage} onLogout={handleLogout} />
  }

  // =========================
  // ADMIN STATS — super_admin only
  // =========================
  if (page === 'admin-stats' && selectedAdmin) {
    if (role !== 'super_admin') {
      return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <AdminStats
        admin={selectedAdmin}
        onNavigate={setPage}
        onLogout={handleLogout}
      />
    )
  }

  // =========================
  // FALLBACK
  // =========================
  return <DashboardPage onNavigate={setPage} onLogout={handleLogout} />
}

export default App
