import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthGate } from './AuthGate'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderGate() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGate>
              <p>Protected content</p>
            </AuthGate>
          }
        />
        <Route path="/welcome" element={<p>Welcome page</p>} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AuthGate', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows a loading state while auth is resolving', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderGate()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects to /welcome when signed out and welcome has not been seen yet', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderGate()
    expect(screen.getByText('Welcome page')).toBeInTheDocument()
  })

  it('redirects to /login when signed out and welcome has already been seen', () => {
    localStorage.setItem('karate-welcome-seen', 'true')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderGate()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders children when signed in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'emily@example.com' },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderGate()
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
