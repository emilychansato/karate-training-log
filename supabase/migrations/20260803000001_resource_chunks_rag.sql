-- Resources Q&A assistant: answers are grounded ONLY in the WKF/Karate
-- Canada documents already listed on the Resources page (never general
-- model knowledge - see docs/future-ideas.md for why that matters here:
-- a wrong rule could cost someone at a real tournament). Standard RAG
-- shape: each PDF is split into small text chunks, each chunk gets an
-- embedding vector, and a question is answered by finding the closest
-- chunks and handing only those to the model.
create extension if not exists vector;

create table resource_chunks (
  id uuid primary key default gen_random_uuid(),
  resource_title text not null,
  resource_url text not null,
  content text not null,
  embedding vector(1536) not null, -- OpenAI text-embedding-3-small
  created_at timestamptz default now()
);

create index resource_chunks_embedding_idx on resource_chunks
  using hnsw (embedding vector_cosine_ops);

-- Shared reference data, same pattern as wkf_events/kbc_events: readable by
-- any authenticated user, written only by the ingest Edge Function
-- (service role, bypasses RLS on write).
alter table resource_chunks enable row level security;

create policy "resource_chunks_readable" on resource_chunks
  for select using (auth.role() = 'authenticated');

-- Vector similarity search as a Postgres function, since PostgREST/
-- supabase-js can't express "order by embedding <=> $1" directly - this
-- is what the ask-resources Edge Function calls via .rpc().
create function match_resource_chunks(query_embedding vector(1536), match_count int default 6)
returns table (
  id uuid,
  resource_title text,
  resource_url text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    resource_title,
    resource_url,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from resource_chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;
