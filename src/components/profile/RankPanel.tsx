import { useState } from 'react'
import { useRankHistory } from '../../hooks/useRankHistory'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { DatePicker } from '../ui/date-picker'
import { todayIso } from '../../lib/dateFormat'

// Matches the styles Karate Canada publishes Dan grading guidelines for
// (see the Resources page) - not an exhaustive list, but the ones with a
// real documented grading standard behind them.
const STYLES = ['Shotokan', 'Goju-Ryu', 'Wado-Ryu', 'Shito-Ryu', 'Chito-Ryu', 'Other']

export function RankPanel() {
  const { history, loading, addRank, removeRank } = useRankHistory()
  const [style, setStyle] = useState('')
  const [rank, setRank] = useState('')
  const [date, setDate] = useState(todayIso())

  const current = history[0]

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!style || !rank.trim() || !date) return
    const { error } = await addRank(style, rank.trim(), date)
    if (!error) setRank('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="award" />
            Rank
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {current && (
            <div>
              <p className="label-caps text-muted-foreground">Current</p>
              <p className="font-heading text-2xl">{current.rank}</p>
              <p className="text-xs text-muted-foreground">
                {current.style} · achieved {current.achieved_date}
              </p>
            </div>
          )}

          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <Select value={style} onChange={setStyle} options={STYLES} placeholder="Style…" />
            <Input
              placeholder="Rank (e.g. Green Belt, 5th Kyu, Shodan)"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
            <DatePicker value={date} onChange={setDate} />
            <Button type="submit" className="glow-primary">
              Add to history
            </Button>
          </form>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rank history logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {history.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{r.rank}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{r.style}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.achieved_date}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeRank(r.id)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
