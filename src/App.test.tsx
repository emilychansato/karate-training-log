import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

vi.mock('./lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

describe('App welcome gating', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the welcome overview before any route (including login) on first visit', () => {
    render(<App />)
    expect(screen.getByText('Get started')).toBeInTheDocument()
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
  })

  it('does not show the welcome overview once it has already been dismissed', () => {
    localStorage.setItem('karate-welcome-seen', 'true')
    render(<App />)
    expect(screen.queryByText('Get started')).not.toBeInTheDocument()
  })

  it('dismissing the welcome overview persists the flag and proceeds past it', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Get started'))
    expect(screen.queryByText('Get started')).not.toBeInTheDocument()
    expect(localStorage.getItem('karate-welcome-seen')).toBe('true')
  })
})
