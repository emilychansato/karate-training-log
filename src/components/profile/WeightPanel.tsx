import { useState } from 'react'
import { useWeightLogs } from '../../hooks/useWeightLogs'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { DatePicker } from '../ui/date-picker'
import { todayIso } from '../../lib/dateFormat'
import { KUMITE_DIVISIONS } from '../../lib/competitionCategories'

export function WeightPanel() {
  const { logs, loading, addLog, removeLog } = useWeightLogs()
  const [date, setDate] = useState(todayIso())
  const [weight, setWeight] = useState('')

  const latest = logs[0]
  const nearbyDivisions = latest
    ? KUMITE_DIVISIONS.filter((d) => {
        const match = d.match(/([+-])(\d+) kg/)
        if (!match) return false
        const cutoff = Number(match[2])
        return Math.abs(cutoff - latest.weight_kg) <= 5
      })
    : []

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const kg = Number(weight)
    if (!date || !kg) return
    const { error } = await addLog(date, kg)
    if (!error) setWeight('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="target" />
            Weight log
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {latest && (
            <div>
              <p className="label-caps text-muted-foreground">Latest</p>
              <p className="font-mono tabular-mono text-2xl font-bold">{latest.weight_kg} kg</p>
              <p className="text-xs text-muted-foreground">{latest.date}</p>
              {nearbyDivisions.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Close to: {nearbyDivisions.join(', ')}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <DatePicker value={date} onChange={setDate} />
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Button type="submit" className="glow-primary flex-shrink-0">
                Log
              </Button>
            </div>
          </form>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weight logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{l.date}</span>
                  <span className="font-mono tabular-mono">{l.weight_kg} kg</span>
                  <Button variant="ghost" size="sm" onClick={() => removeLog(l.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
