import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface AuthUser {
  id: string
  email: string | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getClaims().then(({ data }) => {
      if (!active) return
      const claims = data?.claims
      setUser(
        claims
          ? { id: claims.sub as string, email: (claims.email as string) ?? null }
          : null
      )
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? null }
          : null
      )
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signUp(email: string, password: string, fullName?: string, username?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || undefined, username: username || undefined } },
    })
    return { error: error?.message ?? null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  // A real (anonymous) Supabase auth user - not a mocked/local-only demo
  // mode. Every existing RLS policy (auth.uid() = user_id) keeps working
  // unchanged, so a guest can actually use the app, not just look at a
  // canned preview. Their data lives as long as the anonymous session
  // does (tied to this browser) unless they later create a real account.
  async function browseAsGuest() {
    const { error } = await supabase.auth.signInAnonymously()
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signUp, signIn, signOut, browseAsGuest }
}
