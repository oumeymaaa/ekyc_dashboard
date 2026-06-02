import { useState, useEffect } from 'react'
import './ResetPassword.css'
import { resetPassword, verifyOtp } from '../../services/auth.service.js'

function ResetPassword({ onSuccess, tokenProp }) {
  const [step, setStep] = useState('otp')
  const [token, setToken] = useState(tokenProp || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tokenProp) {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token')
      if (urlToken) setToken(urlToken)
    }
  }, [tokenProp])

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 6) {
      setError('Veuillez saisir le code OTP à 6 chiffres.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await verifyOtp(token, otp)
      setStep('password')
    } catch (err) {
      setError(err.message || 'Code OTP invalide.')
    } finally {
      setLoading(false)
    }
  }

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

  const strength = getPasswordStrength(password)

  const validatePassword = () => {
    const errors = {}
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/~`]).{8,}$/
    if (!passwordRegex.test(password)) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    }
    return errors
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const errors = validatePassword()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword(token, password, confirmPassword)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Le lien est peut-être expiré.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToOtp = () => {
    setStep('otp')
    setError('')
    setFieldErrors({})
  }

  if (success) {
    return (
      <div className="rp-wrapper">
        <div className="rp-card">
          <div className="rp-header">
            <div className="rp-logo">A</div>
            <h1 className="rp-title">Mot de passe mis à jour !</h1>
            <p className="rp-subtitle">Votre mot de passe a été réinitialisé avec succès.</p>
          </div>
          <div className="rp-success-box">
            <div className="rp-success-icon">✅</div>
            <button className="btn-login-redirect" onClick={onSuccess}>
              Se connecter →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rp-wrapper">
      <div className="rp-card">
        <div className="rp-header">
          <div className="rp-logo">A</div>
          {step === 'otp' ? (
            <>
              <h1 className="rp-title">Vérification OTP</h1>
              <p className="rp-subtitle">
                Saisissez le code à 6 chiffres reçu par email
              </p>
            </>
          ) : (
            <>
              <h1 className="rp-title">Nouveau mot de passe</h1>
              <p className="rp-subtitle">
                Choisissez un mot de passe sécurisé pour votre compte
              </p>
            </>
          )}
        </div>

        {step === 'otp' ? (
          <form className="rp-form" onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="otp">Code OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                autoComplete="one-time-code"
                required
              />
            </div>

            {error && (
              <div className="rp-error">
                <span className="rp-error-icon">⚠</span>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading || otp.length !== 6}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" /> Vérification...
                </span>
              ) : (
                'Vérifier le code'
              )}
            </button>
          </form>
        ) : (
          <form className="rp-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="password">Nouveau mot de passe</label>
              <div className="input-password">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                    setFieldErrors({})
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Afficher/masquer le mot de passe"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && strength && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{ backgroundColor: i <= strength.level ? strength.color : undefined }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="input-password">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError('')
                    setFieldErrors({})
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Afficher/masquer la confirmation"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
            </div>

            {error && (
              <div className="rp-error">
                <span className="rp-error-icon">⚠</span>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" /> Mise à jour...
                </span>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>

            <button type="button" className="btn-back-link" onClick={handleBackToOtp}>
              ← Modifier le code OTP
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
