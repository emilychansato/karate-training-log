import aiLion from '../../assets/mascot/ai-lion.png'

/** Fixed to the page's bottom-left corner (not the assistant card) so it
 * stays put while scrolling. The speech bubble carries the "this is an
 * AI" signaling on its own - no separate badge chip. Scoped to the
 * Resources page since that's the only place the assistant lives. */
export function AiAssistantMascot() {
  return (
    <div className="pointer-events-none fixed bottom-24 left-4 z-30 flex flex-col items-start gap-2 md:bottom-6">
      <div className="card-elevated max-w-[190px] border border-border bg-card px-3 py-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="size-1.5 flex-shrink-0 rounded-full bg-foreground" />
          <span className="label-caps text-muted-foreground">AI Assistant</span>
        </div>
        <p className="text-xs font-medium leading-snug">Ask a question</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          Answers come directly from the resources on this page.
        </p>
      </div>
      <div className="relative size-[84px] flex-shrink-0 [filter:drop-shadow(0_10px_18px_rgba(0,0,0,0.4))]">
        <span className="absolute -inset-1 rounded-full border-2 border-border" />
        <img
          src={aiLion}
          alt=""
          className="size-full rounded-full border-[3px] border-background object-cover"
        />
      </div>
    </div>
  )
}
