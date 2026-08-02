import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGoals } from './useGoals'
import { supabase } from '../lib/supabaseClient'

const { mockGoal } = vi.hoisted(() => ({
  mockGoal: {
    id: 'g1',
    goal_type: 'training_frequency',
    title: 'Train 4x/week',
    target_value: 4,
    target_text: null,
    target_date: null,
    competition_id: null,
    status: 'active',
    created_at: '2026-08-01T10:00:00Z',
    achieved_at: null,
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockGoal], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqUpdate = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn(() => ({ eq: eqUpdate }))
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))

  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, update, delete: deleteFn })),
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }),
      },
    },
  }
})

describe('useGoals', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads goals on mount', async () => {
    const { result } = renderHook(() => useGoals())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.goals).toEqual([mockGoal])
    expect(supabase.from).toHaveBeenCalledWith('goals')
  })

  it('createGoal inserts with the signed-in user_id', async () => {
    const { result } = renderHook(() => useGoals())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.createGoal({
        goal_type: 'weight',
        title: 'Reach -55kg',
        target_value: 55,
      })
    })
    expect(response.error).toBeNull()
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', goal_type: 'weight', target_value: 55 })
    )
  })

  it('markAchieved sets status to achieved with an achieved_at timestamp', async () => {
    const { result } = renderHook(() => useGoals())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAchieved('g1')
    })
    const updateCall = vi.mocked(supabase.from).mock.results[0].value.update
    expect(updateCall).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'achieved' })
    )
  })
})
