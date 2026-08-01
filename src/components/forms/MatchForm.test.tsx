import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MatchForm } from './MatchForm'
import { useCompetitionMatches } from '../../hooks/useCompetitionMatches'

vi.mock('../../hooks/useCompetitionMatches')

describe('MatchForm', () => {
  it('shows kumite stepper fields when discipline is kumite, and kata fields when kata', () => {
    vi.mocked(useCompetitionMatches).mockReturnValue({
      matches: [],
      loading: false,
      createMatch: vi.fn(),
      deleteMatch: vi.fn(),
    })

    const { rerender } = render(
      <MatchForm competitionId="c1" discipline="kumite" onSuccess={vi.fn()} />
    )
    expect(screen.getByText('My Yuko')).toBeInTheDocument()
    expect(screen.queryByLabelText(/technical score/i)).not.toBeInTheDocument()

    rerender(<MatchForm competitionId="c1" discipline="kata" onSuccess={vi.fn()} />)
    expect(screen.getByLabelText(/technical score/i)).toBeInTheDocument()
    expect(screen.queryByText('My Yuko')).not.toBeInTheDocument()
  })

  it('submits a kumite match with the opponent name and score breakdown', async () => {
    const createMatch = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useCompetitionMatches).mockReturnValue({
      matches: [],
      loading: false,
      createMatch,
      deleteMatch: vi.fn(),
    })
    const onSuccess = vi.fn()
    render(<MatchForm competitionId="c1" discipline="kumite" onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/opponent name/i), 'Jamie Lee')
    await user.click(screen.getByRole('button', { name: 'Increase My Yuko' }))
    await user.click(screen.getByRole('button', { name: /save match/i }))

    await waitFor(() =>
      expect(createMatch).toHaveBeenCalledWith(
        expect.objectContaining({ opponent_name: 'Jamie Lee', my_yuko: 1 })
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })
})
