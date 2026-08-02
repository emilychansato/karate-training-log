import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { useFeedback } from '../../hooks/useFeedback'
import { Icon } from '../ui/icon'
import { Button } from '../ui/button'

export function FeedbackButton() {
  const { submitFeedback } = useFeedback()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    const { error } = await submitFeedback(message.trim())
    setSubmitting(false)
    if (!error) {
      setSent(true)
      setMessage('')
    }
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSent(false)
      }}
    >
      <Popover.Trigger
        aria-label="Feedback"
        className="flex size-9 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <Icon name="feedback" className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className="z-50">
          <Popover.Popup className="card-elevated w-72 border border-border bg-card p-4">
            {sent ? (
              <p className="text-sm">Thanks — got it. We read every one of these.</p>
            ) : (
              <>
                <p className="font-heading text-base">Feedback</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This site is still improving. Bugs, ideas, features you'd like to see — let us
                  know.
                </p>
                <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What's on your mind?"
                    className="min-h-20 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <Button type="submit" size="sm" disabled={submitting} className="glow-primary">
                    {submitting ? 'Sending…' : 'Send'}
                  </Button>
                </form>
              </>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
