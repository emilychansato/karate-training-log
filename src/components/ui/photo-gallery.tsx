import { useRef, useState } from 'react'
import { usePhotos, type EntryType } from '@/hooks/usePhotos'
import { Button } from './button'
import { Icon } from './icon'

/** Optional photo attachments for a training session, competition, or
 * journal entry. Renders nothing but an "Add photo" button until an
 * entryId exists (a not-yet-saved entry has nowhere to attach a photo to). */
export function PhotoGallery({
  entryType,
  entryId,
}: {
  entryType: EntryType
  entryId: string | null
}) {
  const { photos, loading, uploadPhoto, deletePhoto } = usePhotos(entryType, entryId)
  const inputRef = useRef<HTMLInputElement>(null)
  // Uploading + the signed-URL round trip take a moment - show the picked
  // file immediately via a local object URL instead of an empty gap, so
  // it's obvious the upload is happening rather than looking like nothing
  // happened.
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  if (!entryId) return null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError(null)
    const objectUrl = URL.createObjectURL(file)
    setPendingPreview(objectUrl)

    const { error } = await uploadPhoto(file)
    URL.revokeObjectURL(objectUrl)
    setPendingPreview(null)
    if (error) setUploadError(error)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="label-caps text-muted-foreground">Photos (optional)</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
          <Icon name="add" className="size-4" />
          Add photo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

      {(pendingPreview || (!loading && photos.length > 0)) && (
        <div className="flex flex-wrap gap-2">
          {pendingPreview && (
            <div className="relative size-20 overflow-hidden border border-border opacity-60">
              <img src={pendingPreview} alt="" className="size-full object-cover" />
            </div>
          )}
          {photos.map((photo) => (
            <div key={photo.id} className="group relative size-20 overflow-hidden border border-border">
              <img src={photo.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Delete photo"
                onClick={() => deletePhoto(photo)}
                className="absolute top-0.5 right-0.5 bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Icon name="close" className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
