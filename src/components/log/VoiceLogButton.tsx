import { useEffect } from 'react'
import { useVoiceLog } from '../../hooks/useVoiceLog'
import type { NewTrainingSession } from '../../hooks/useTrainingSessions'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'

/** Speech-to-text (browser-native) -> a small edge function fills in real
 * session fields (type/duration/notes/tags). Nothing is auto-saved from
 * the transcript - onParsed only prefills the caller's form, the user
 * still reviews/edits and submits it themselves. */
export function VoiceLogButton({
  onParsed,
}: {
  onParsed: (fields: Partial<NewTrainingSession>) => void
}) {
  const { state, error, parsed, isSupported, start, reset } = useVoiceLog()

  useEffect(() => {
    if (parsed) {
      onParsed(parsed)
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed])

  if (!isSupported) return null

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={start}
        disabled={state === 'listening' || state === 'parsing'}
        className="w-full"
      >
        <Icon name="mic" className="size-4" />
        {state === 'listening'
          ? 'Listening…'
          : state === 'parsing'
            ? 'Making sense of that…'
            : 'Log by voice'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
