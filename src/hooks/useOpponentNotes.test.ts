import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useOpponentNotes } from './useOpponentNotes'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { notes: 'Strong left hook.' }, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const upsert = vi.fn().mockResolvedValue({ error: null })
  return {
    supabase: {
      from: vi.fn(() => ({ select, upsert })),
      auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }) },
    },
  }
})

describe('useOpponentNotes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads notes scoped to the given opponent name', async () => {
    const { result } = renderHook(() => useOpponentNotes('Jamie Lee'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.notes).toBe('Strong left hook.')
    const eqCall = vi.mocked(supabase.from).mock.results[0].value.select
    expect(eqCall).toHaveBeenCalledWith('notes')
  })

  it('saveNotes upserts scoped to the signed-in user and opponent name', async () => {
    const { result } = renderHook(() => useOpponentNotes('Jamie Lee'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.saveNotes('Watch the spinning kick.')
    })
    expect(response.error).toBeNull()
    const upsertCall = vi.mocked(supabase.from).mock.results[0].value.upsert
    expect(upsertCall).toHaveBeenCalledWith(
      { user_id: 'user-1', opponent_name: 'Jamie Lee', notes: 'Watch the spinning kick.' },
      { onConflict: 'user_id,opponent_name' }
    )
  })
})
