import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhyITrain } from './WhyITrain'

describe('WhyITrain', () => {
  it('shows a write prompt when nothing is saved yet', () => {
    render(<WhyITrain whyITrain={null} saveWhyITrain={vi.fn()} />)
    expect(screen.getByRole('button', { name: /write it down/i })).toBeInTheDocument()
  })

  it('saves edited text', async () => {
    const saveWhyITrain = vi.fn().mockResolvedValue({ error: null })
    render(<WhyITrain whyITrain="Old reason" saveWhyITrain={saveWhyITrain} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /edit/i }))
    const textarea = screen.getByPlaceholderText(/why do you train/i)
    await user.clear(textarea)
    await user.type(textarea, 'New reason')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(saveWhyITrain).toHaveBeenCalledWith('New reason')
  })
})
