import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export function getSupabaseConfigMessage() {
  if (isSupabaseConfigured) {
    return ''
  }

  return (
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'to your environment (local .env or Netlify site environment variables), then rebuild.'
  )
}

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn('ClientFlow: Missing Supabase env variables. Copy .env.example to .env and add your project values.')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Implicit flow works when users open email confirmation links in any browser.
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
