import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AboutCard } from './AboutCard'

describe('AboutCard', () => {
  it('shows a prompt to add info when nothing is saved yet', () => {
    render(
      <AboutCard
        profileInfo={{ beltRank: null, clubName: null, primaryDiscipline: null }}
        saveProfileInfo={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /add belt rank/i })).toBeInTheDocument()
  })

  it('saves belt rank, club, and discipline', async () => {
    const saveProfileInfo = vi.fn().mockResolvedValue({ error: null })
    render(
      <AboutCard
        profileInfo={{ beltRank: null, clubName: null, primaryDiscipline: null }}
        saveProfileInfo={saveProfileInfo}
      />
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /add belt rank/i }))
    await user.type(screen.getByLabelText(/belt rank/i), 'Brown')
    await user.type(screen.getByLabelText(/dojo/i), 'North Shore Karate')
    await user.click(screen.getByRole('radio', { name: 'KATA' }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(saveProfileInfo).toHaveBeenCalledWith({
      beltRank: 'Brown',
      clubName: 'North Shore Karate',
      primaryDiscipline: 'kata',
    })
  })

  it('shows saved info with an edit option', () => {
    render(
      <AboutCard
        profileInfo={{ beltRank: 'Green', clubName: 'North Shore Karate', primaryDiscipline: 'kumite' }}
        saveProfileInfo={vi.fn()}
      />
    )
    expect(screen.getByText('Green')).toBeInTheDocument()
    expect(screen.getByText('North Shore Karate')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })
})
