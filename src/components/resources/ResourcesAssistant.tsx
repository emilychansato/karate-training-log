import { useState } from 'react'
import { useResourcesAssistant } from '../../hooks/useResourcesAssistant'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'

export function ResourcesAssistant() {
  const { history, asking, ask } = useResourcesAssistant()
  const [question, setQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || asking) return
    setError(null)
    const { error } = await ask(question.trim())
    if (error) setError(error)
    else setQuestion('')
  }

  return (
    <div className="card-elevated flex flex-col gap-4 border border-border bg-card p-5">
      <div>
        <p className="font-heading text-lg">Ask about the rules</p>
        <p className="text-sm text-muted-foreground">
          Answers come only from the documents on this page — not general knowledge.
        </p>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-4">
          {history.map((entry, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="label-caps text-muted-foreground">{entry.question}</p>
              <p className="text-sm">{entry.answer}</p>
              {entry.sources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="label-caps flex items-center gap-1 border border-border bg-muted px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="file" className="size-3" />
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="border-l-2 border-l-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How many points is a yuko?"
          disabled={asking}
        />
        <Button type="submit" disabled={asking} className="glow-primary flex-shrink-0">
          {asking ? 'Asking…' : 'Ask'}
        </Button>
      </form>
    </div>
  )
}
