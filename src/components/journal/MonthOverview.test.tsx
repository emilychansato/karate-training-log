import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthOverview } from './MonthOverview'

describe('MonthOverview', () => {
  it('shows the average mood for entries within the currently viewed month', () => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    render(
      <MonthOverview
        entries={[
          { id: 'j1', date: `${thisMonth}-01`, mood: 4, emotions: [], notes: null, created_at: '' },
          { id: 'j2', date: `${thisMonth}-02`, mood: 2, emotions: [], notes: null, created_at: '' },
        ]}
      />
    )
    expect(screen.getByText('3 😐')).toBeInTheDocument()
  })

  it('shows a dash for average mood when there are no entries this month', () => {
    render(<MonthOverview entries={[]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
