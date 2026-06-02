import { useState } from 'react'
import { requestChangePasswordOtp, confirmChangePassword } from '../../services/admin.service'
import './ChangePasswordModal.css'

function ChangePasswordModal({ onClose }) {
  const [step, setStep] = useState('password') // 'password' | 'otp'
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    otp: '',
  })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setStatus(null)
  }

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }))

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/~`]/.test(pwd)
    let score = 0
    if (pwd.length >= 8) score++
    if (hasUpper) score++
    if (hasLower) score++
    if (hasNumber) score++
    if (hasSpecial) score++
    if (score <= 2) return { level: 1, label: 'Faible', color: '#ef4444' }
    if (score === 3) return { level: 2, label: 'Moyen', color: '#f97316' }
    if (score === 4) return { level: 3, label: 'Bon', color: '#eab308' }
    return { level: 4, label: 'Fort', color: '#22c55e' }
  }

  const strength = getPasswordStrength(form.new_password)

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/~`]).{8,}$/

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!form.current_password) {
      setStatus({ type: 'error', message: 'Veuillez saisir votre mot de passe actuel.' })
      return
    }
    setLoading(true)
    setStatus(null)
    const result = await requestChangePasswordOtp(form.current_password)
    setLoading(false)
    if (result.success) {
      setStep('otp')
      setStatus({ type: 'success', message: 'Un code OTP vous a été envoyé par email.' })
    } else {
      setStatus({ type: 'error', message: result.message })
    }
  }

  const handleConfirmOtp = async (e) => {
    e.preventDefault()
    if (!form.otp || form.otp.length !== 6) {
      setStatus({ type: 'error', message: 'Veuillez saisir le code OTP à 6 chiffres.' })
      return
    }
    if (!passwordRegex.test(form.new_password)) {
      setStatus({
        type: 'error',
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      })
      return
    }
    if (form.new_password !== form.confirm_password) {
      setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' })
      return
    }
    if (form.current_password === form.new_password) {
      setStatus({ type: 'error', message: "Le nouveau mot de passe doit être différent de l'actuel." })
      return
    }
    setLoading(true)
    setStatus(null)
    const result = await confirmChangePassword(form.otp, form.new_password)
    setLoading(false)
    if (result.success) {
      setStatus({ type: 'success', message: 'Mot de passe modifié avec succès. Déconnexion...' })
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
      setForm({ current_password: '', new_password: '', confirm_password: '', otp: '' })
      onClose()
      setTimeout(() => { window.location.href = '/login' }, 1000)
    } else {
      setStatus({ type: 'error', message: result.message })
    }
  }

  const handleBackToPassword = () => {
    setStep('password')
    setStatus(null)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">🔒</div>
            <div>
              <h2 className="modal-title">Changer le mot de passe</h2>
              <p className="modal-subtitle">
                {step === 'password'
                  ? 'Saisissez votre mot de passe actuel pour recevoir un code'
                  : 'Saisissez le code reçu et votre nouveau mot de passe'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {step === 'password' ? (
          <form className="modal-form" onSubmit={handleRequestOtp} noValidate>
            <div className="form-group">
              <label htmlFor="current_password">Mot de passe actuel</label>
              <div className="input-password">
                <input
                  id="current_password"
                  name="current_password"
                  type={show.current ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.current_password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShow('current')} tabIndex={-1}>
                  {show.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {status && (
              <p className={`form-msg form-msg--${status.type}`}>
                {status.type === 'success' ? '✅' : '⚠️'} {status.message}
              </p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="btn-submit" disabled={loading || !form.current_password}>
                {loading ? 'Envoi...' : 'Recevoir le code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleConfirmOtp} noValidate>
            <div className="form-group">
              <label htmlFor="otp">Code OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={form.otp}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))
                  setStatus(null)
                }}
                autoComplete="one-time-code"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password">Nouveau mot de passe</label>
              <div className="input-password">
                <input
                  id="new_password"
                  name="new_password"
                  type={show.new ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.new_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShow('new')} tabIndex={-1}>
                  {show.new ? '🙈' : '👁️'}
                </button>
              </div>
              {form.new_password && strength && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="strength-bar" style={{ backgroundColor: i <= strength.level ? strength.color : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirmer le nouveau mot de passe</label>
              <div className="input-password">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={show.confirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShow('confirm')} tabIndex={-1}>
                  {show.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {status && (
              <p className={`form-msg form-msg--${status.type}`}>
                {status.type === 'success' ? '✅' : '⚠️'} {status.message}
              </p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={handleBackToPassword} disabled={loading}>
                ← Modifier le mot de passe actuel
              </button>
              <button type="submit" className="btn-submit" disabled={loading || form.otp.length !== 6}>
                {loading ? 'Mise à jour...' : 'Confirmer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ChangePasswordModal
