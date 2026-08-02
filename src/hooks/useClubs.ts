import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface Club {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  username: string | null
}

export function useClubs() {
  const [myClubs, setMyClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const userId = await getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    const { data: memberships } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', userId)
    const clubIds = (memberships ?? []).map((m) => m.club_id)

    if (clubIds.length === 0) {
      setMyClubs([])
      setLoading(false)
      return
    }

    const { data } = await supabase.from('clubs').select('*').in('id', clubIds)
    setMyClubs((data ?? []) as Club[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createClub(name: string, description?: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in', id: null }

    const { data, error } = await supabase
      .from('clubs')
      .insert({ name, description, created_by: userId })
      .select()
      .single()
    if (error) return { error: error.message, id: null }

    await supabase.from('club_members').insert({ club_id: data.id, user_id: userId, role: 'admin' })
    await load()
    return { error: null, id: data.id as string }
  }

  async function searchClubs(query: string): Promise<Club[]> {
    if (!query.trim()) return []
    const { data } = await supabase.from('clubs').select('*').ilike('name', `%${query}%`).limit(10)
    return (data ?? []) as Club[]
  }

  async function joinClub(clubId: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('club_members').insert({ club_id: clubId, user_id: userId })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function leaveClub(clubId: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function getMembers(clubId: string): Promise<ClubMember[]> {
    const { data } = await supabase.from('club_members').select('*').eq('club_id', clubId)
    const rows = data ?? []
    const userIds = rows.map((r) => r.user_id)
    const { data: names } =
      userIds.length > 0
        ? await supabase.from('usernames').select('user_id, username').in('user_id', userIds)
        : { data: [] as { user_id: string; username: string }[] }
    const nameById = new Map((names ?? []).map((n) => [n.user_id, n.username]))
    return rows.map((r) => ({ ...r, username: nameById.get(r.user_id) ?? null })) as ClubMember[]
  }

  return { myClubs, loading, createClub, searchClubs, joinClub, leaveClub, getMembers }
}
