import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionList } from './SessionList'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import type { TrainingSession } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

const session: TrainingSession = {
  id: 's1',
  date: '2026-08-01',
  type: 'kumite',
  duration_min: 60,
  self_rating: 4,
  notes: null,
  improved: [],
  struggled: [],
  created_at: '2026-08-01T10:00:00Z',
}

describe('SessionList', () => {
  it('renders a row per session and calls deleteSession on delete click', async () => {
    const deleteSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [session],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession,
    })

    render(<SessionList />)
    expect(screen.getByText('kumite')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(deleteSession).toHaveBeenCalledWith('s1')
  })

  it('shows an empty state when there are no sessions', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<SessionList />)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })
})
