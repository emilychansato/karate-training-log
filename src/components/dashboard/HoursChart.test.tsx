import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoursChart } from './HoursChart'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

describe('HoursChart', () => {
  it('shows a "no data yet" message when there are no sessions', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<HoursChart />)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })

  it('renders the chart container when sessions exist', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [
        {
          id: 's1',
          title: null,
          date: '2026-08-01',
          type: 'kumite',
          duration_min: 60,
          self_rating: 4,
          notes: null,
          location: null,
          improved: [],
          struggled: [],
          created_at: '2026-08-01T10:00:00Z',
        },
      ],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<HoursChart />)
    expect(screen.queryByText(/no sessions logged yet/i)).not.toBeInTheDocument()
  })
})
