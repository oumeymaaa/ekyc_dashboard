import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ForgotPassword.css'
import { forgotPassword } from '../../services/auth.service.js'

function ForgotPassword({ onBack }) {
  const { t } = useTranslation()
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
      setError(err.message || t('forgotPassword.errorDefault'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-wrapper">
      <div className="fp-card">
        <div className="fp-header">
          <div className="fp-logo">A</div>
          <h1 className="fp-title">{t('forgotPassword.title')}</h1>
          <p className="fp-subtitle">{t('forgotPassword.subtitle')}</p>

        </div>

        {success ? (
          <div className="fp-success-box">
            <div className="fp-success-icon">✉️</div>
            <h2 className="fp-success-title">{t('forgotPassword.successTitle')}</h2>
            <p className="fp-success-text">
                            {t('forgotPassword.successText', { email })}

            </p>
            <button className="btn-back" onClick={onBack}>
              {t('forgotPassword.backToLogin')}
            </button>
          </div>
        ) : (
          <form className="fp-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('forgotPassword.emailLabel')}</label>
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
                  {t('forgotPassword.sending')}
                </span>
              ) : (
                t('forgotPassword.sendLink')
              )}
            </button>

            <button type="button" className="btn-back-link" onClick={onBack}>
              {t('forgotPassword.backToLogin')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
