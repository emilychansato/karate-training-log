import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountdownStat } from './CountdownStat'
import { usePlannedCompetitions } from '../../hooks/usePlannedCompetitions'
import { toIso } from '../../lib/dateFormat'

vi.mock('../../hooks/usePlannedCompetitions')

describe('CountdownStat', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows "None scheduled" when there is no upcoming competition', () => {
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [],
      loading: false,
      addPlanned: vi.fn(),
      removePlanned: vi.fn(),
    })
    render(<CountdownStat />)
    expect(screen.getByText(/none scheduled/i)).toBeInTheDocument()
  })

  it('shows the number of days until the soonest upcoming competition', () => {
    const future = new Date()
    future.setDate(future.getDate() + 12)
    const futureIso = toIso(future)

    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [
        {
          id: 'p1',
          event: 'BC Open',
          date: futureIso,
          location: null,
          division: null,
          discipline: null,
          notes: null,
          kind: 'competition',
          source_type: null,
          source_id: null,
          created_at: '2026-08-03T00:00:00Z',
        },
      ],
      loading: false,
      addPlanned: vi.fn(),
      removePlanned: vi.fn(),
    })
    render(<CountdownStat />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('BC Open')).toBeInTheDocument()
  })

  it('ignores events (only counts competitions) and dates already used up by today', () => {
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [
        {
          id: 'p1',
          event: 'A Seminar',
          date: '2099-01-01',
          location: null,
          division: null,
          discipline: null,
          notes: null,
          kind: 'event',
          source_type: null,
          source_id: null,
          created_at: '2026-08-03T00:00:00Z',
        },
      ],
      loading: false,
      addPlanned: vi.fn(),
      removePlanned: vi.fn(),
    })
    render(<CountdownStat />)
    expect(screen.getByText(/none scheduled/i)).toBeInTheDocument()
  })
})
