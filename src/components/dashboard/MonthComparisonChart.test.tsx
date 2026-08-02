import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthComparisonChart } from './MonthComparisonChart'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'

vi.mock('../../hooks/useTrainingSessions')

describe('MonthComparisonChart', () => {
  it('shows a "no sessions" message when there is no data', () => {
    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<MonthComparisonChart />)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })

  it('shows a positive delta when this month has more hours than last month', () => {
    const now = new Date()
    const thisMonthDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`

    vi.mocked(useTrainingSessions).mockReturnValue({
      sessions: [
        {
          id: 's1',
          title: null,
          date: thisMonthDate,
          type: 'kumite',
          duration_min: 120,
          self_rating: null,
          notes: null,
          improved: [],
          struggled: [],
          created_at: '',
        },
      ],
      loading: false,
      error: null,
      createSession: vi.fn(),
      deleteSession: vi.fn(),
    })
    render(<MonthComparisonChart />)
    expect(screen.getByText('+2h')).toBeInTheDocument()
  })
})
