import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface TechniqueBookmark {
  id: string
  technique_id: string
  nickname: string | null
  technique_name: string
  category: string
}

interface RawBookmarkRow {
  id: string
  technique_id: string
  nickname: string | null
  techniques: { name: string; category: string }
}

export function useUserTechniques() {
  const [bookmarks, setBookmarks] = useState<TechniqueBookmark[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_techniques')
      .select('id, technique_id, nickname, techniques(name, category)')
      .order('created_at', { ascending: false })
    const rows = (data ?? []) as unknown as RawBookmarkRow[]
    setBookmarks(
      rows.map((r) => ({
        id: r.id,
        technique_id: r.technique_id,
        nickname: r.nickname,
        technique_name: r.techniques.name,
        category: r.techniques.category,
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addBookmark(techniqueId: string, nickname?: string) {
    const { error } = await supabase
      .from('user_techniques')
      .insert({ technique_id: techniqueId, nickname: nickname ?? null })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function removeBookmark(bookmarkId: string) {
    const { error } = await supabase.from('user_techniques').delete().eq('id', bookmarkId)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function updateNickname(bookmarkId: string, nickname: string) {
    const { error } = await supabase
      .from('user_techniques')
      .update({ nickname })
      .eq('id', bookmarkId)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { bookmarks, loading, addBookmark, removeBookmark, updateNickname }
}
