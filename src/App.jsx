import { useState } from 'react'
import Login from './pages/Login/Login'
import AdminList from './pages/AdminList/AdminList'
import AdminStats from './pages/AdminStats/AdminStats'
import Dashboard from './pages/Dashboard/Dashboard'
import ActivationCompte from './pages/ActivationCompte/ActivationCompte'
import ClientList from './pages/ClientList/ClientList'
import OrganisationList from './pages/OrganisationList/OrganisationList'   // ← ADD
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
  const user = getUser()
  const role = user?.role

  const [page, setPage] = useState(() => {
        // Priority 1 — already logged in → always go to dashboard
    if (isAuthenticated()) return 'dashboard'
    const token = getTokenFromUrl()
        // Priority 2 — reset-password link (must NOT be authenticated)
    if (token && isResetPasswordPath()) return 'reset-password'
    
    // Priority 3 — activation link
    if (token) return 'activation-compte'
    
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
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
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
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
    }
    return <ForgotPassword onBack={() => setPage('login')} />
  }

  // =========================
  // ACTIVATION COMPTE PAGE
  // =========================
  if (page === 'activation-compte' && token) {
    if (isAuthenticated()) {
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <ActivationCompte
        token={token}
        onActivated={() => {
          clearTokenFromUrl()
          setPage('login')
        }}
      />
    )
  }

  // =========================
  // LOGIN PAGE
  // =========================
  if (page === 'login') {
    if (isAuthenticated()) {
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
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
    return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
  }

  // =========================
  // ADMIN LIST — super_admin only
  // =========================
  if (page === 'admins') {
    if (role !== 'super_admin') {
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
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
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
    }
    return (
      <OrganisationList
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
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
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
      return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
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
  return <Dashboard onNavigate={setPage} onLogout={handleLogout} />
}

export default App
