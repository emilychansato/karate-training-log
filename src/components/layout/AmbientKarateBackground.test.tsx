import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AmbientKarateBackground } from './AmbientKarateBackground'
import { useReducedMotion } from '../../hooks/useReducedMotion'

vi.mock('../../hooks/useReducedMotion')

describe('AmbientKarateBackground', () => {
  it('renders as a non-interactive, screen-reader-hidden decorative layer', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false)
    const { container } = render(<AmbientKarateBackground />)
    const root = container.firstElementChild
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root).toHaveClass('pointer-events-none')
  })

  it('renders without crashing when reduced motion is preferred', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true)
    const { container } = render(<AmbientKarateBackground />)
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })
})
