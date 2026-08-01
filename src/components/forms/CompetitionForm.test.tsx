import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompetitionForm } from './CompetitionForm'
import { useCompetitions } from '../../hooks/useCompetitions'

vi.mock('../../hooks/useCompetitions')

describe('CompetitionForm', () => {
  it('creates a competition and calls onSuccess with the new id', async () => {
    const createCompetition = vi.fn().mockResolvedValue({ error: null, id: 'new-comp-id' })
    vi.mocked(useCompetitions).mockReturnValue({
      competitions: [],
      loading: false,
      createCompetition,
      deleteCompetition: vi.fn(),
    })
    const onSuccess = vi.fn()
    render(<CompetitionForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/event/i), 'BC Open')
    await user.type(screen.getByLabelText(/^date/i), '2026-06-01')
    await user.click(screen.getByRole('radio', { name: 'KUMITE' }))
    await user.click(screen.getByRole('button', { name: /save competition/i }))

    await waitFor(() =>
      expect(createCompetition).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'BC Open', date: '2026-06-01', discipline: 'kumite' })
      )
    )
    expect(onSuccess).toHaveBeenCalledWith('new-comp-id')
  })

  it('shows a validation error when the event is missing', async () => {
    vi.mocked(useCompetitions).mockReturnValue({
      competitions: [],
      loading: false,
      createCompetition: vi.fn(),
      deleteCompetition: vi.fn(),
    })
    render(<CompetitionForm onSuccess={vi.fn()} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^date/i), '2026-06-01')
    await user.click(screen.getByRole('radio', { name: 'KUMITE' }))
    await user.click(screen.getByRole('button', { name: /save competition/i }))

    expect(await screen.findByText(/event is required/i)).toBeInTheDocument()
  })
})
