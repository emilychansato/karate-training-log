import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { OpponentDetail } from './OpponentDetail'
import { useCompetitionStats } from '../hooks/useCompetitionStats'
import { useOpponentNotes } from '../hooks/useOpponentNotes'

vi.mock('../hooks/useCompetitionStats')
vi.mock('../hooks/useOpponentNotes')

const match = {
  competitionId: 'c1',
  matchId: 'm1',
  event: 'BC Open',
  date: '2026-01-01',
  division: 'Senior -55kg',
  placement: '1st',
  discipline: 'kumite' as const,
  kata_technical_score: null,
  opponent_name: 'Alex Chen',
  points_for: 5,
  points_against: 2,
}

describe('OpponentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCompetitionStats).mockReturnValue({
      loading: false,
      matches: [match],
      records: {
        longestWinStreak: 0,
        highestPointsInMatch: null,
        bestKataTechnicalScore: null,
        totalCompetitions: 1,
      },
      winStreakMatches: [],
      opponents: [
        { opponentName: 'Alex Chen', matches: 1, wins: 1, losses: 0, draws: 0, avgPointsFor: 5, avgPointsAgainst: 2 },
      ],
      divisionHistory: [],
      winRate: { wins: 1, losses: 0, draws: 0, totalMatches: 1, winRatePercent: 100 },
    })
    vi.mocked(useOpponentNotes).mockReturnValue({
      notes: null,
      loading: false,
      saveNotes: vi.fn().mockResolvedValue({ error: null }),
    })
  })

  it('shows a not-found message for an opponent with no matches', () => {
    render(
      <MemoryRouter initialEntries={['/profile/opponents/Nobody']}>
        <Routes>
          <Route path="/profile/opponents/:name" element={<OpponentDetail />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/no matches found/i)).toBeInTheDocument()
  })

  it('shows match history and aggregate record for a real opponent', () => {
    render(
      <MemoryRouter initialEntries={['/profile/opponents/Alex%20Chen']}>
        <Routes>
          <Route path="/profile/opponents/:name" element={<OpponentDetail />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('BC Open')).toBeInTheDocument()
    expect(screen.getByText('1W')).toBeInTheDocument()
  })

  it('saves notes for the opponent', async () => {
    const saveNotes = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useOpponentNotes).mockReturnValue({ notes: null, loading: false, saveNotes })

    render(
      <MemoryRouter initialEntries={['/profile/opponents/Alex%20Chen']}>
        <Routes>
          <Route path="/profile/opponents/:name" element={<OpponentDetail />} />
        </Routes>
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /add notes/i }))
    await user.type(screen.getByPlaceholderText(/tendencies/i), 'Strong left hook')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(saveNotes).toHaveBeenCalledWith('Strong left hook')
  })
})
