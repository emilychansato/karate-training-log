import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpcomingTimeline } from './UpcomingTimeline'
import { usePlannedCompetitions } from '../../hooks/usePlannedCompetitions'
import { useWkfEvents } from '../../hooks/useWkfEvents'
import { useKbcEvents } from '../../hooks/useKbcEvents'

vi.mock('../../hooks/usePlannedCompetitions')
vi.mock('../../hooks/useWkfEvents')
vi.mock('../../hooks/useKbcEvents')

const FUTURE_DATE = '2099-01-15'

describe('UpcomingTimeline', () => {
  const addPlanned = vi.fn().mockResolvedValue({ error: null })
  const removePlanned = vi.fn().mockResolvedValue({ error: null })

  beforeEach(() => {
    vi.clearAllMocks()
    addPlanned.mockResolvedValue({ error: null })
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [],
      loading: false,
      addPlanned,
      removePlanned,
    })
    vi.mocked(useWkfEvents).mockReturnValue({
      events: [
        {
          id: 'w1',
          name: 'WKF Karate 1 Series A',
          date_start: FUTURE_DATE,
          date_end: null,
          location: 'Paris, France',
          category: 'karate-one',
        },
      ],
      loading: false,
      syncing: false,
      syncNow: vi.fn(),
    })
    vi.mocked(useKbcEvents).mockReturnValue({
      events: [
        {
          id: 'k1',
          name: 'William Gomes Kumite Seminar',
          date_start: FUTURE_DATE,
          date_end: null,
          location: 'Surrey, BC',
          kind: 'event',
        },
      ],
      loading: false,
      syncing: false,
      syncNow: vi.fn(),
    })
  })

  it('merges WKF and KBC raw events with planned items into one sorted list', () => {
    render(<UpcomingTimeline />)
    expect(screen.getByText('WKF Karate 1 Series A')).toBeInTheDocument()
    expect(screen.getByText('William Gomes Kumite Seminar')).toBeInTheDocument()
  })

  it('hides a raw event once it has already been added, instead of leaving it saying Add', () => {
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [
        {
          id: 'p1',
          event: 'WKF Karate 1 Series A',
          date: FUTURE_DATE,
          location: 'Paris, France',
          division: null,
          discipline: null,
          notes: null,
          kind: 'competition',
          source_type: 'wkf',
          source_id: 'w1',
          created_at: '2026-08-02T00:00:00Z',
        },
      ],
      loading: false,
      addPlanned,
      removePlanned,
    })
    render(<UpcomingTimeline />)

    // Only one card for this event (the "mine" one, with Remove) - the raw
    // WKF card must not still be rendered separately showing "Add". The
    // still-unadded KBC seminar keeps its own Add button.
    expect(screen.getAllByText('WKF Karate 1 Series A')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(1)
  })

  it('adding a raw event calls addPlanned with its source pointer', async () => {
    render(<UpcomingTimeline />)
    const user = userEvent.setup()

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0])

    await waitFor(() =>
      expect(addPlanned).toHaveBeenCalledWith(
        expect.objectContaining({ source_type: 'wkf', source_id: 'w1' })
      )
    )
  })

  it('filter chips toggle competitions and events independently', async () => {
    render(<UpcomingTimeline />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('checkbox', { name: 'Events' }))
    await waitFor(() =>
      expect(screen.queryByText('William Gomes Kumite Seminar')).not.toBeInTheDocument()
    )
    expect(screen.getByText('WKF Karate 1 Series A')).toBeInTheDocument()
  })
})
