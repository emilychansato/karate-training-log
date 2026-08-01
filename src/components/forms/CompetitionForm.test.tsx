import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompetitionForm } from './CompetitionForm'
import { useCompetitionResults } from '../../hooks/useCompetitionResults'

vi.mock('../../hooks/useCompetitionResults')

describe('CompetitionForm', () => {
  it('shows kata score fields when discipline is kata, and kumite fields when kumite', async () => {
    vi.mocked(useCompetitionResults).mockReturnValue({
      results: [],
      loading: false,
      error: null,
      createResult: vi.fn().mockResolvedValue({ error: null }),
      deleteResult: vi.fn(),
    })
    render(<CompetitionForm onSuccess={vi.fn()} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('radio', { name: 'KATA' }))
    expect(screen.getByLabelText(/technical score/i)).toBeInTheDocument()
    expect(screen.queryByText('My Yuko')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'KUMITE' }))
    expect(screen.getByText('My Yuko')).toBeInTheDocument()
    expect(screen.queryByLabelText(/technical score/i)).not.toBeInTheDocument()
  })

  it('submits kumite results with the full point breakdown', async () => {
    const createResult = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useCompetitionResults).mockReturnValue({
      results: [],
      loading: false,
      error: null,
      createResult,
      deleteResult: vi.fn(),
    })
    const onSuccess = vi.fn()
    render(<CompetitionForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/event/i), 'BC Open')
    await user.type(screen.getByLabelText(/^date/i), '2026-06-01')
    await user.click(screen.getByRole('radio', { name: 'KUMITE' }))
    await user.click(screen.getByRole('button', { name: 'Increase My Yuko' }))
    await user.click(screen.getByRole('button', { name: 'Increase My Waza-ari' }))
    await user.click(screen.getByRole('button', { name: /save result/i }))

    await waitFor(() =>
      expect(createResult).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'BC Open', discipline: 'kumite', my_yuko: 1, my_waza_ari: 1 })
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })
})
