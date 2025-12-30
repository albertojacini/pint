-- ============================================================================
-- RESEARCH AGENT DOMAIN
-- ============================================================================
-- Tables for AI research agent: researches, sources, summaries
-- Standalone system with no dependencies on other domains

-- Enable pgvector extension for embeddings
create extension if not exists "vector";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Researches (top-level research questions)
create table if not exists public.ra_researches (
  id uuid primary key default gen_random_uuid(),
  input text not null,
  summary text,  -- Final synthesized research summary (markdown)
  status text not null default 'researching' check (status in ('pending', 'researching', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Sources (sources discovered and evaluated during research)
create table if not exists public.ra_sources (
  id uuid primary key default gen_random_uuid(),
  research_id uuid not null references public.ra_researches(id) on delete cascade,
  url text,
  title text,
  researcher_id text,
  raw_content text,
  source_summary text,  -- LLM-generated summary of the source content
  source_type text check (source_type in ('wikipedia', 'web', 'pdf', 'other')),
  content_quality text check (content_quality in ('good', 'partial', 'failed')),
  fetch_status text not null default 'pending' check (fetch_status in ('pending', 'fetching', 'completed', 'failed', 'skipped')),
  fetched_at timestamptz,
  relevance_score float check (relevance_score >= 0.0 and relevance_score <= 1.0),
  reliability_score float check (reliability_score >= 0.0 and reliability_score <= 1.0),
  evaluation_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ra_researches indexes
create index if not exists idx_ra_researches_status on public.ra_researches(status);

-- ra_sources indexes
create index if not exists idx_ra_sources_research_id on public.ra_sources(research_id);
create index if not exists idx_ra_sources_fetch_status on public.ra_sources(fetch_status);
create index if not exists idx_ra_sources_url on public.ra_sources(url);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ra_researches trigger
create trigger set_updated_at_ra_researches
  before update on public.ra_researches
  for each row
  execute function public.handle_updated_at();

-- ra_sources trigger
create trigger set_updated_at_ra_sources
  before update on public.ra_sources
  for each row
  execute function public.handle_updated_at();
