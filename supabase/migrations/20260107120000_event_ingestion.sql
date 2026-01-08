-- ============================================================================
-- EVENT INGESTION DOMAIN
-- ============================================================================
-- Pipeline for ingesting real-world events from external sources
-- Flow: Sources → Candidates → Events → Changes → Entity updates
-- All tables prefixed with ei_ (event ingestion)

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Sources: Raw inputs from external world (news, official docs, etc.)
create table if not exists public.ei_sources (
  id uuid primary key default gen_random_uuid(),

  -- Source identification
  url text,                                    -- Original URL (nullable for manual entries)
  title text,                                  -- Headline/title
  source_type text not null check (source_type in (
    'news',              -- News articles (ANSA, newspapers)
    'official_gazette',  -- Gazzetta Ufficiale, official publications
    'press_release',     -- Government press releases
    'council_minutes',   -- Municipal council meeting minutes
    'social',            -- Social media posts
    'manual'             -- Manually entered by admin
  )),
  source_name text,                            -- e.g., 'Gazzetta Ufficiale', 'ANSA', 'Comune di Milano'
  published_at timestamptz,                    -- When source was originally published

  -- Content
  raw_content text,                            -- Full text/HTML

  -- Processing
  fetch_status text not null default 'pending' check (fetch_status in (
    'pending',    -- Not yet fetched
    'fetching',   -- Currently fetching
    'fetched',    -- Successfully fetched
    'failed'      -- Fetch failed
  )),
  fetch_error text,                            -- Error message if failed
  fetched_at timestamptz,

  processing_status text not null default 'unprocessed' check (processing_status in (
    'unprocessed',  -- Not yet analyzed by AI
    'processing',   -- AI currently analyzing
    'processed',    -- AI analysis complete
    'discarded'     -- Marked as not relevant
  )),

  -- AI-generated fields
  ai_summary text,                             -- LLM-generated summary
  ai_extracted_data jsonb default '{}',        -- Extracted: entities, dates, keywords, event hints

  -- Metadata
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Candidates: Aggregated potential events (before human approval)
create table if not exists public.ei_candidates (
  id uuid primary key default gen_random_uuid(),

  -- Draft event data
  title text,
  description text,
  event_type text,                             -- Same types as events table

  -- Classification (AI-detected)
  detected_entity_id uuid references public.political_entities(id) on delete set null,
  detected_administration_id uuid references public.administrations(id) on delete set null,

  -- AI metadata
  confidence_score float check (confidence_score >= 0.0 and confidence_score <= 1.0),
  ai_reasoning text,                           -- Why AI thinks this is an event

  -- Pipeline status
  status text not null default 'pending' check (status in (
    'pending',    -- Awaiting review
    'reviewing',  -- Currently being reviewed
    'approved',   -- Approved → promoted to event
    'rejected',   -- Rejected by reviewer
    'merged'      -- Merged into another candidate
  )),
  merged_into_id uuid references public.ei_candidates(id) on delete set null,

  -- Output (populated on approval)
  event_id uuid references public.events(id) on delete set null,

  -- Review audit
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Candidate-Sources junction (N:M relationship)
create table if not exists public.ei_candidate_sources (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.ei_candidates(id) on delete cascade,
  source_id uuid not null references public.ei_sources(id) on delete cascade,
  relevance text not null default 'primary' check (relevance in (
    'primary',     -- Main source for this event
    'supporting',  -- Additional confirmation
    'related'      -- Tangentially related
  )),
  created_at timestamptz default now(),
  unique(candidate_id, source_id)
);

-- 4. Candidate Changes: Draft changes proposed by AI (before approval)
create table if not exists public.ei_candidate_changes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.ei_candidates(id) on delete cascade,

  -- Target specification
  target_type text not null check (target_type in ('provision', 'entity', 'administration')),
  target_id uuid,                              -- Existing target ID (null if action='create')

  -- Proposed change
  action text not null check (action in (
    'create',  -- Create new target
    'update',  -- Update existing target
    'delete'   -- Delete/repeal target
  )),
  proposed_data jsonb not null default '{}',   -- Fields to set/update
  description text,                            -- Human-readable change description

  -- Review status
  status text not null default 'pending' check (status in (
    'pending',   -- Awaiting review
    'approved',  -- Will be applied on candidate approval
    'rejected',  -- Won't be applied
    'modified'   -- Human modified the proposal
  )),

  -- Output (populated on approval)
  change_id uuid references public.changes(id) on delete set null,

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ei_sources indexes
create index if not exists idx_ei_sources_fetch_status on public.ei_sources(fetch_status);
create index if not exists idx_ei_sources_processing_status on public.ei_sources(processing_status);
create index if not exists idx_ei_sources_source_type on public.ei_sources(source_type);
create index if not exists idx_ei_sources_published_at on public.ei_sources(published_at);
create index if not exists idx_ei_sources_url on public.ei_sources(url);

-- ei_candidates indexes
create index if not exists idx_ei_candidates_status on public.ei_candidates(status);
create index if not exists idx_ei_candidates_event_type on public.ei_candidates(event_type);
create index if not exists idx_ei_candidates_detected_entity_id on public.ei_candidates(detected_entity_id);
create index if not exists idx_ei_candidates_event_id on public.ei_candidates(event_id);

-- ei_candidate_sources indexes
create index if not exists idx_ei_candidate_sources_candidate_id on public.ei_candidate_sources(candidate_id);
create index if not exists idx_ei_candidate_sources_source_id on public.ei_candidate_sources(source_id);

-- ei_candidate_changes indexes
create index if not exists idx_ei_candidate_changes_candidate_id on public.ei_candidate_changes(candidate_id);
create index if not exists idx_ei_candidate_changes_target on public.ei_candidate_changes(target_type, target_id);
create index if not exists idx_ei_candidate_changes_status on public.ei_candidate_changes(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

create trigger set_updated_at_ei_sources
  before update on public.ei_sources
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_ei_candidates
  before update on public.ei_candidates
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_ei_candidate_changes
  before update on public.ei_candidate_changes
  for each row
  execute function public.handle_updated_at();
