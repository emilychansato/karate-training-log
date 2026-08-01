import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionForm } from './SessionForm'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

describe('SessionForm', () => {
  it('submits with date, type, duration, and checked improved/struggled tags', async () => {
    const createSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession,
      deleteSession: vi.fn(),
    })

    const onSuccess = vi.fn()
    render(<SessionForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/date/i), '2026-08-01')
    await user.selectOptions(screen.getByLabelText(/type/i), 'kumite')
    await user.type(screen.getByLabelText(/duration/i), '60')
    await user.click(screen.getByRole('checkbox', { name: 'Timing' }))
    await user.click(screen.getByRole('checkbox', { name: 'Footwork' }))
    await user.click(screen.getByRole('button', { name: /save session/i }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-08-01',
          type: 'kumite',
          duration_min: 60,
          improved: ['Timing'],
          struggled: ['Footwork'],
        })
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows a validation error when duration is missing', async () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })

    render(<SessionForm onSuccess={vi.fn()} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/date/i), '2026-08-01')
    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(await screen.findByText(/duration is required/i)).toBeInTheDocument()
  })
})
