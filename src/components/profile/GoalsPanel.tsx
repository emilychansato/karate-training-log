import { useState } from 'react'
import { useGoals, type Goal } from '../../hooks/useGoals'
import { useTrainingSessions } from '../../hooks/useTrainingSessions'
import { useWeightLogs } from '../../hooks/useWeightLogs'
import { useCompetitions } from '../../hooks/useCompetitions'
import { useRankHistory } from '../../hooks/useRankHistory'
import {
  computeTrainingFrequencyProgress,
  computeWeightProgress,
  computeCompetitionPlacementProgress,
  computeRankProgress,
  type GoalProgress,
} from '../../lib/goalProgress'
import { GoalForm } from '../forms/GoalForm'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { DatePicker } from '../ui/date-picker'
import { todayIso } from '../../lib/dateFormat'

function ProgressBar({ fraction }: { fraction: number }) {
  return (
    <div className="h-1.5 w-full bg-muted">
      <div
        className="h-full bg-aka transition-[width] duration-300"
        style={{ width: `${Math.round(fraction * 100)}%` }}
      />
    </div>
  )
}

export function GoalsPanel() {
  const { goals, loading, createGoal, markAchieved, abandonGoal, deleteGoal } = useGoals()
  const { sessions } = useTrainingSessions()
  const { logs, loading: weightLoading, addLog, removeLog } = useWeightLogs()
  const { competitions } = useCompetitions()
  const { history } = useRankHistory()
  const [showForm, setShowForm] = useState(false)
  const [showWeight, setShowWeight] = useState(false)
  const [date, setDate] = useState(todayIso())
  const [weight, setWeight] = useState('')

  const currentRank = history[0] ? `${history[0].rank} (${history[0].style})` : null

  function progressFor(goal: Goal): GoalProgress {
    switch (goal.goal_type) {
      case 'training_frequency':
        return computeTrainingFrequencyProgress(goal, sessions)
      case 'weight':
        return computeWeightProgress(goal, logs)
      case 'competition_placement':
        return computeCompetitionPlacementProgress(goal, competitions)
      case 'rank':
        return computeRankProgress(goal, currentRank)
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'active')

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    const kg = Number(weight)
    if (!date || !kg) return
    const { error } = await addLog(date, kg)
    if (!error) setWeight('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg">Goals</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="label-caps text-muted-foreground hover:text-foreground"
        >
          {showForm ? 'Cancel' : '+ Add goal'}
        </button>
      </div>

      {showForm && (
        <GoalForm
          competitions={competitions}
          createGoal={createGoal}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : activeGoals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active goals yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeGoals.map((goal) => {
            const progress = progressFor(goal)
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-heading text-base">
                    <span>{goal.title}</span>
                    {goal.target_date && (
                      <span className="label-caps text-muted-foreground">
                        by {goal.target_date}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <ProgressBar fraction={progress.fraction} />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{progress.label}</p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => markAchieved(goal.id)}>
                        Mark done
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => abandonGoal(goal.id)}>
                        Abandon
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Icon name="close" className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!weightLoading && logs.length === 0 && !showWeight ? (
        <button
          onClick={() => setShowWeight(true)}
          className="label-caps self-start text-muted-foreground hover:text-foreground"
        >
          + Log weight
        </button>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Icon name="target" />
            Weight log
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {logs[0] && (
            <div>
              <p className="label-caps text-muted-foreground">Latest</p>
              <p className="font-mono tabular-mono text-2xl font-bold">{logs[0].weight_kg} kg</p>
              <p className="text-xs text-muted-foreground">{logs[0].date}</p>
            </div>
          )}

          <form onSubmit={handleAddWeight} className="flex flex-col gap-3">
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

          {weightLoading ? (
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
      )}
    </div>
  )
}
