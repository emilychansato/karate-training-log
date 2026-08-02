import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RankPanel } from './RankPanel'
import { useRankHistory } from '../../hooks/useRankHistory'

vi.mock('../../hooks/useRankHistory')

describe('RankPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the most recent rank as current', () => {
    vi.mocked(useRankHistory).mockReturnValue({
      history: [
        { id: 'r1', style: 'Shotokan', rank: 'Brown Belt (2nd Kyu)', achieved_date: '2026-08-01', notes: null, created_at: '' },
        { id: 'r2', style: 'Shotokan', rank: 'Green Belt (5th Kyu)', achieved_date: '2026-01-01', notes: null, created_at: '' },
      ],
      loading: false,
      addRank: vi.fn(),
      removeRank: vi.fn(),
    })
    render(<RankPanel />)
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getAllByText('Brown Belt (2nd Kyu)').length).toBeGreaterThan(0)
  })

  it('adds a new rank to the history', async () => {
    const addRank = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useRankHistory).mockReturnValue({
      history: [],
      loading: false,
      addRank,
      removeRank: vi.fn(),
    })
    render(<RankPanel />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Shotokan' }))
    await user.type(screen.getByPlaceholderText(/rank \(e\.g\./i), 'Green Belt (5th Kyu)')
    await user.click(screen.getByRole('button', { name: /add to history/i }))

    expect(addRank).toHaveBeenCalledWith('Shotokan', 'Green Belt (5th Kyu)', expect.any(String))
  })
})
