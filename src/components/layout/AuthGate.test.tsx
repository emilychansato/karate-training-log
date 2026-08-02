import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthGate } from './AuthGate'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('AuthGate', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'emily@example.com' },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)
  })

  it('shows the welcome overlay instead of children on first visit for a user', () => {
    render(
      <MemoryRouter>
        <AuthGate>
          <p>Protected content</p>
        </AuthGate>
      </MemoryRouter>
    )
    expect(screen.getByText('Get started')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('shows children instead of the welcome overlay once the user has already dismissed it', () => {
    localStorage.setItem('karate-welcome-seen:user-1', 'true')
    render(
      <MemoryRouter>
        <AuthGate>
          <p>Protected content</p>
        </AuthGate>
      </MemoryRouter>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('dismissing the welcome overlay persists the flag and reveals children', () => {
    render(
      <MemoryRouter>
        <AuthGate>
          <p>Protected content</p>
        </AuthGate>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Get started'))
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(localStorage.getItem('karate-welcome-seen:user-1')).toBe('true')
  })
})
