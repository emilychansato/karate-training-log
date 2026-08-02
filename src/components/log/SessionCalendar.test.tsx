import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionCalendar } from './SessionCalendar'
import type { TrainingSession } from '../../hooks/useTrainingSessions'
import { MONTH_NAMES } from '../../lib/dateFormat'

function makeSession(overrides: Partial<TrainingSession>): TrainingSession {
  return {
    id: overrides.id ?? 's1',
    title: null,
    date: '2026-08-01',
    type: 'kumite',
    duration_min: 60,
    self_rating: null,
    notes: null,
    location: null,
    latitude: null,
    longitude: null,
    improved: [],
    struggled: [],
    created_at: '2026-08-01T00:00:00Z',
    ...overrides,
  }
}

describe('SessionCalendar', () => {
  it('renders the current month grid with weekday headers', () => {
    const now = new Date()
    render(<SessionCalendar sessions={[]} />)
    expect(
      screen.getByText(`${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`)
    ).toBeInTheDocument()
  })

  it('shows a colored dot for a day with a logged session', () => {
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const { container } = render(
      <SessionCalendar sessions={[makeSession({ id: 's1', date: todayIso, type: 'kata' })]} />
    )
    expect(container.querySelector('.bg-ao')).toBeInTheDocument()
  })
})
