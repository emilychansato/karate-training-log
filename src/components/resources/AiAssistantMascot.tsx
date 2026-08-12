import { useState } from 'react'
import type { AssistantAnswer } from '../../hooks/useResourcesAssistant'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import aiLion from '../../assets/mascot/ai-lion.png'

/** Fixed to the page's bottom-left corner (not the assistant card) so it
 * stays put while scrolling. Tapping the lion opens a real chat panel
 * wired to the same ask()/history as the inline "Ask about the rules"
 * card below - both share one conversation, not two separate ones.
 * Scoped to the Resources page since that's the only place the
 * assistant lives. */
export function AiAssistantMascot({
  history,
  asking,
  ask,
}: {
  history: AssistantAnswer[]
  asking: boolean
  ask: (question: string) => Promise<{ error: string | null }>
}) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const latest = history[history.length - 1]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || asking) return
    setError(null)
    const { error } = await ask(question.trim())
    if (error) setError(error)
    else setQuestion('')
  }

  return (
    <div className="fixed bottom-24 left-4 z-30 flex flex-col items-start gap-2 md:bottom-6">
      {open && (
        <div className="card-elevated flex w-[calc(100vw-2rem)] max-w-xs flex-col gap-3 border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 flex-shrink-0 rounded-full bg-foreground" />
              <span className="label-caps text-muted-foreground">AI Assistant</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>

          {latest ? (
            <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
              <p className="label-caps text-muted-foreground">{latest.question}</p>
              <p className="text-sm">{latest.answer}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ask a question. Answers come directly from the resources on this page.
            </p>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How many points is a yuko?"
              disabled={asking}
              autoFocus
            />
            <Button type="submit" size="sm" disabled={asking} className="glow-primary flex-shrink-0">
              {asking ? '…' : 'Ask'}
            </Button>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="card-elevated max-w-[190px] border border-border bg-card px-3 py-2.5 text-left"
        >
          <div className="mb-1 flex items-center gap-1.5">
            <span className="size-1.5 flex-shrink-0 rounded-full bg-foreground" />
            <span className="label-caps text-muted-foreground">AI Assistant</span>
          </div>
          <p className="text-xs font-medium leading-snug">Ask a question</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Answers come directly from the resources on this page.
          </p>
        </button>
      )}

      <button
        type="button"
        aria-label={open ? 'Close AI assistant chat' : 'Open AI assistant chat'}
        onClick={() => setOpen((v) => !v)}
        className="relative size-[84px] flex-shrink-0 [filter:drop-shadow(0_10px_18px_rgba(0,0,0,0.4))]"
      >
        <span className="absolute -inset-1 rounded-full border-2 border-border" />
        <img
          src={aiLion}
          alt=""
          className="size-full rounded-full border-[3px] border-background object-cover"
        />
      </button>
    </div>
  )
}
