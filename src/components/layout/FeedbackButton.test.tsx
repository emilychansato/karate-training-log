import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackButton } from './FeedbackButton'
import { useFeedback } from '../../hooks/useFeedback'

vi.mock('../../hooks/useFeedback')

describe('FeedbackButton', () => {
  it('opens the popup, submits a message, and shows a thank-you', async () => {
    const submitFeedback = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(useFeedback).mockReturnValue({ submitFeedback })

    render(<FeedbackButton />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Feedback' }))
    await user.type(screen.getByPlaceholderText(/what's on your mind/i), 'Add a stopwatch for drills')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    expect(submitFeedback).toHaveBeenCalledWith('Add a stopwatch for drills')
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument()
  })
})
