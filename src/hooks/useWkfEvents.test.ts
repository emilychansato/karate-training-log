import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWkfEvents } from './useWkfEvents'
import { supabase } from '../lib/supabaseClient'

const { mockEvent } = vi.hoisted(() => ({
  mockEvent: {
    id: 'e1',
    name: '2026 Karate One Series A Salzburg',
    date_start: '2026-10-02',
    date_end: '2026-10-04',
    location: 'Salzburg, Austria',
    category: 'karate-one',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockEvent], error: null })
  const select = vi.fn(() => ({ order }))
  const invoke = vi.fn().mockResolvedValue({ data: { parsed: 12, inserted: 3 }, error: null })
  return {
    supabase: {
      from: vi.fn(() => ({ select })),
      functions: { invoke },
    },
  }
})

describe('useWkfEvents', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads events ordered by date', async () => {
    const { result } = renderHook(() => useWkfEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual([mockEvent])
    expect(supabase.from).toHaveBeenCalledWith('wkf_events')
  })

  it('syncNow invokes the ingest edge function and reloads', async () => {
    const { result } = renderHook(() => useWkfEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.syncNow()
    })
    expect(response.error).toBeNull()
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ingest-wkf-events')
  })
})
