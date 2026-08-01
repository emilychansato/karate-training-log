import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTechniques } from './useTechniques'
import { supabase } from '../lib/supabaseClient'

const { mockTechnique } = vi.hoisted(() => ({
  mockTechnique: { id: 't1', name: 'Heian Shodan', category: 'kata' },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockTechnique], error: null })
  const select = vi.fn(() => ({ order }))
  return {
    supabase: {
      from: vi.fn(() => ({ select })),
    },
  }
})

describe('useTechniques', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the technique catalog', async () => {
    const { result } = renderHook(() => useTechniques())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.techniques).toEqual([mockTechnique])
  })

  it('queries the techniques table ordered by name', async () => {
    renderHook(() => useTechniques())
    await waitFor(() => expect(supabase.from).toHaveBeenCalledWith('techniques'))
  })
})
