import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionList } from './SessionList'
import type { TrainingSession } from '../../hooks/useTrainingSessions'

const session: TrainingSession = {
  id: 's1',
  title: null,
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
    render(<SessionList sessions={[session]} loading={false} deleteSession={deleteSession} />)
    expect(screen.getByText('kumite')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('Kumite session')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(deleteSession).toHaveBeenCalledWith('s1')
  })

  it('shows the nickname as the heading when the session has a title', () => {
    render(
      <SessionList
        sessions={[{ ...session, title: 'Brutal sparring night' }]}
        loading={false}
        deleteSession={vi.fn()}
      />
    )
    expect(screen.getByText('Brutal sparring night')).toBeInTheDocument()
    expect(screen.queryByText('Kumite session')).not.toBeInTheDocument()
  })

  it('shows an empty state when there are no sessions', () => {
    render(<SessionList sessions={[]} loading={false} deleteSession={vi.fn()} />)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })
})
