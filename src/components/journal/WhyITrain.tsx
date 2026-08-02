import { useState } from 'react'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'

export function WhyITrain({
  whyITrain,
  saveWhyITrain,
}: {
  whyITrain: string | null
  saveWhyITrain: (text: string) => Promise<{ error: string | null }>
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(whyITrain ?? '')

  async function handleSave() {
    const { error } = await saveWhyITrain(text.trim())
    if (!error) setEditing(false)
  }

  return (
    <div className="card-elevated flex flex-col gap-3 border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon name="sparkles" className="size-4 text-aka" />
        <p className="font-heading text-lg">Why I do it</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Come back to this on the days it's hard to find motivation.
      </p>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Why do you train so hard? What does this sport give you?"
            className="min-h-24 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <Button size="sm" className="glow-primary" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : whyITrain ? (
        <div className="flex flex-col gap-2">
          <p className="whitespace-pre-wrap text-sm">{whyITrain}</p>
          <Button
            size="sm"
            variant="ghost"
            className="w-fit"
            onClick={() => {
              setText(whyITrain)
              setEditing(true)
            }}
          >
            Edit
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="w-fit" onClick={() => setEditing(true)}>
          + Write it down
        </Button>
      )}
    </div>
  )
}
