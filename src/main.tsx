import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Wipe legacy demo data on every new deployment
const LIVE_VERSION = 'v5-live';
if (localStorage.getItem('piq_live_version') !== LIVE_VERSION) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('piq_') && k !== 'piq_auth')
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('piq_live_version', LIVE_VERSION);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
