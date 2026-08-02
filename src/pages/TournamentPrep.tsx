import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlannedCompetitions } from '../hooks/usePlannedCompetitions'
import { usePrepPlan, type PrepPhase } from '../hooks/usePrepPlan'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Icon } from '../components/ui/icon'
import { ToggleChip } from '../components/ui/toggle-chip'

const PHASES: { value: PrepPhase; label: string; blurb: string }[] = [
  { value: 'technique_building', label: 'Technique building', blurb: 'Drill the fundamentals you need sharp' },
  { value: 'pressure_rounds', label: 'Pressure rounds', blurb: 'Add resistance and fatigue to those techniques' },
  { value: 'simulation_matches', label: 'Simulation matches', blurb: 'Full-speed reps that mirror competition' },
  { value: 'taper', label: 'Taper', blurb: 'Ease off, stay sharp, arrive fresh' },
]

function GoalForm({ addGoal }: { addGoal: (goal: string, discipline?: 'kata' | 'kumite') => Promise<{ error: string | null }> }) {
  const [text, setText] = useState('')
  const [discipline, setDiscipline] = useState<'kata' | 'kumite' | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)
    const { error } = await addGoal(text.trim(), discipline)
    if (error) setError(error)
    else setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && (
        <p className="border-l-2 border-l-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Input placeholder="e.g. Land the kizami-gyaku combo under pressure" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex items-center gap-2">
        <ToggleChip label="Kata" accent="ao" selected={discipline === 'kata'} onClick={() => setDiscipline((d) => (d === 'kata' ? undefined : 'kata'))} />
        <ToggleChip label="Kumite" accent="aka" selected={discipline === 'kumite'} onClick={() => setDiscipline((d) => (d === 'kumite' ? undefined : 'kumite'))} />
        <Button type="submit" size="sm" variant="outline" className="ml-auto">
          + Add goal
        </Button>
      </div>
    </form>
  )
}

function PhaseColumn({
  phase,
  label,
  blurb,
  tasks,
  addTask,
  toggleTask,
  removeTask,
}: {
  phase: PrepPhase
  label: string
  blurb: string
  tasks: { id: string; title: string; done: boolean }[]
  addTask: (phase: PrepPhase, title: string) => Promise<{ error: string | null }>
  toggleTask: (id: string, done: boolean) => Promise<{ error: string | null }>
  removeTask: (id: string) => Promise<{ error: string | null }>
}) {
  const [text, setText] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    const { error } = await addTask(phase, text.trim())
    if (!error) setText('')
  }

  return (
    <div className="card-elevated flex flex-col gap-3 border border-border bg-card p-4">
      <div>
        <p className="font-heading text-base">{label}</p>
        <p className="text-xs text-muted-foreground">{blurb}</p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <button
              type="button"
              role="checkbox"
              aria-checked={t.done}
              aria-label={t.title}
              onClick={() => toggleTask(t.id, !t.done)}
              className={`flex size-4 flex-shrink-0 items-center justify-center border ${t.done ? 'border-aka bg-aka' : 'border-border'}`}
            >
              {t.done && <Icon name="check" className="size-3 text-white" />}
            </button>
            <span className={t.done ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>{t.title}</span>
            <button type="button" onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive">
              <Icon name="close" className="size-3.5" />
            </button>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-xs text-muted-foreground">No tasks yet.</p>}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-1.5">
        <Input placeholder="Add a task…" value={text} onChange={(e) => setText(e.target.value)} className="h-8 text-xs" />
        <Button type="submit" size="icon-sm" variant="outline">
          <Icon name="add" className="size-3.5" />
        </Button>
      </form>
    </div>
  )
}

export function TournamentPrep() {
  const { id } = useParams<{ id: string }>()
  const { planned, loading: plannedLoading } = usePlannedCompetitions()
  const { goals, tasks, loading: prepLoading, addGoal, removeGoal, addTask, toggleTask, removeTask } =
    usePrepPlan(id ?? '')

  const competition = planned.find((p) => p.id === id)

  if (plannedLoading || prepLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!competition) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Competition not found in your upcoming list.</p>
        <Link to="/competitions" className="label-caps text-aka">← Competitions</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <Link to="/competitions" className="label-caps mb-2 block text-muted-foreground hover:text-foreground">
          ← Competitions
        </Link>
        <span className="label-caps mb-2 inline-block bg-aka px-2 py-0.5 text-white">Prep mode</span>
        <h1 className="font-heading-hero text-4xl">{competition.event}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {competition.date}
          {competition.location ? ` · ${competition.location}` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="label-caps text-muted-foreground">Goals</p>
        <GoalForm addGoal={addGoal} />
        {goals.length > 0 && (
          <ul className="flex flex-col gap-2">
            {goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between border border-border bg-muted px-3 py-2 text-sm">
                <span>
                  {g.discipline && (
                    <span className={`label-caps mr-2 ${g.discipline === 'kata' ? 'text-ao' : 'text-aka'}`}>
                      {g.discipline}
                    </span>
                  )}
                  {g.goal}
                </span>
                <button type="button" onClick={() => removeGoal(g.id)} className="text-muted-foreground hover:text-destructive">
                  <Icon name="close" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="label-caps text-muted-foreground">Week-by-week plan</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PHASES.map((phase) => (
            <PhaseColumn
              key={phase.value}
              phase={phase.value}
              label={phase.label}
              blurb={phase.blurb}
              tasks={tasks.filter((t) => t.phase === phase.value)}
              addTask={addTask}
              toggleTask={toggleTask}
              removeTask={removeTask}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
