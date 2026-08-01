import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getClaims: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.getClaims).mockResolvedValue({
      data: null,
      error: null,
    } as never)
  })

  it('starts with loading true, then resolves to no user when unauthenticated', async () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('signUp calls supabase.auth.signUp and returns no error on success', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    } as never)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.signUp('test@example.com', 'password123')
    })
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(response.error).toBeNull()
  })

  it('signIn returns the error message on failure', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    } as never)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.signIn('test@example.com', 'wrong')
    })
    expect(response.error).toBe('Invalid login credentials')
  })
})
