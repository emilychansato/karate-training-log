import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useJournalEntries } from './useJournalEntries'
import { supabase } from '../lib/supabaseClient'

const { mockEntry } = vi.hoisted(() => ({
  mockEntry: {
    id: 'j1',
    date: '2026-08-03',
    mood: 4,
    emotions: ['proud', 'tired'],
    notes: 'Good sparring session',
    created_at: '2026-08-03T00:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockEntry], error: null })
  const select = vi.fn(() => ({ order }))
  const upsert = vi.fn().mockResolvedValue({ error: null })
  return {
    supabase: {
      from: vi.fn(() => ({ select, upsert })),
      auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }) },
    },
  }
})

describe('useJournalEntries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads entries ordered by date', async () => {
    const { result } = renderHook(() => useJournalEntries())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entries).toEqual([mockEntry])
    expect(supabase.from).toHaveBeenCalledWith('journal_entries')
  })

  it('checkIn upserts scoped to the signed-in user and today, one row per day', async () => {
    const { result } = renderHook(() => useJournalEntries())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.checkIn({
        date: '2026-08-03',
        mood: 4,
        emotions: ['proud'],
      })
    })
    expect(response.error).toBeNull()
    const upsertCall = vi.mocked(supabase.from).mock.results[0].value.upsert
    expect(upsertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', date: '2026-08-03', mood: 4 }),
      { onConflict: 'user_id,date' }
    )
  })
})
