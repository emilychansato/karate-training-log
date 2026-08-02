import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface Friendship {
  id: string
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted'
  created_at: string
  /** The other person in this friendship, resolved for display. */
  otherUserId: string
  otherUsername: string | null
}

export function useFriends() {
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const userId = await getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    const rows = data ?? []
    const otherIds = rows.map((r) => (r.requester_id === userId ? r.recipient_id : r.requester_id))
    const { data: names } =
      otherIds.length > 0
        ? await supabase.from('usernames').select('user_id, username').in('user_id', otherIds)
        : { data: [] as { user_id: string; username: string }[] }
    const nameById = new Map((names ?? []).map((n) => [n.user_id, n.username]))

    setFriendships(
      rows.map((r) => {
        const otherUserId = r.requester_id === userId ? r.recipient_id : r.requester_id
        return { ...r, otherUserId, otherUsername: nameById.get(otherUserId) ?? null }
      }) as Friendship[]
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function sendRequest(recipientId: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: userId, recipient_id: recipientId })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function acceptRequest(id: string) {
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeFriend(id: string) {
    const { error } = await supabase.from('friendships').delete().eq('id', id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { friendships, loading, sendRequest, acceptRequest, removeFriend }
}
