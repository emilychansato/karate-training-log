import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUsername } from './useUsername'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { username: 'emily_k' }, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const limit = vi.fn().mockResolvedValue({ data: [{ user_id: 'u2', username: 'sarah_tan' }] })
  const ilike = vi.fn(() => ({ limit }))
  const select = vi.fn(() => ({ eq, ilike }))
  const upsert = vi.fn().mockResolvedValue({ error: null })

  return {
    supabase: {
      from: vi.fn(() => ({ select, upsert })),
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }),
      },
    },
  }
})

describe('useUsername', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the current username on mount', async () => {
    const { result } = renderHook(() => useUsername())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.username).toBe('emily_k')
    expect(supabase.from).toHaveBeenCalledWith('usernames')
  })

  it('claimUsername upserts the username for the signed-in user', async () => {
    const { result } = renderHook(() => useUsername())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.claimUsername('new_name')
    })
    expect(response.error).toBeNull()
    const upsertCall = vi.mocked(supabase.from).mock.results[0].value.upsert
    expect(upsertCall).toHaveBeenCalledWith({ user_id: 'user-1', username: 'new_name' })
  })

  it('searchUsers returns matches for a non-blank query', async () => {
    const { result } = renderHook(() => useUsername())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const matches = await result.current.searchUsers('sarah')
    expect(matches).toEqual([{ user_id: 'u2', username: 'sarah_tan' }])
  })

  it('searchUsers returns an empty array for a blank query without hitting the network', async () => {
    const { result } = renderHook(() => useUsername())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const matches = await result.current.searchUsers('   ')
    expect(matches).toEqual([])
  })
})
