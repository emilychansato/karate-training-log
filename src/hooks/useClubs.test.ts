import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useClubs } from './useClubs'
import { supabase } from '../lib/supabaseClient'

const { mockClub } = vi.hoisted(() => ({
  mockClub: {
    id: 'club-1',
    name: 'North Shore Karate',
    description: null,
    created_by: 'user-1',
    created_at: '2026-08-01T10:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const membershipEq = vi.fn().mockResolvedValue({ data: [{ club_id: 'club-1' }], error: null })
  const membershipSelect = vi.fn(() => ({ eq: membershipEq }))

  const clubIn = vi.fn().mockResolvedValue({ data: [mockClub], error: null })
  const clubSelect = vi.fn(() => ({ in: clubIn }))

  const single = vi.fn().mockResolvedValue({ data: { id: 'new-club-id' }, error: null })
  const insertSelect = vi.fn(() => ({ single }))
  const clubInsert = vi.fn(() => ({ select: insertSelect }))
  const memberInsert = vi.fn().mockResolvedValue({ error: null })

  const from = vi.fn((table: string) => {
    if (table === 'club_members') {
      return { select: membershipSelect, insert: memberInsert }
    }
    return { select: clubSelect, insert: clubInsert }
  })

  return {
    supabase: {
      from,
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }),
      },
    },
  }
})

describe('useClubs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the clubs the signed-in user is a member of', async () => {
    const { result } = renderHook(() => useClubs())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.myClubs).toEqual([mockClub])
  })

  it('createClub inserts the club and adds the creator as an admin member', async () => {
    const { result } = renderHook(() => useClubs())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null; id: string | null } = { error: 'unset', id: null }
    await act(async () => {
      response = await result.current.createClub('New Club', 'A description')
    })
    expect(response.error).toBeNull()
    expect(response.id).toBe('new-club-id')

    const memberCallIndex = vi
      .mocked(supabase.from)
      .mock.calls.findIndex((c) => c[0] === 'club_members')
    const memberInsertCall = vi.mocked(supabase.from).mock.results[memberCallIndex].value.insert
    expect(memberInsertCall).toHaveBeenCalledWith({
      club_id: 'new-club-id',
      user_id: 'user-1',
      role: 'admin',
    })
  })
})
