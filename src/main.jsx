import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { getSupabaseConfigMessage, isSupabaseConfigured } from './lib/supabaseClient'

function MissingConfigPage({ message }) {
  return (
    <main className="page">
      <h1>ClientFlow</h1>
      <p className="form-message error">{message}</p>
      <p className="page-note">
        For Netlify: open Site configuration → Environment variables, add both variables, then
        trigger a new deploy.
      </p>
    </main>
  )
}

async function startApp() {
  const root = createRoot(document.getElementById('root'))

  if (!isSupabaseConfigured) {
    root.render(<MissingConfigPage message={getSupabaseConfigMessage()} />)
    return
  }

  const { default: App } = await import('./App.jsx')

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

startApp()
