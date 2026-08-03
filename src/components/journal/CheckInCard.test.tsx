import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckInCard } from './CheckInCard'
import { todayIso, toIso } from '../../lib/dateFormat'

describe('CheckInCard', () => {
  it('opens the check-in flow, picks a mood and emotion, and saves', async () => {
    const checkIn = vi.fn().mockResolvedValue({ error: null })
    render(<CheckInCard entries={[]} checkIn={checkIn} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /check in/i }))
    await user.click(screen.getByRole('radio', { name: 'Mood 4' }))
    await user.click(screen.getByRole('checkbox', { name: 'proud' }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(checkIn).toHaveBeenCalledWith(
      expect.objectContaining({ date: todayIso(), mood: 4, emotions: ['proud'] })
    )
  })

  it('shows a filled mood emoji for today in the week strip once checked in', () => {
    render(
      <CheckInCard
        entries={[{ id: 'j1', date: todayIso(), mood: 5, emotions: [], notes: null, created_at: '' }]}
        checkIn={vi.fn()}
      />
    )
    expect(screen.getByText('😄')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update check-in/i })).toBeInTheDocument()
  })

  it('shows a streak count when there are consecutive check-ins', () => {
    const today = todayIso()
    const yesterday = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return toIso(d)
    })()

    render(
      <CheckInCard
        entries={[
          { id: 'j1', date: today, mood: 4, emotions: [], notes: null, created_at: '' },
          { id: 'j2', date: yesterday, mood: 3, emotions: [], notes: null, created_at: '' },
        ]}
        checkIn={vi.fn()}
      />
    )
    expect(screen.getByText('2 days in a row')).toBeInTheDocument()
  })

  it('shows no streak indicator when there are no entries', () => {
    render(<CheckInCard entries={[]} checkIn={vi.fn()} />)
    expect(screen.queryByText(/in a row/i)).not.toBeInTheDocument()
  })
})
