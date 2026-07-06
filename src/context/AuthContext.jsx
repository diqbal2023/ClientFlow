import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadProfile(currentUser) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (error) {
        console.error('ClientFlow: Failed to load profile', error.message)
        return null
      }

      if (data) return data

      // Fallback for accounts created before the signup trigger was added.
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name ?? '',
          role: currentUser.user_metadata?.role ?? 'client',
        })
        .select('id, full_name, role')
        .single()

      if (insertError) {
        console.error('ClientFlow: Failed to create missing profile', insertError.message)
        return null
      }

      return created
    }

    async function initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        setProfile(await loadProfile(currentUser))
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        setProfile(await loadProfile(currentUser))
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isLoggedIn: Boolean(user),
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
