// Turns a raw speech-to-text transcript ("logged an hour of kumite,
// worked a lot on my footwork, felt pretty tired but happy with it") into
// structured training-session fields, so a voice log doesn't just dump
// the transcript into the notes field - it actually fills the same form
// fields a typed entry would. Reuses OPENAI_API_KEY (already configured
// for ask-resources) rather than adding a second AI provider/key.
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const CHAT_MODEL = 'gpt-4o-mini'

const SYSTEM_PROMPT = `You extract structured training-log fields from a spoken transcript of a karate athlete describing a session they just finished.

Return ONLY a JSON object with these fields:
- "type": one of "kata", "kumite", "conditioning", "other" - best guess from context
- "duration_min": number of minutes, your best estimate from what's said (if a range or "about an hour" is said, pick a reasonable single number). If truly not mentioned, use 60.
- "self_rating": integer 1-5 for how the session went, only if the transcript clearly implies a rating (e.g. "great session" = 5, "rough session" = 2). Omit the field entirely if unclear.
- "notes": a concise cleaned-up summary of what they said, in their own voice, not a transcript verbatim
- "improved": array of short tags from this exact list only, include any that clearly apply: ["Speed", "Timing", "Distance", "Power", "Accuracy", "Strategy"]
- "struggled": array of short tags from this exact list only, include any that clearly apply: ["Fatigue", "Reaction time", "Footwork", "Confidence", "Technique consistency"]

Do not invent details not implied by the transcript. Omit "improved"/"struggled" entries with no clear support.`

interface ParsedFields {
  type?: string
  duration_min?: number
  self_rating?: number
  notes?: string
  improved?: string[]
  struggled?: string[]
}

const VALID_TYPES = ['kata', 'kumite', 'conditioning', 'other']
const VALID_IMPROVED = ['Speed', 'Timing', 'Distance', 'Power', 'Accuracy', 'Strategy']
const VALID_STRUGGLED = ['Fatigue', 'Reaction time', 'Footwork', 'Confidence', 'Technique consistency']

function sanitize(parsed: ParsedFields): ParsedFields {
  return {
    type: VALID_TYPES.includes(parsed.type ?? '') ? parsed.type : 'other',
    duration_min:
      typeof parsed.duration_min === 'number' && parsed.duration_min > 0 ? parsed.duration_min : 60,
    self_rating:
      typeof parsed.self_rating === 'number' && parsed.self_rating >= 1 && parsed.self_rating <= 5
        ? Math.round(parsed.self_rating)
        : undefined,
    notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
    improved: (parsed.improved ?? []).filter((t) => VALID_IMPROVED.includes(t)),
    struggled: (parsed.struggled ?? []).filter((t) => VALID_STRUGGLED.includes(t)),
  }
}

Deno.serve(async (req) => {
  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), { status: 500 })
    }

    const { transcript } = await req.json()
    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'transcript is required' }), { status: 400 })
    }

    const chatRes = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
      }),
    })
    if (!chatRes.ok) {
      return new Response(JSON.stringify({ error: `chat completion failed: ${await chatRes.text()}` }), {
        status: 502,
      })
    }
    const chatData = await chatRes.json()
    const parsed = JSON.parse(chatData.choices[0].message.content) as ParsedFields

    return new Response(JSON.stringify(sanitize(parsed)), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
