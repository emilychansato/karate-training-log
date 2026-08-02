import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { RecordsPanel } from './RecordsPanel'
import { useCompetitionStats } from '../../hooks/useCompetitionStats'

vi.mock('../../hooks/useCompetitionStats')

describe('RecordsPanel', () => {
  it('clicking Win streak reveals the matches that made up the streak', async () => {
    vi.mocked(useCompetitionStats).mockReturnValue({
      loading: false,
      matches: [],
      records: {
        longestWinStreak: 2,
        highestPointsInMatch: 5,
        bestKataTechnicalScore: null,
        totalCompetitions: 3,
      },
      winStreakMatches: [
        {
          competitionId: 'c1',
          matchId: 'm1',
          event: 'BC Open',
          date: '2026-01-01',
          division: null,
          placement: null,
          discipline: 'kumite',
          kata_technical_score: null,
          opponent_name: 'Alex Chen',
          points_for: 5,
          points_against: 2,
        },
      ],
      opponents: [],
      divisionHistory: [],
      winRate: { wins: 1, losses: 0, draws: 0, totalMatches: 1, winRatePercent: 100 },
    })

    render(<RecordsPanel />, { wrapper: MemoryRouter })
    const user = userEvent.setup()

    expect(screen.queryByText('BC Open')).not.toBeInTheDocument()
    await user.click(screen.getByText('Win streak'))
    expect(screen.getByText('BC Open')).toBeInTheDocument()
  })

  it('Group by division groups the division progression list', async () => {
    vi.mocked(useCompetitionStats).mockReturnValue({
      loading: false,
      matches: [],
      records: {
        longestWinStreak: 0,
        highestPointsInMatch: null,
        bestKataTechnicalScore: null,
        totalCompetitions: 2,
      },
      winStreakMatches: [],
      opponents: [],
      divisionHistory: [
        { division: 'Senior -55kg', date: '2026-01-01', discipline: 'kumite', placement: '1st' },
        { division: 'Senior -55kg', date: '2026-03-01', discipline: 'kumite', placement: '2nd' },
      ],
      winRate: { wins: 0, losses: 0, draws: 0, totalMatches: 0, winRatePercent: 0 },
    })

    render(<RecordsPanel />, { wrapper: MemoryRouter })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /group by division/i }))
    expect(screen.getByText('Senior -55kg (2)')).toBeInTheDocument()
  })
})
