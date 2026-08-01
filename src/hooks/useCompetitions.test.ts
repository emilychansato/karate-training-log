import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCompetitions } from './useCompetitions'
import { supabase } from '../lib/supabaseClient'

const { mockCompetition } = vi.hoisted(() => ({
  mockCompetition: {
    id: 'c1',
    event: 'BC Open',
    date: '2026-06-01',
    division: 'Senior -55kg',
    discipline: 'kumite',
    placement: '1st',
    notes: null,
    created_at: '2026-06-01T10:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockCompetition], error: null })
  const listSelect = vi.fn(() => ({ order }))
  const single = vi.fn().mockResolvedValue({ data: { id: 'new-comp-id' }, error: null })
  const insertSelect = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select: insertSelect }))
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  const eqUpdate = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn(() => ({ eq: eqUpdate }))
  return {
    supabase: {
      from: vi.fn(() => ({ select: listSelect, insert, delete: deleteFn, update })),
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }),
      },
    },
  }
})

describe('useCompetitions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads competitions on mount', async () => {
    const { result } = renderHook(() => useCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.competitions).toEqual([mockCompetition])
    expect(supabase.from).toHaveBeenCalledWith('competitions')
  })

  it('createCompetition inserts with the signed-in user_id and returns the new id', async () => {
    const { result } = renderHook(() => useCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null; id: string | null } = { error: 'unset', id: null }
    await act(async () => {
      response = await result.current.createCompetition({
        event: 'Nationals',
        date: '2026-07-01',
        discipline: 'kumite',
      })
    })
    expect(response.error).toBeNull()
    expect(response.id).toBe('new-comp-id')
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', event: 'Nationals', discipline: 'kumite' })
    )
  })

  it('updateCompetition updates the reflection fields for the given id', async () => {
    const { result } = renderHook(() => useCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.updateCompetition('c1', {
        what_went_well: 'Fast footwork',
        goals_for_next_time: 'Work on distance control',
      })
    })
    expect(response.error).toBeNull()
    const updateCall = vi.mocked(supabase.from).mock.results[0].value.update
    expect(updateCall).toHaveBeenCalledWith({
      what_went_well: 'Fast footwork',
      goals_for_next_time: 'Work on distance control',
    })
  })
})
