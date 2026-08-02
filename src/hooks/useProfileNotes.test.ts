import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProfileNotes } from './useProfileNotes'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { why_i_train: 'For my future self.' }, error: null })
  const select = vi.fn(() => ({ maybeSingle }))
  const upsert = vi.fn().mockResolvedValue({ error: null })
  return {
    supabase: {
      from: vi.fn(() => ({ select, upsert })),
      auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }) },
    },
  }
})

describe('useProfileNotes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the saved why-I-train note', async () => {
    const { result } = renderHook(() => useProfileNotes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.whyITrain).toBe('For my future self.')
  })

  it('saveWhyITrain upserts scoped to the signed-in user', async () => {
    const { result } = renderHook(() => useProfileNotes())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.saveWhyITrain('Because I love it.')
    })
    expect(response.error).toBeNull()
    const upsertCall = vi.mocked(supabase.from).mock.results[0].value.upsert
    expect(upsertCall).toHaveBeenCalledWith(
      { user_id: 'user-1', why_i_train: 'Because I love it.' },
      { onConflict: 'user_id' }
    )
  })
})
