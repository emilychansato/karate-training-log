import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { TournamentPrep } from './TournamentPrep'
import { usePlannedCompetitions } from '../hooks/usePlannedCompetitions'
import { usePrepPlan } from '../hooks/usePrepPlan'

vi.mock('../hooks/usePlannedCompetitions')
vi.mock('../hooks/usePrepPlan')

describe('TournamentPrep', () => {
  const addGoal = vi.fn().mockResolvedValue({ error: null })

  beforeEach(() => {
    vi.clearAllMocks()
    addGoal.mockResolvedValue({ error: null })
    vi.mocked(usePlannedCompetitions).mockReturnValue({
      planned: [
        {
          id: 'pc1',
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
      goals: [],
      tasks: [],
      loading: false,
      addGoal,
      removeGoal: vi.fn(),
      addTask: vi.fn(),
      toggleTask: vi.fn(),
      removeTask: vi.fn(),
    })
  })

  it('typing a goal and clicking + Add goal calls addGoal with the typed text', async () => {
    render(
      <MemoryRouter initialEntries={['/competitions/upcoming/pc1']}>
        <Routes>
          <Route path="/competitions/upcoming/:id" element={<TournamentPrep />} />
        </Routes>
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(
      screen.getByPlaceholderText(/land the kizami-gyaku combo/i),
      'Hit 8.5+ kata score'
    )
    await user.click(screen.getByRole('button', { name: /add goal/i }))

    await waitFor(() =>
      expect(addGoal).toHaveBeenCalledWith('Hit 8.5+ kata score', undefined)
    )
  })
})
