import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePhotos } from './usePhotos'
import { supabase } from '../lib/supabaseClient'

const { mockPhotoRow } = vi.hoisted(() => ({
  mockPhotoRow: {
    id: 'p1',
    entry_type: 'training_session',
    entry_id: 'session-1',
    storage_path: 'user-1/training_session/session-1/abc.jpg',
    created_at: '2026-08-01T10:00:00Z',
  },
}))

vi.mock('../lib/supabaseClient', () => {
  const order = vi.fn().mockResolvedValue({ data: [mockPhotoRow], error: null })
  const eqEntryId = vi.fn(() => ({ order }))
  const eqEntryType = vi.fn(() => ({ eq: eqEntryId }))
  const select = vi.fn(() => ({ eq: eqEntryType }))
  const insert = vi.fn().mockResolvedValue({ error: null })
  const eqDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteFn = vi.fn(() => ({ eq: eqDelete }))

  const upload = vi.fn().mockResolvedValue({ error: null })
  const remove = vi.fn().mockResolvedValue({ error: null })
  const createSignedUrl = vi
    .fn()
    .mockResolvedValue({ data: { signedUrl: 'https://signed.example/abc.jpg' } })

  return {
    supabase: {
      from: vi.fn(() => ({ select, insert, delete: deleteFn })),
      storage: {
        from: vi.fn(() => ({ upload, remove, createSignedUrl })),
      },
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: 'user-1' } } }),
      },
    },
  }
})

describe('usePhotos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads photos for the given entry with signed URLs', async () => {
    const { result } = renderHook(() => usePhotos('training_session', 'session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.photos).toEqual([
      { ...mockPhotoRow, url: 'https://signed.example/abc.jpg' },
    ])
    expect(supabase.from).toHaveBeenCalledWith('photos')
  })

  it('does not query when entryId is null', async () => {
    const { result } = renderHook(() => usePhotos('training_session', null))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.photos).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('uploadPhoto uploads to storage then inserts a photos row', async () => {
    const { result } = renderHook(() => usePhotos('training_session', 'session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const file = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' })
    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.uploadPhoto(file)
    })

    expect(response.error).toBeNull()
    expect(supabase.storage.from).toHaveBeenCalledWith('entry-photos')
    const insertCall = vi.mocked(supabase.from).mock.results.find((r) => r.value.insert)?.value
      .insert
    expect(insertCall).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        entry_type: 'training_session',
        entry_id: 'session-1',
      })
    )
  })

  it('deletePhoto removes the storage object and the photos row', async () => {
    const { result } = renderHook(() => usePhotos('training_session', 'session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let response: { error: string | null } = { error: 'unset' }
    await act(async () => {
      response = await result.current.deletePhoto({
        ...mockPhotoRow,
        url: 'https://signed.example/abc.jpg',
      } as never)
    })

    expect(response.error).toBeNull()
    const storageFrom = vi.mocked(supabase.storage.from).mock.results[0].value
    expect(storageFrom.remove).toHaveBeenCalledWith([mockPhotoRow.storage_path])
  })
})
