import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionForm } from './SessionForm'
import { todayIso } from '@/lib/dateFormat'

describe('SessionForm', () => {
  it('defaults the date to today and submits with a nickname, type, duration, and checked improved/struggled tags', async () => {
    const createSession = vi.fn().mockResolvedValue({ error: null })
    const onSuccess = vi.fn()
    render(<SessionForm createSession={createSession} onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/nickname/i), 'Brutal sparring night')
    await user.click(screen.getByRole('radio', { name: 'KUMITE' }))
    await user.type(screen.getByLabelText(/duration/i), '60')
    await user.click(screen.getByRole('checkbox', { name: 'Timing' }))
    await user.click(screen.getByRole('checkbox', { name: 'Footwork' }))
    await user.click(screen.getByRole('button', { name: /save session/i }))

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Brutal sparring night',
          date: todayIso(),
          type: 'kumite',
          duration_min: 60,
          improved: ['Timing'],
          struggled: ['Footwork'],
        })
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('lets a different date be picked from the calendar popup', async () => {
    const createSession = vi.fn().mockResolvedValue({ error: null })
    render(<SessionForm createSession={createSession} onSuccess={vi.fn()} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Date' }))
    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('radio', { name: 'KATA' }))
    await user.type(screen.getByLabelText(/duration/i), '45')
    await user.click(screen.getByRole('button', { name: /save session/i }))

    const now = new Date()
    const expectedIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ date: expectedIso }))
    )
  })

  it('shows the server error and does not call onSuccess when createSession fails', async () => {
    const createSession = vi.fn().mockResolvedValue({ error: 'null value in column "sport_id"' })
    const onSuccess = vi.fn()
    render(<SessionForm createSession={createSession} onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('radio', { name: 'KUMITE' }))
    await user.type(screen.getByLabelText(/duration/i), '60')
    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(await screen.findByText(/null value in column "sport_id"/i)).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('shows a validation error when duration is missing', async () => {
    render(<SessionForm createSession={vi.fn()} onSuccess={vi.fn()} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /save session/i }))

    expect(await screen.findByText(/duration is required/i)).toBeInTheDocument()
  })
})
