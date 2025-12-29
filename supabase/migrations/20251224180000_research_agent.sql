-- ============================================================================
-- RESEARCH AGENT DOMAIN
-- ============================================================================
-- Tables for AI research agent: tasks, sources, summaries
-- Standalone system with no dependencies on other domains

-- Enable pgvector extension for embeddings
create extension if not exists "vector";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Research Tasks (top-level research questions/tasks)
create table if not exists public.ra_research_tasks (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  entity_id uuid,
  status text not null default 'researching' check (status in ('pending', 'researching', 'completed', 'failed')),
  subtopics jsonb default '[]',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Sources (sources discovered and evaluated during research)
create table if not exists public.ra_sources (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ra_research_tasks(id) on delete cascade,
  url text,
  title text,
  researcher_id text,
  source_type text check (source_type in ('web', 'pdf', 'document', 'api', 'database', 'manual')),
  raw_content text,
  fetch_status text not null default 'pending' check (fetch_status in ('pending', 'fetching', 'completed', 'failed', 'skipped')),
  fetched_at timestamptz,
  relevance_score float check (relevance_score >= 0.0 and relevance_score <= 1.0),
  reliability_score float check (reliability_score >= 0.0 and reliability_score <= 1.0),
  evaluation_notes text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Summaries (synthesized summaries at various levels - hierarchical)
create table if not exists public.ra_summaries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ra_research_tasks(id) on delete cascade,
  parent_summary_id uuid references public.ra_summaries(id) on delete set null,
  content text not null,
  summary_type text default 'final' check (summary_type in ('overview', 'section', 'final')),
  "order" integer default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Agent Actions (audit trail of agent's search queries and actions)
create table if not exists public.ra_agent_actions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ra_research_tasks(id) on delete cascade,
  action_type text not null check (action_type in ('web_search', 'content_fetch', 'generate_summary', 'evaluate_source')),
  input jsonb,
  output jsonb,
  status text not null default 'completed' check (status in ('pending', 'running', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ra_research_tasks indexes
create index if not exists idx_ra_research_tasks_status on public.ra_research_tasks(status);

-- ra_sources indexes
create index if not exists idx_ra_sources_task_id on public.ra_sources(task_id);
create index if not exists idx_ra_sources_fetch_status on public.ra_sources(fetch_status);
create index if not exists idx_ra_sources_url on public.ra_sources(url);

-- ra_summaries indexes
create index if not exists idx_ra_summaries_task_id on public.ra_summaries(task_id);
create index if not exists idx_ra_summaries_parent_summary_id on public.ra_summaries(parent_summary_id);
create index if not exists idx_ra_summaries_summary_type on public.ra_summaries(summary_type);

-- ra_agent_actions indexes
create index if not exists idx_ra_agent_actions_task_id on public.ra_agent_actions(task_id);
create index if not exists idx_ra_agent_actions_action_type on public.ra_agent_actions(action_type);
create index if not exists idx_ra_agent_actions_status on public.ra_agent_actions(status);
create index if not exists idx_ra_agent_actions_created_at on public.ra_agent_actions(created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ra_research_tasks trigger
create trigger set_updated_at_ra_research_tasks
  before update on public.ra_research_tasks
  for each row
  execute function public.handle_updated_at();

-- ra_sources trigger
create trigger set_updated_at_ra_sources
  before update on public.ra_sources
  for each row
  execute function public.handle_updated_at();

-- ra_summaries trigger
create trigger set_updated_at_ra_summaries
  before update on public.ra_summaries
  for each row
  execute function public.handle_updated_at();
