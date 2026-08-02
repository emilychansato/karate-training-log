import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFriends } from './useFriends'
import { supabase } from '../lib/supabaseClient'

const { mockFriendship } = vi.hoisted(() => ({
  mockFriendship: {
    id: 'f1',
    requester_id: 'user-1',
    recipient_id: 'user-2',
    status: 'accepted',
    created_at: '2026-08-01T10:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockFriendship], error: null })
  const or = vi.fn(() => ({ order }))
  const inNames = vi.fn().mockResolvedValue({ data: [{ user_id: 'user-2', username: 'sarah_tan' }] })
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqUpdate = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn(() => ({ eq: eqUpdate }))
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))

  const from = vi.fn((table: string) => {
    if (table === 'usernames') return { select: vi.fn(() => ({ in: inNames })) }
    return { select: vi.fn(() => ({ or })), insert, update, delete: deleteFn }
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

describe('useFriends', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads friendships scoped to the signed-in user, resolving the other person\'s username', async () => {
    const { result } = renderHook(() => useFriends())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.friendships).toEqual([
      { ...mockFriendship, otherUserId: 'user-2', otherUsername: 'sarah_tan' },
    ])
  })

  it('sendRequest inserts a pending friendship from the signed-in user', async () => {
    const { result } = renderHook(() => useFriends())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.sendRequest('user-3')
    })
    expect(response.error).toBeNull()
    const insertCall = vi
      .mocked(supabase.from)
      .mock.results.find((r) => r.value.insert)?.value.insert
    expect(insertCall).toHaveBeenCalledWith({ requester_id: 'user-1', recipient_id: 'user-3' })
  })

  it('acceptRequest sets the friendship status to accepted', async () => {
    const { result } = renderHook(() => useFriends())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.acceptRequest('f1')
    })
    const updateCall = vi
      .mocked(supabase.from)
      .mock.results.find((r) => r.value.update)?.value.update
    expect(updateCall).toHaveBeenCalledWith({ status: 'accepted' })
  })
})
