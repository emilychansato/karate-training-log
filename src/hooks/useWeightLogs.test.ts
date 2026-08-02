import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWeightLogs } from './useWeightLogs'
import { supabase } from '../lib/supabaseClient'

const { mockLog } = vi.hoisted(() => ({
  mockLog: { id: 'w1', date: '2026-08-03', weight_kg: 61.2, created_at: '2026-08-03T00:00:00Z' },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockLog], error: null })
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))
  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn })),
      auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }) },
    },
  }
})

describe('useWeightLogs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads logs ordered by date', async () => {
    const { result } = renderHook(() => useWeightLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.logs).toEqual([mockLog])
  })

  it('addLog inserts scoped to the signed-in user', async () => {
    const { result } = renderHook(() => useWeightLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.addLog('2026-08-03', 61.2)
    })
    expect(response.error).toBeNull()
    const insertCall = vi.mocked(supabase.from).mock.results[0].value.insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', date: '2026-08-03', weight_kg: 61.2 })
    )
  })
})
