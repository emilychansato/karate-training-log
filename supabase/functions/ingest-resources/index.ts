// Ingests every PDF listed in src/lib/resources.ts: downloads it, extracts
// its text, splits into overlapping chunks, embeds each chunk via OpenAI,
// and stores the result in resource_chunks. This is the "read once" half
// of the Resources Q&A assistant - ask-resources does the "answer" half by
// searching these chunks. Re-running this function replaces all chunks for
// a given resource_url (simple, correct-by-construction re-ingestion
// rather than diffing).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { extractText, getDocumentProxy } from 'npm:unpdf@0.11.0'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHUNK_SIZE = 1200
const CHUNK_OVERLAP = 200

// Kept in sync with src/lib/resources.ts by hand (Deno functions can't
// import from src/ - different runtime/bundling). If the Resources page
// list changes, update both.
const RESOURCES: { title: string; url: string }[] = [
  { title: 'WKF Kumite Competition Rules 2026', url: 'https://www.wkf.net/files/pdf/documents/WKF%202026%20Kumite%20Competition%20Rules%20MASTER%20COPY_V11.pdf' },
  { title: 'WKF Kata Competition Rules 2026', url: 'https://www.wkf.net/files/pdf/documents/WKF%20KATA%202026.pdf' },
  { title: 'WKF Para Karate Competition Rules 2026', url: 'https://www.wkf.net/files/pdf/documents/WKF%202026%20Para%20Karate%20Competition%20Rules%20MASTER%20COPY_V2.pdf' },
  { title: 'WKF Competition Rules Bulletin 2026', url: 'https://www.wkf.net/files/pdf/documents/WKF%20Competition%20Rules%20Bulletin%202026_V2.pdf' },
  { title: 'WKF Kumite Examination Questions 2025', url: 'https://www.wkf.net/files/pdf/documents/KumiteQuestions_English_Dec2025.pdf' },
  { title: 'Shotokan Dan Evaluation Guidelines', url: 'http://karatecanada.org/wp-content/uploads/2018/07/KC_SHOTOKAN_Dan-Test-Guideline_ENG-20120221.pdf' },
  { title: 'Goju-Ryu Dan Evaluation Guidelines', url: 'https://karatecanada.org/wp-content/uploads/2018/07/KC_GOJU-RYU_Dan-Test-Guideline_ENG-20120221.pdf' },
  { title: 'Wado-Ryu Dan Evaluation Guidelines', url: 'http://karatecanada.org/wp-content/uploads/2018/07/KC_WADO-RYU_Dan-Test-Guideline_ENG-20120221.pdf' },
  { title: 'Shito-Ryu Dan Evaluation Guidelines', url: 'http://karatecanada.org/wp-content/uploads/2018/07/KC_SHITO-RYU_Dan-Test-Guideline_ENG-20120221.pdf' },
  { title: 'Chito-Ryu Dan Evaluation Guidelines', url: 'https://karatecanada.org/wp-content/uploads/2022/02/KC_CHITO-RYU_Dan-Test-Guidelines_ENG_2022-02-01_FINAL.pdf' },
  { title: 'Other Styles Dan Evaluation Guidelines', url: 'https://karatecanada.org/wp-content/uploads/2018/07/KC_OTHERSTYLES_Dan-Test-Guideline_ENG20120223.pdf' },
  { title: 'Karate for Life — Long Term Athlete Development (LTAD)', url: 'https://karatemanitoba.ca/wp-content/uploads/2012/09/Karate-for-Life-LTAD.pdf' },
  { title: 'Instruction Beginner Pathway', url: 'https://karatecanada.org/wp-content/uploads/2018/02/Karate-Canada_Inst-Beg-Pathway_EN_24Aug2020_Final.pdf' },
]

function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const chunks: string[] = []
  let start = 0
  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length)
    chunks.push(normalized.slice(start, end))
    if (end === normalized.length) break
    start = end - CHUNK_OVERLAP
  }
  return chunks.filter((c) => c.length > 50)
}

async function embedBatch(texts: string[], apiKey: string): Promise<number[][]> {
  const res = await fetch(OPENAI_EMBEDDING_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  })
  if (!res.ok) throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.data.map((d: { embedding: number[] }) => d.embedding)
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
}

// Processes ONE resource per invocation (pass { "index": 0..12 } in the
// request body). Doing all 13 PDFs in a single call exceeded the Edge
// Function's compute/memory limit (PDF parsing is heavy) - the caller
// loops over indices instead, one HTTP request per document.
Deno.serve(async (req) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const { index } = await req.json().catch(() => ({ index: undefined }))
    if (typeof index !== 'number' || !RESOURCES[index]) {
      return json({ error: `index required, 0..${RESOURCES.length - 1}` }, { status: 400 })
    }
    const resource = RESOURCES[index]

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const res = await fetch(resource.url)
    if (!res.ok) {
      return json({ title: resource.title, chunks: 0, error: `fetch ${res.status}` }, { status: 502 })
    }
    const buffer = new Uint8Array(await res.arrayBuffer())
    const pdf = await getDocumentProxy(buffer)
    const { text } = await extractText(pdf, { mergePages: true })
    const chunks = chunkText(text as string)

    await supabase.from('resource_chunks').delete().eq('resource_url', resource.url)

    const BATCH = 20
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH)
      const embeddings = await embedBatch(batch, openaiKey)
      const { error: insertError } = await supabase.from('resource_chunks').insert(
        batch.map((content, j) => ({
          resource_title: resource.title,
          resource_url: resource.url,
          content,
          embedding: embeddings[j],
        }))
      )
      if (insertError) {
        return json({ title: resource.title, chunks: i, error: insertError.message }, { status: 500 })
      }
    }

    return json({ title: resource.title, chunks: chunks.length, error: null })
  } catch (err) {
    return json({ error: String(err) }, { status: 500 })
  }
})
