import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { TechniqueDetail } from './TechniqueDetail'
import { useTechniques } from '../hooks/useTechniques'
import { useUserTechniques } from '../hooks/useUserTechniques'

vi.mock('../hooks/useTechniques')
vi.mock('../hooks/useUserTechniques')

describe('TechniqueDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTechniques).mockReturnValue({
      techniques: [{ id: 't1', name: 'Mae geri', category: 'kumite_combo' }],
      loading: false,
    })
    vi.mocked(useUserTechniques).mockReturnValue({
      bookmarks: [],
      loading: false,
      addBookmark: vi.fn().mockResolvedValue({ error: null }),
      removeBookmark: vi.fn(),
      updateNickname: vi.fn(),
    })
  })

  it('the back link points at a route that actually exists (/profile), not the removed /techniques catalog page', async () => {
    render(
      <MemoryRouter initialEntries={['/techniques/t1']}>
        <Routes>
          <Route path="/techniques/:id" element={<TechniqueDetail />} />
          <Route path="/profile" element={<p>Profile page</p>} />
        </Routes>
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: /profile/i }))
    expect(screen.getByText('Profile page')).toBeInTheDocument()
  })

  it('after bookmarking, the back link still navigates correctly instead of going blank', async () => {
    vi.mocked(useUserTechniques).mockReturnValue({
      bookmarks: [
        { id: 'b1', technique_id: 't1', technique_name: 'Mae geri', nickname: null, category: 'kumite_combo' },
      ],
      loading: false,
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      updateNickname: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/techniques/t1']}>
        <Routes>
          <Route path="/techniques/:id" element={<TechniqueDetail />} />
          <Route path="/profile" element={<p>Profile page</p>} />
        </Routes>
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.click(screen.getAllByRole('link', { name: /profile/i })[0])
    expect(screen.getByText('Profile page')).toBeInTheDocument()
  })
})
