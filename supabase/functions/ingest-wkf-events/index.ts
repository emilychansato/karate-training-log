// Ingests the "Next Events" carousel from wkf.net/calendar into the
// wkf_events table. Called on-demand (a "Sync now" button in the app) and
// intended to also run on a weekly pg_cron schedule once that's wired up.
//
// wkf.net/calendar is plain server-rendered HTML with no bot protection
// (verified 2026-08-02) - the carousel markup is a very consistent repeated
// <article> block, so this uses a targeted regex rather than a full HTML
// parser (Deno has no DOMParser without an extra dependency, and the
// structure here doesn't need one).
import { createClient } from 'npm:@supabase/supabase-js@2'

const WKF_CALENDAR_URL = 'https://www.wkf.net/calendar'

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

interface ParsedEvent {
  name: string
  location: string
  dateStart: string
  dateEnd: string | null
  category: string
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
}

function parseDateRange(raw: string, year: number): { start: string; end: string | null } | null {
  const text = raw.trim()

  // Cross-month: "31 Oct - 13 Nov"
  const crossMonth = text.match(/^(\d{1,2})\s+([A-Za-z]{3})\s*-\s*(\d{1,2})\s+([A-Za-z]{3})$/)
  if (crossMonth) {
    const [, d1, m1, d2, m2] = crossMonth
    const mo1 = MONTHS[m1.toLowerCase()]
    const mo2 = MONTHS[m2.toLowerCase()]
    if (!mo1 || !mo2) return null
    return {
      start: `${year}-${mo1}-${d1.padStart(2, '0')}`,
      end: `${year}-${mo2}-${d2.padStart(2, '0')}`,
    }
  }

  // Same-month range or single day: "27 - 30 Aug" / "1 - 2 Sep" / "5 - 6 Nov"
  const sameMonth = text.match(/^(\d{1,2})(?:\s*-\s*(\d{1,2}))?\s+([A-Za-z]{3})$/)
  if (sameMonth) {
    const [, d1, d2, mon] = sameMonth
    const mo = MONTHS[mon.toLowerCase()]
    if (!mo) return null
    return {
      start: `${year}-${mo}-${d1.padStart(2, '0')}`,
      end: d2 ? `${year}-${mo}-${d2.padStart(2, '0')}` : null,
    }
  }

  return null
}

function parseEvents(html: string): ParsedEvent[] {
  const events: ParsedEvent[] = []
  const articleRe = /<article class="d-flex flex-column justify-content-between gap-2 text-white p-4">([\s\S]*?)<\/article>/g

  let match: RegExpExecArray | null
  while ((match = articleRe.exec(html))) {
    const block = match[1]

    const nameMatch = block.match(/<header class="two-lines h4">([\s\S]*?)<\/header>/)
    const spans = [...block.matchAll(/<span(?: class="([^"]*)")?>([\s\S]*?)<\/span>/g)]
    const hrefMatch = block.match(/href="\/([a-z-]+)\/championship\/!\/\d+\/[a-z0-9-]+"/)

    if (!nameMatch || spans.length < 2 || !hrefMatch) continue

    const name = stripTags(nameMatch[1])
    const location = stripTags(spans[0][2])
    const dateRaw = stripTags(spans[1][2])
    const category = hrefMatch[1]

    const yearMatch = name.match(/20\d{2}/)
    const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear()

    const parsed = parseDateRange(dateRaw, year)
    if (!parsed) continue

    events.push({
      name,
      location,
      dateStart: parsed.start,
      dateEnd: parsed.end,
      category,
    })
  }

  return events
}

async function hashKey(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const res = await fetch(WKF_CALENDAR_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; karate-training-log-bot/1.0)' },
    })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `WKF fetch failed: ${res.status}` }), {
        status: 502,
      })
    }
    const html = await res.text()
    const events = parseEvents(html)

    let inserted = 0
    for (const e of events) {
      const sourceHash = await hashKey(`${e.name}|${e.dateStart}|${e.location}`)
      const { error, data } = await supabase
        .from('wkf_events')
        .upsert(
          {
            name: e.name,
            date_start: e.dateStart,
            date_end: e.dateEnd,
            location: e.location,
            category: e.category,
            source_hash: sourceHash,
          },
          { onConflict: 'source_hash', ignoreDuplicates: true }
        )
        .select()
      if (!error && data && data.length > 0) inserted++
    }

    return new Response(
      JSON.stringify({ parsed: events.length, inserted }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
