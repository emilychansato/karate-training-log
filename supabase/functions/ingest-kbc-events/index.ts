// Ingests Karate BC's public Google Calendar (the "Karate BC Events
// Calendar" embedded at karatebc.org/kbc-calendar-grid-view/) into the
// kbc_events table. Google Calendar publishes a plain-text iCal feed for
// any public calendar at a fixed URL pattern - no auth, no scraping
// fragility (verified 2026-08-02: 900+ real events, going back to 2018).
import { createClient } from 'npm:@supabase/supabase-js@2'

const KBC_CALENDAR_ID = 'karatebc.org_8irvnngo7krsp7teh40uhq04rc@group.calendar.google.com'
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(KBC_CALENDAR_ID)}/public/basic.ics`

const COMPETITION_KEYWORDS =
  /championship|tournament|\bcup\b|league|\bgames\b|qualifier|selection|playoffs?|trials?|\bworlds?\b/i

interface ParsedEvent {
  uid: string
  name: string
  dateStart: string
  dateEnd: string | null
  location: string | null
  description: string | null
  kind: 'competition' | 'event'
}

function unfoldLines(ics: string): string[] {
  const rawLines = ics.split(/\r\n|\n|\r/)
  const lines: string[] = []
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1)
    } else {
      lines.push(line)
    }
  }
  return lines
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim()
}

function toDateString(value: string): string {
  // DATE (YYYYMMDD) or DATE-TIME (YYYYMMDDTHHMMSSZ) - either way the first
  // 8 characters are the calendar date, which is all the app displays.
  const digits = value.replace(/[^0-9]/g, '')
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

function classifyKind(name: string): 'competition' | 'event' {
  return COMPETITION_KEYWORDS.test(name) ? 'competition' : 'event'
}

function parseEvents(ics: string): ParsedEvent[] {
  const lines = unfoldLines(ics)
  const events: ParsedEvent[] = []
  let current: Record<string, string> | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current && current.UID && current.SUMMARY && current.DTSTART) {
        const name = unescapeText(current.SUMMARY)
        events.push({
          uid: current.UID,
          name,
          dateStart: toDateString(current.DTSTART),
          dateEnd: current.DTEND ? toDateString(current.DTEND) : null,
          location: current.LOCATION ? unescapeText(current.LOCATION) : null,
          description: current.DESCRIPTION ? unescapeText(current.DESCRIPTION) : null,
          kind: classifyKind(name),
        })
      }
      current = null
      continue
    }
    if (!current) continue

    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const rawKey = line.slice(0, colonIndex)
    const value = line.slice(colonIndex + 1)
    const key = rawKey.split(';')[0] // strip params like ;VALUE=DATE or ;TZID=...

    if (key === 'UID' || key === 'SUMMARY' || key === 'DTSTART' || key === 'DTEND' || key === 'LOCATION' || key === 'DESCRIPTION') {
      current[key] = value
    }
  }

  return events
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const res = await fetch(ICS_URL)
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `KBC calendar fetch failed: ${res.status}` }), {
        status: 502,
      })
    }
    const ics = await res.text()
    const allEvents = parseEvents(ics)

    const today = new Date().toISOString().slice(0, 10)
    const upcoming = allEvents.filter((e) => e.dateStart >= today)

    let inserted = 0
    const errors: string[] = []
    for (const e of upcoming) {
      const { error, data } = await supabase
        .from('kbc_events')
        .upsert(
          {
            uid: e.uid,
            name: e.name,
            date_start: e.dateStart,
            date_end: e.dateEnd,
            location: e.location,
            description: e.description,
            kind: e.kind,
          },
          { onConflict: 'uid' }
        )
        .select()
      if (error) errors.push(error.message)
      else if (data && data.length > 0) inserted++
    }

    return new Response(
      JSON.stringify({ parsed: allEvents.length, upcoming: upcoming.length, inserted, errors: errors.slice(0, 3) }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
