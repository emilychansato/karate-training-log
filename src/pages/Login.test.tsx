import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'
import { useAuth } from '../hooks/useAuth'

vi.mock('../hooks/useAuth')

describe('Login', () => {
  it('calls signIn with the entered email and password on submit', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn(),
      signIn,
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signIn).toHaveBeenCalledWith('test@example.com', 'secret123')
  })

  it('shows the error message when signIn fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn().mockResolvedValue({ error: 'Invalid login credentials' }),
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })

  it('switches to sign-up mode and calls signUp instead of signIn', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null })
    const signIn = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp,
      signIn,
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /create an account/i }))
    await user.type(screen.getByLabelText(/^name/i), 'Jamie Lee')
    await user.type(screen.getByLabelText(/username/i), 'jamielee')
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(signUp).toHaveBeenCalledWith('new@example.com', 'secret123', 'Jamie Lee', 'jamielee')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('toggles the password field between hidden and visible via the eye button', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows a check-your-email message after a successful sign-up', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    render(<Login />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /create an account/i }))
    await user.type(screen.getByLabelText(/^name/i), 'Jamie Lee')
    await user.type(screen.getByLabelText(/username/i), 'jamielee')
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
  })

  it('redirects to / when already signed in (e.g. sign-up logged the user in immediately)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'test@example.com' },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>Dashboard</p>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
