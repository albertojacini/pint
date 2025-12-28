-- ============================================================================
-- RESEARCH AGENT DOMAIN
-- ============================================================================
-- Tables for AI research agent: tasks, sources, findings, summaries
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

-- 2. Sources (sources discovered or provided for research)
create table if not exists public.ra_sources (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ra_research_tasks(id) on delete cascade,
  url text,
  title text,
  content text,
  researcher_id text,
  source_type text check (source_type in ('web', 'pdf', 'document', 'api', 'database', 'manual')),
  raw_content text,
  fetch_status text not null default 'pending' check (fetch_status in ('pending', 'fetching', 'completed', 'failed', 'skipped')),
  fetched_at timestamptz,
  credibility_score float check (credibility_score >= 0.0 and credibility_score <= 1.0),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Findings (individual facts/claims extracted from sources)
create table if not exists public.ra_findings (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ra_research_tasks(id) on delete cascade,
  source_id uuid references public.ra_sources(id) on delete set null,
  content text not null,
  confidence float check (confidence >= 0.0 and confidence <= 1.0),
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 4. Summaries (synthesized summaries at various levels - hierarchical)
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

-- 5. Summary Findings (M2M junction table linking summaries to findings)
create table if not exists public.ra_summary_findings (
  summary_id uuid not null references public.ra_summaries(id) on delete cascade,
  finding_id uuid not null references public.ra_findings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (summary_id, finding_id)
);

-- 6. Agent Actions (audit trail of agent's search queries and actions)
create table if not exists public.ra_agent_actions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ra_research_tasks(id) on delete cascade,
  action_type text not null check (action_type in ('web_search', 'content_fetch', 'extract_findings', 'generate_summary', 'evaluate_source')),
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

-- ra_findings indexes
create index if not exists idx_ra_findings_task_id on public.ra_findings(task_id);
create index if not exists idx_ra_findings_source_id on public.ra_findings(source_id);
create index if not exists idx_ra_findings_embedding on public.ra_findings using ivfflat (embedding vector_cosine_ops) where embedding is not null;

-- ra_summaries indexes
create index if not exists idx_ra_summaries_task_id on public.ra_summaries(task_id);
create index if not exists idx_ra_summaries_parent_summary_id on public.ra_summaries(parent_summary_id);
create index if not exists idx_ra_summaries_summary_type on public.ra_summaries(summary_type);

-- ra_summary_findings indexes
create index if not exists idx_ra_summary_findings_summary_id on public.ra_summary_findings(summary_id);
create index if not exists idx_ra_summary_findings_finding_id on public.ra_summary_findings(finding_id);

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
