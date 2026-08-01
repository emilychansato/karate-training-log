import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function Placeholder() {
  return <h1>Karate Training Log</h1>
}

describe('test infrastructure', () => {
  it('renders and queries the DOM', () => {
    render(<Placeholder />)
    expect(screen.getByText('Karate Training Log')).toBeInTheDocument()
  })
})
