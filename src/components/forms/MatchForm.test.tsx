import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MatchForm } from './MatchForm'
import { useTechniques } from '../../hooks/useTechniques'

vi.mock('../../hooks/useTechniques')

describe('MatchForm', () => {
  beforeEach(() => {
    vi.mocked(useTechniques).mockReturnValue({
      techniques: [
        { id: 'kt1', name: 'Heian Shodan', category: 'kata' },
        { id: 'kc1', name: 'Kizami tsuki → Gyaku tsuki', category: 'kumite_combo' },
      ],
      loading: false,
    })
  })

  it('shows kumite stepper fields when discipline is kumite, and kata fields when kata', () => {
    const { rerender } = render(
      <MatchForm discipline="kumite" createMatch={vi.fn()} onSuccess={vi.fn()} />
    )
    expect(screen.getByText('My Yuko')).toBeInTheDocument()
    expect(screen.queryByLabelText(/technical score/i)).not.toBeInTheDocument()

    rerender(<MatchForm discipline="kata" createMatch={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByLabelText(/technical score/i)).toBeInTheDocument()
    expect(screen.queryByText('My Yuko')).not.toBeInTheDocument()
  })

  it('only shows favorite-technique chips for kumite matches, never kata', () => {
    const { rerender } = render(
      <MatchForm discipline="kumite" createMatch={vi.fn()} onSuccess={vi.fn()} />
    )
    expect(screen.getByText('Kizami tsuki → Gyaku tsuki')).toBeInTheDocument()
    expect(screen.queryByText('Heian Shodan')).not.toBeInTheDocument()

    rerender(<MatchForm discipline="kata" createMatch={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByText('Heian Shodan')).not.toBeInTheDocument()
    expect(screen.queryByText('Kizami tsuki → Gyaku tsuki')).not.toBeInTheDocument()
    expect(screen.queryByText(/favorite techniques/i)).not.toBeInTheDocument()
  })

  it('submits a kumite match with the opponent name, score breakdown, and selected favorite techniques', async () => {
    const createMatch = vi.fn().mockResolvedValue({ error: null })
    const onSuccess = vi.fn()
    render(<MatchForm discipline="kumite" createMatch={createMatch} onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/opponent name/i), 'Jamie Lee')
    await user.click(screen.getByRole('button', { name: 'Increase My Yuko' }))
    await user.click(screen.getByRole('checkbox', { name: 'Kizami tsuki → Gyaku tsuki' }))
    await user.click(screen.getByRole('button', { name: /save match/i }))

    await waitFor(() =>
      expect(createMatch).toHaveBeenCalledWith(
        expect.objectContaining({ opponent_name: 'Jamie Lee', my_yuko: 1 }),
        ['kc1']
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })
})
