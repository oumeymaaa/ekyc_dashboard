import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import './skeleton.css'
import './theme.js'
import './i18n/index.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
