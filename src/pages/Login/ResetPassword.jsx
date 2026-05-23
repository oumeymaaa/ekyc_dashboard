import { useState, useEffect } from 'react'
import './ResetPassword.css'
import { resetPassword } from '../../services/auth.service.js'

/**
 * ResetPassword component
 *
 * Usage: token can come from URL query param (?token=xxx)
 * OR passed directly as a prop.
 *
 * Example router setup:
 *   <Route path="/reset-password" element={<ResetPassword onSuccess={() => navigate('/login')} />} />
 */
function ResetPassword({ onSuccess, tokenProp }) {
  const [form, setForm] = useState({
    token: tokenProp || '',
    password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auto-extract token from URL query string
  useEffect(() => {
    if (!tokenProp) {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token')
      if (urlToken) {
        setForm((prev) => ({ ...prev, token: urlToken }))
      }
    }
  }, [tokenProp])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
  }

  const validate = () => {
    const errors = {}
    if (!form.token.trim()) errors.token = 'Le token de réinitialisation est requis.'
    if (form.password.length < 6) errors.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    if (form.password !== form.confirm_password) errors.confirm_password = 'Les mots de passe ne correspondent pas.'
    return errors
  }

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null
    if (pwd.length < 6) return { level: 1, label: 'Trop court', color: '#ef4444' }
    if (pwd.length < 8) return { level: 2, label: 'Faible', color: '#f97316' }
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 8) return { level: 4, label: 'Fort', color: '#22c55e' }
    return { level: 3, label: 'Moyen', color: '#eab308' }
  }

  const strength = getPasswordStrength(form.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetPassword(form.token, form.password, form.confirm_password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Le lien est peut-être expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rp-wrapper">
      <div className="rp-card">
        <div className="rp-header">
          <div className="rp-logo">A</div>
          <h1 className="rp-title">Nouveau mot de passe</h1>
          <p className="rp-subtitle">Choisissez un mot de passe sécurisé pour votre compte</p>
        </div>

        {success ? (
          <div className="rp-success-box">
            <div className="rp-success-icon">✅</div>
            <h2 className="rp-success-title">Mot de passe mis à jour !</h2>
            <p className="rp-success-text">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <button className="btn-login-redirect" onClick={onSuccess}>
              Se connecter →
            </button>
          </div>
        ) : (
          <form className="rp-form" onSubmit={handleSubmit}>
            {/* Token field — hidden if already filled from URL */}
            {!form.token && (
              <div className="form-group">
                <label htmlFor="token">Token de réinitialisation</label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="Collez le token reçu par email"
                  value={form.token}
                  onChange={handleChange}
                />
                {fieldErrors.token && <span className="field-error">{fieldErrors.token}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Nouveau mot de passe</label>
              <div className="input-password">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
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
              {form.password && strength && (
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
              <label htmlFor="confirm_password">Confirmer le mot de passe</label>
              <div className="input-password">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={handleChange}
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
              {fieldErrors.confirm_password && (
                <span className="field-error">{fieldErrors.confirm_password}</span>
              )}
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
                  <span className="spinner" />
                  Mise à jour...
                </span>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
