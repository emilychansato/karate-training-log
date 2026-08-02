import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectionForm } from './ReflectionForm'
import type { Competition } from '../../hooks/useCompetitions'

const competition: Competition = {
  id: 'c1',
  event: 'BC Open',
  date: '2026-06-01',
  division: null,
  discipline: 'kumite',
  placement: null,
  notes: null,
  location: null,
  latitude: null,
  longitude: null,
  rank_at_time: null,
  coach_notes: null,
  what_went_well: null,
  what_to_improve: null,
  post_competition_feelings: null,
  goals_for_next_time: null,
  created_at: '2026-06-01T00:00:00Z',
}

describe('ReflectionForm', () => {
  it('submits the entered reflection fields for the given competition', async () => {
    const updateCompetition = vi.fn().mockResolvedValue({ error: null })
    const onSuccess = vi.fn()
    render(
      <ReflectionForm
        competition={competition}
        updateCompetition={updateCompetition}
        onSuccess={onSuccess}
      />
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/what went well/i), 'Fast footwork')
    await user.type(screen.getByLabelText(/goals for next time/i), 'Work on distance control')
    await user.click(screen.getByRole('button', { name: /save reflection/i }))

    expect(updateCompetition).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        what_went_well: 'Fast footwork',
        goals_for_next_time: 'Work on distance control',
      })
    )
    expect(onSuccess).toHaveBeenCalled()
  })
})
