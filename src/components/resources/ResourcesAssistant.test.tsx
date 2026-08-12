import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResourcesAssistant } from './ResourcesAssistant'

describe('ResourcesAssistant', () => {
  it('submitting the form calls ask with the trimmed question', () => {
    const ask = vi.fn().mockResolvedValue({ error: null })
    render(<ResourcesAssistant history={[]} asking={false} ask={ask} />)

    fireEvent.change(screen.getByPlaceholderText(/how many points/i), {
      target: { value: '  what is a yuko?  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /ask/i }))

    expect(ask).toHaveBeenCalledWith('what is a yuko?')
  })

  it('renders the full conversation history passed in as props', () => {
    render(
      <ResourcesAssistant
        history={[{ question: 'What is a yuko?', answer: 'One point.', sources: [] }]}
        asking={false}
        ask={vi.fn()}
      />
    )
    expect(screen.getByText('What is a yuko?')).toBeInTheDocument()
    expect(screen.getByText('One point.')).toBeInTheDocument()
  })
})
