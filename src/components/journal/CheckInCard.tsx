import { useState } from 'react'
import type { JournalEntry } from '../../hooks/useJournalEntries'
import { MOOD_EMOJI, MOOD_LEVELS, EMOTIONS } from '../../lib/journalConstants'
import { todayIso, WEEKDAY_SHORT } from '../../lib/dateFormat'
import { computeJournalStreak } from '../../lib/journalStreak'
import { ToggleChip } from '../ui/toggle-chip'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'

function thisWeekDates(): string[] {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })
}

export function CheckInCard({
  entries,
  checkIn,
}: {
  entries: JournalEntry[]
  checkIn: (input: { date: string; mood?: number; emotions?: string[]; notes?: string }) => Promise<{ error: string | null }>
}) {
  const today = todayIso()
  const todayEntry = entries.find((e) => e.date === today)
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<number | undefined>(todayEntry?.mood ?? undefined)
  const [emotions, setEmotions] = useState<string[]>(todayEntry?.emotions ?? [])
  const [notes, setNotes] = useState(todayEntry?.notes ?? '')

  const week = thisWeekDates()
  const entryByDate = new Map(entries.map((e) => [e.date, e]))
  const streak = computeJournalStreak(entries)

  function toggleEmotion(emotion: string) {
    setEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  async function handleSave() {
    const { error } = await checkIn({ date: today, mood, emotions, notes: notes || undefined })
    if (!error) setOpen(false)
  }

  return (
    <div className="card-elevated flex flex-col gap-4 border border-border bg-card p-5">
      {streak > 0 && (
        <div className="flex items-center gap-1.5">
          <Icon name="streak" className="size-4 text-aka" />
          <span className="label-caps text-foreground">
            {streak} day{streak === 1 ? '' : 's'} in a row
          </span>
        </div>
      )}
      <div className="flex justify-between">
        {week.map((date, i) => {
          const entry = entryByDate.get(date)
          const isToday = date === today
          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className="label-caps text-muted-foreground">{WEEKDAY_SHORT[i]}</span>
              <span
                className={`flex size-8 items-center justify-center rounded-full text-base ${
                  isToday ? 'border border-aka' : ''
                }`}
              >
                {entry?.mood ? MOOD_EMOJI[entry.mood] : '·'}
              </span>
            </div>
          )
        })}
      </div>

      {!open ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="font-heading text-xl">How do you feel?</p>
          <Button onClick={() => setOpen(true)} className="glow-primary w-full max-w-xs">
            {todayEntry ? 'Update check-in' : 'Check in'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="label-caps mb-2 text-muted-foreground">How do you feel?</p>
            <div className="flex justify-between">
              {MOOD_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={mood === level}
                  aria-label={`Mood ${level}`}
                  onClick={() => setMood(level)}
                  className={`flex size-11 items-center justify-center rounded-full text-2xl transition-transform duration-150 ${
                    mood === level ? 'scale-110 bg-muted' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {MOOD_EMOJI[level]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps mb-2 text-muted-foreground">What emotions do you feel right now?</p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((emotion) => (
                <ToggleChip
                  key={emotion}
                  label={emotion}
                  accent="ao"
                  selected={emotions.includes(emotion)}
                  onClick={() => toggleEmotion(emotion)}
                />
              ))}
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else on your mind? (optional)"
            className="min-h-20 border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!mood} className="glow-primary flex-1">
              Save
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
