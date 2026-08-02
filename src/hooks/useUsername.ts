import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface UserMatch {
  user_id: string
  username: string
}

export function useUsername() {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const userId = await getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('usernames')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle()
    setUsername(data?.username ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function claimUsername(name: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('usernames')
      .upsert({ user_id: userId, username: name })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function searchUsers(query: string): Promise<UserMatch[]> {
    if (!query.trim()) return []
    const { data } = await supabase
      .from('usernames')
      .select('user_id, username')
      .ilike('username', `%${query}%`)
      .limit(10)
    return (data ?? []) as UserMatch[]
  }

  return { username, loading, claimUsername, searchUsers }
}
