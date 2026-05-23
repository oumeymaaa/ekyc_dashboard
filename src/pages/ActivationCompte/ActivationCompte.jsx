import { activateAccount } from '../../services/auth.service'
import { useEffect, useState, useRef } from 'react'
import './ActivationCompte.css'

function ActivationCompte({ token, onActivated }) {
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    activateAccount(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setErrorMsg(err.message)
        setStatus('error')
      })
  }, [token])

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="sp-wrapper">
        <div className="sp-card sp-card--centered">
          <div className="sp-logo">A</div>
          <div className="sp-spinner" />
          <p className="sp-loading-text">Activation du compte en cours...</p>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (status === 'error') {
    return (
      <div className="sp-wrapper">
        <div className="sp-card sp-card--centered">
          <div className="sp-icon sp-icon--error">✕</div>
          <h1>Lien invalide</h1>
          <div className="sp-error">
            Contactez votre super administrateur pour obtenir un nouveau lien d'activation.
          </div>
        </div>
      </div>
    )
  }

  /* ── Success ── */
  return (
    <div className="sp-wrapper">
      <div className="sp-card sp-card--centered">
        <div className="sp-logo">A</div>
        <div className="sp-icon sp-icon--success">✓</div>
        <h1>Compte activé !</h1>
        <p className="sp-subtitle">Votre compte est prêt à être utilisé</p>
        <div className="sp-info-box">
          <p>Votre compte est maintenant actif.</p>
          <p>
            Connectez-vous avec votre <strong>email</strong> et le{' '}
            <strong>mot de passe</strong> reçu dans l'email d'activation.
          </p>
        </div>
        <div className="sp-security-tip">
          🔒 Pour votre sécurité, changez votre mot de passe dès votre première connexion.
        </div>
        <button className="sp-btn-primary" onClick={onActivated}>
          Se connecter
        </button>
      </div>
    </div>
  )
}

export default ActivationCompte
