// Answers a user's question strictly from the ingested Resources chunks
// (see ingest-resources). This is the "answer" half of the RAG pipeline:
// embed the question, find the closest stored chunks via pgvector, hand
// only those chunks to the model with an explicit instruction not to
// answer beyond them. Grounding matters here specifically because a wrong
// rule (points, weight class, eligibility) could cost someone at a real
// tournament - general model knowledge is not an acceptable substitute
// for the actual WKF/Karate Canada documents.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings'
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHAT_MODEL = 'gpt-4o-mini'
const MATCH_COUNT = 6

const SYSTEM_PROMPT = `You are a Q&A assistant for a karate training app. You answer ONLY using the provided document excerpts, which come from official WKF and Karate Canada rulebooks and guidelines.

Rules:
- Answer strictly from the excerpts below. Do not use outside knowledge, even if you're confident it's correct.
- If the excerpts don't contain the answer, say "That's not covered in the documents I have access to" - do not guess.
- Keep answers concise and factual.
- When you state a rule, number, or specific fact, mention which document it came from.`

interface ChunkMatch {
  resource_title: string
  resource_url: string
  content: string
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
}

Deno.serve(async (req) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const { question } = await req.json()
    if (!question || typeof question !== 'string') {
      return json({ error: 'question is required' }, { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const embedRes = await fetch(OPENAI_EMBEDDING_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: question }),
    })
    if (!embedRes.ok) {
      return json({ error: `embedding failed: ${await embedRes.text()}` }, { status: 502 })
    }
    const embedData = await embedRes.json()
    const queryEmbedding = embedData.data[0].embedding

    const { data: matches, error: matchError } = await supabase.rpc('match_resource_chunks', {
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
    })
    if (matchError) {
      return json({ error: matchError.message }, { status: 500 })
    }

    const chunks = (matches ?? []) as ChunkMatch[]
    if (chunks.length === 0) {
      return json({
        answer: "That's not covered in the documents I have access to.",
        sources: [],
      })
    }

    const context = chunks
      .map((c, i) => `[${i + 1}] (${c.resource_title})\n${c.content}`)
      .join('\n\n')

    const chatRes = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Document excerpts:\n\n${context}\n\nQuestion: ${question}` },
        ],
      }),
    })
    if (!chatRes.ok) {
      return json({ error: `chat completion failed: ${await chatRes.text()}` }, { status: 502 })
    }
    const chatData = await chatRes.json()
    const answer = chatData.choices[0].message.content

    const sources = [...new Map(chunks.map((c) => [c.resource_url, c])).values()].map((c) => ({
      title: c.resource_title,
      url: c.resource_url,
    }))

    return json({ answer, sources })
  } catch (err) {
    return json({ error: String(err) }, { status: 500 })
  }
})
