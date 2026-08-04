/**
 * Einstiegspunkt. Reihenfolge der Stylesheets ist bewusst fixiert:
 * Tokens vor Basis vor Komponenten vor Shell - jede Stufe darf auf der
 * vorherigen aufbauen, nie umgekehrt.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/komponenten.css'
import '@/app.css'
import App from '@/App'

const wurzelElement = document.getElementById('root')
if (!wurzelElement) {
  throw new Error('main.tsx: Element mit id="root" wurde nicht im Dokument gefunden.')
}

createRoot(wurzelElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
