import { usePhotos } from '../../hooks/usePhotos'

/** Small photo preview shown on a competition's list card when it has at
 * least one attached photo - nothing rendered otherwise. */
export function CompetitionThumbnail({ competitionId }: { competitionId: string }) {
  const { photos, loading } = usePhotos('competition', competitionId)

  if (loading || photos.length === 0) return null

  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto">
      {photos.slice(0, 4).map((photo) => (
        <img
          key={photo.id}
          src={photo.url}
          alt=""
          className="size-14 flex-shrink-0 border border-border object-cover"
        />
      ))}
      {photos.length > 4 && (
        <div className="flex size-14 flex-shrink-0 items-center justify-center border border-border bg-muted text-xs text-muted-foreground">
          +{photos.length - 4}
        </div>
      )}
    </div>
  )
}
