import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Welcome } from './Welcome'
import { useAuth } from '../hooks/useAuth'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderWelcome() {
  return render(
    <MemoryRouter initialEntries={['/welcome']}>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/" element={<p>Dashboard</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Welcome', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the welcome content when signed out', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderWelcome()
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('redirects to / when already signed in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'emily@example.com' },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderWelcome()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('marks welcome as seen and navigates to /login on Get started', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as never)

    renderWelcome()
    fireEvent.click(screen.getByText('Get started'))
    expect(localStorage.getItem('karate-welcome-seen')).toBe('true')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
