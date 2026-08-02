import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export type EntryType = 'training_session' | 'competition' | 'journal_entry'

export interface Photo {
  id: string
  entry_type: EntryType
  entry_id: string
  storage_path: string
  url: string
  created_at: string
}

export function usePhotos(entryType: EntryType, entryId: string | null) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!entryId) {
      setPhotos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('entry_type', entryType)
      .eq('entry_id', entryId)
      .order('created_at', { ascending: true })
    const rows = data ?? []
    // Bucket is private, so URLs must be short-lived signed URLs rather
    // than public URLs (which would 403 with no auth token attached).
    const withUrls = await Promise.all(
      rows.map(async (row) => {
        const { data: signed } = await supabase.storage
          .from('entry-photos')
          .createSignedUrl(row.storage_path, 3600)
        return { ...row, url: signed?.signedUrl ?? '' } as Photo
      })
    )
    setPhotos(withUrls)
    setLoading(false)
  }, [entryType, entryId])

  useEffect(() => {
    load()
  }, [load])

  async function uploadPhoto(file: File) {
    if (!entryId) return { error: 'No entry to attach this photo to' }
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const extension = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${entryType}/${entryId}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage.from('entry-photos').upload(path, file)
    if (uploadError) return { error: uploadError.message }

    const { error: insertError } = await supabase.from('photos').insert({
      user_id: userId,
      entry_type: entryType,
      entry_id: entryId,
      storage_path: path,
    })
    if (insertError) return { error: insertError.message }

    await load()
    return { error: null }
  }

  async function deletePhoto(photo: Photo) {
    await supabase.storage.from('entry-photos').remove([photo.storage_path])
    const { error } = await supabase.from('photos').delete().eq('id', photo.id)
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { photos, loading, uploadPhoto, deletePhoto }
}
