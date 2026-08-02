import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Resources } from './Resources'
import { RESOURCE_GROUPS } from '../lib/resources'

describe('Resources', () => {
  it('renders every group heading and every resource as an external link', () => {
    render(<Resources />)

    for (const group of RESOURCE_GROUPS) {
      expect(screen.getByText(group.title)).toBeInTheDocument()
      for (const resource of group.resources) {
        const link = screen.getByRole('link', { name: resource.title })
        expect(link).toHaveAttribute('href', resource.url)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      }
    }
  })
})
