import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePrepPlan } from './usePrepPlan'
import { supabase } from '../lib/supabaseClient'

const { mockGoal, mockTask } = vi.hoisted(() => ({
  mockGoal: {
    id: 'g1',
    discipline: 'kumite',
    goal: 'Land the kizami-gyaku combo under pressure',
    created_at: '2026-08-03T00:00:00Z',
  },
  mockTask: {
    id: 't1',
    phase: 'technique_building',
    title: 'Drill kizami-gyaku 3x/week',
    done: false,
    created_at: '2026-08-03T00:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const goalOrder = vi.fn().mockResolvedValue({ data: [mockGoal], error: null })
  const goalEq = vi.fn(() => ({ order: goalOrder }))
  const goalSelect = vi.fn(() => ({ eq: goalEq }))
  const goalInsert = vi.fn().mockResolvedValue({ error: null })
  const goalDeleteEq = vi.fn().mockResolvedValue({ error: null })
  const goalDelete = vi.fn(() => ({ eq: goalDeleteEq }))

  const taskOrder = vi.fn().mockResolvedValue({ data: [mockTask], error: null })
  const taskEq = vi.fn(() => ({ order: taskOrder }))
  const taskSelect = vi.fn(() => ({ eq: taskEq }))
  const taskInsert = vi.fn().mockResolvedValue({ error: null })
  const taskUpdateEq = vi.fn().mockResolvedValue({ error: null })
  const taskUpdate = vi.fn(() => ({ eq: taskUpdateEq }))
  const taskDeleteEq = vi.fn().mockResolvedValue({ error: null })
  const taskDelete = vi.fn(() => ({ eq: taskDeleteEq }))

  const from = vi.fn((table: string) => {
    if (table === 'prep_goals') {
      return { select: goalSelect, insert: goalInsert, delete: goalDelete }
    }
    return { select: taskSelect, insert: taskInsert, update: taskUpdate, delete: taskDelete }
  })

  return { supabase: { from } }
})

describe('usePrepPlan', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads goals and tasks scoped to the planned competition', async () => {
    const { result } = renderHook(() => usePrepPlan('pc1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.goals).toEqual([mockGoal])
    expect(result.current.tasks).toEqual([mockTask])
    expect(supabase.from).toHaveBeenCalledWith('prep_goals')
    expect(supabase.from).toHaveBeenCalledWith('prep_tasks')
  })

  it('addGoal inserts scoped to the planned competition', async () => {
    const { result } = renderHook(() => usePrepPlan('pc1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addGoal('Hit 8.5+ kata score', 'kata')
    })

    const goalsFrom = vi.mocked(supabase.from).mock.results.find((r) => r.value.insert && !r.value.update)
    expect(goalsFrom?.value.insert).toHaveBeenCalledWith(
      expect.objectContaining({ planned_competition_id: 'pc1', goal: 'Hit 8.5+ kata score', discipline: 'kata' })
    )
  })

  it('toggleTask updates the done flag', async () => {
    const { result } = renderHook(() => usePrepPlan('pc1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.toggleTask('t1', true)
    })
    expect(response.error).toBeNull()
  })
})
