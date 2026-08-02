import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NextCompetitionGoals } from './NextCompetitionGoals'
import { usePlannedCompetitions } from '../../hooks/usePlannedCompetitions'
import { usePrepPlan } from '../../hooks/usePrepPlan'

vi.mock('../../hooks/usePlannedCompetitions')
vi.mock('../../hooks/usePrepPlan')

describe('NextCompetitionGoals', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a prompt when nothing upcoming is saved', () => {
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [],
      loading: false,
      addPlanned: vi.fn(),
      removePlanned: vi.fn(),
    })
    vi.mocked(usePrepPlan).mockReturnValue({
      goals: [],
      tasks: [],
      loading: false,
      addGoal: vi.fn(),
      removeGoal: vi.fn(),
      addTask: vi.fn(),
      toggleTask: vi.fn(),
      removeTask: vi.fn(),
    })
    render(<NextCompetitionGoals />, { wrapper: MemoryRouter })
    expect(screen.getByText(/no upcoming competition saved yet/i)).toBeInTheDocument()
  })

  it('shows the soonest upcoming competition and its goals', () => {
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [
        {
          id: 'p2',
          event: 'Later Comp',
          date: '2099-06-01',
          location: null,
          division: null,
          discipline: null,
          notes: null,
          kind: 'competition',
          source_type: null,
          source_id: null,
          created_at: '2026-08-03T00:00:00Z',
        },
        {
          id: 'p1',
          event: 'BC Open',
          date: '2099-01-15',
          location: 'Surrey, BC',
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
    vi.mocked(usePrepPlan).mockReturnValue({
      goals: [{ id: 'g1', discipline: 'kata', goal: 'Hit 8.5+', created_at: '2026-08-03T00:00:00Z' }],
      tasks: [],
      loading: false,
      addGoal: vi.fn(),
      removeGoal: vi.fn(),
      addTask: vi.fn(),
      toggleTask: vi.fn(),
      removeTask: vi.fn(),
    })
    render(<NextCompetitionGoals />, { wrapper: MemoryRouter })

    expect(screen.getByText('BC Open')).toBeInTheDocument()
    expect(screen.getByText('Hit 8.5+')).toBeInTheDocument()
    expect(usePrepPlan).toHaveBeenCalledWith('p1')
  })
})
