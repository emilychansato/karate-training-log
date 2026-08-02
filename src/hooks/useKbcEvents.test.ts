import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useKbcEvents } from './useKbcEvents'
import { supabase } from '../lib/supabaseClient'

const { mockEvent } = vi.hoisted(() => ({
  mockEvent: {
    id: 'k1',
    name: 'Zone 5 BCWG Selection Tournament',
    date_start: '2026-09-06',
    date_end: null,
    location: 'Kelowna, BC',
    kind: 'competition',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockEvent], error: null })
  const select = vi.fn(() => ({ order }))
  const invoke = vi.fn().mockResolvedValue({ data: { parsed: 900, inserted: 5 }, error: null })
  return {
    supabase: {
      from: vi.fn(() => ({ select })),
      functions: { invoke },
    },
  }
})

describe('useKbcEvents', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads events ordered by date', async () => {
    const { result } = renderHook(() => useKbcEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual([mockEvent])
    expect(supabase.from).toHaveBeenCalledWith('kbc_events')
  })

  it('syncNow invokes the ingest edge function and reloads', async () => {
    const { result } = renderHook(() => useKbcEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.syncNow()
    })
    expect(response.error).toBeNull()
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ingest-kbc-events')
  })
})
