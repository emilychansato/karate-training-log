import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export interface ProfileInfo {
  beltRank: string | null
  clubName: string | null
  primaryDiscipline: 'kata' | 'kumite' | null
}

export function useProfileNotes() {
  const [whyITrain, setWhyITrain] = useState<string | null>(null)
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    beltRank: null,
    clubName: null,
    primaryDiscipline: null,
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profile_notes')
      .select('why_i_train, belt_rank, club_name, primary_discipline')
      .maybeSingle()
    setWhyITrain(data?.why_i_train ?? null)
    setProfileInfo({
      beltRank: data?.belt_rank ?? null,
      clubName: data?.club_name ?? null,
      primaryDiscipline: data?.primary_discipline ?? null,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveWhyITrain(text: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('profile_notes')
      .upsert({ user_id: userId, why_i_train: text }, { onConflict: 'user_id' })
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  async function saveProfileInfo(fields: {
    beltRank?: string
    clubName?: string
    primaryDiscipline?: 'kata' | 'kumite'
  }) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('profile_notes').upsert(
      {
        user_id: userId,
        belt_rank: fields.beltRank,
        club_name: fields.clubName,
        primary_discipline: fields.primaryDiscipline,
      },
      { onConflict: 'user_id' }
    )
    if (!error) await load()
    return { error: error?.message ?? null }
  }

  return { whyITrain, profileInfo, loading, saveWhyITrain, saveProfileInfo }
}
