import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeightPanel } from './WeightPanel'
import { useWeightLogs } from '../../hooks/useWeightLogs'

vi.mock('../../hooks/useWeightLogs')

describe('WeightPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows nearby WKF weight divisions for the latest logged weight', () => {
    vi.mocked(useWeightLogs).mockReturnValue({
      logs: [{ id: 'w1', date: '2026-08-03', weight_kg: 55, created_at: '' }],
      loading: false,
      addLog: vi.fn(),
      removeLog: vi.fn(),
    })
    render(<WeightPanel />)
    expect(screen.getAllByText('55 kg').length).toBeGreaterThan(0)
    expect(screen.getByText(/close to:/i)).toBeInTheDocument()
  })

  it('logs a new weight entry', async () => {
    const addLog = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useWeightLogs).mockReturnValue({
      logs: [],
      loading: false,
      addLog,
      removeLog: vi.fn(),
    })
    render(<WeightPanel />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText(/weight \(kg\)/i), '60.5')
    await user.click(screen.getByRole('button', { name: /^log$/i }))

    expect(addLog).toHaveBeenCalledWith(expect.any(String), 60.5)
  })
})
