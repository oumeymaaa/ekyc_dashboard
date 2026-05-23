import { useState } from 'react'
import './ForgotPassword.css'
import { forgotPassword } from '../../services/auth.service.js'

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-wrapper">
      <div className="fp-card">
        <div className="fp-header">
          <div className="fp-logo">A</div>
          <h1 className="fp-title">Mot de passe oublié</h1>
          <p className="fp-subtitle">
            Saisissez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {success ? (
          <div className="fp-success-box">
            <div className="fp-success-icon">✉️</div>
            <h2 className="fp-success-title">Email envoyé !</h2>
            <p className="fp-success-text">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              Veuillez vérifier votre boîte de réception.
            </p>
            <button className="btn-back" onClick={onBack}>
              ← Retour à la connexion
            </button>
          </div>
        ) : (
          <form className="fp-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <div className="input-icon-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="agent@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="fp-error">
                <span className="fp-error-icon">⚠</span>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Envoi en cours...
                </span>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </button>

            <button type="button" className="btn-back-link" onClick={onBack}>
              ← Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
