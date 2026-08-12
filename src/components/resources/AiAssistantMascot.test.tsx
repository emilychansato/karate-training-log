import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AiAssistantMascot } from './AiAssistantMascot'

describe('AiAssistantMascot', () => {
  it('starts closed, showing only the teaser bubble and the lion trigger', () => {
    render(<AiAssistantMascot history={[]} asking={false} ask={vi.fn()} />)
    expect(screen.getByText('Ask a question')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/how many points/i)).not.toBeInTheDocument()
  })

  it('clicking the lion opens the chat panel with an input', () => {
    render(<AiAssistantMascot history={[]} asking={false} ask={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /open ai assistant chat/i }))
    expect(screen.getByPlaceholderText(/how many points/i)).toBeInTheDocument()
  })

  it('submitting a question calls ask with the trimmed text', async () => {
    const ask = vi.fn().mockResolvedValue({ error: null })
    render(<AiAssistantMascot history={[]} asking={false} ask={ask} />)
    fireEvent.click(screen.getByRole('button', { name: /open ai assistant chat/i }))

    fireEvent.change(screen.getByPlaceholderText(/how many points/i), {
      target: { value: '  what is a yuko?  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /ask/i }))

    expect(ask).toHaveBeenCalledWith('what is a yuko?')
  })

  it('shows the latest answer from history once available', () => {
    render(
      <AiAssistantMascot
        history={[{ question: 'What is a yuko?', answer: 'One point.', sources: [] }]}
        asking={false}
        ask={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /open ai assistant chat/i }))
    expect(screen.getByText('What is a yuko?')).toBeInTheDocument()
    expect(screen.getByText('One point.')).toBeInTheDocument()
  })

  it('closing the panel returns to the teaser bubble', () => {
    render(<AiAssistantMascot history={[]} asking={false} ask={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /open ai assistant chat/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByText('Ask a question')).toBeInTheDocument()
  })
})
