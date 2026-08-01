import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUserTechniques } from './useUserTechniques'
import { supabase } from '../lib/supabaseClient'

const { mockBookmark } = vi.hoisted(() => ({
  mockBookmark: {
    id: 'b1',
    technique_id: 't1',
    nickname: '1-2',
    techniques: { name: 'Kizami tsuki → Gyaku tsuki', category: 'kumite_combo' },
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockBookmark], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  const eqUpdate = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn(() => ({ eq: eqUpdate }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn, update })),
    },
  }
})

describe('useUserTechniques', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads bookmarks with the joined technique name and category', async () => {
    const { result } = renderHook(() => useUserTechniques())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.bookmarks).toEqual([
      { id: 'b1', technique_id: 't1', nickname: '1-2', technique_name: 'Kizami tsuki → Gyaku tsuki', category: 'kumite_combo' },
    ])
  })

  it('addBookmark inserts a row with the given technique_id and nickname', async () => {
    const { result } = renderHook(() => useUserTechniques())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addBookmark('t2', 'my combo')
    })
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith({ technique_id: 't2', nickname: 'my combo' })
  })
})
