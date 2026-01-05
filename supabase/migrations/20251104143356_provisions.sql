-- ============================================================================
-- PROVISIONS DOMAIN
-- ============================================================================
-- State infrastructure (provisions), temporal events, and their relationships
-- Provisions: laws, institutions, utilities, regulations that define political entity state
-- Events: occurrences that shape, create, modify, or repeal provisions
-- Dependencies: ideas, entities (political_entities), administrations

-- Provision types reference table
create table if not exists public.provision_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  description text,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- Seed the 7 provision types
insert into public.provision_types (code, label, description) values
  ('ownership', 'Ownership', 'Stakes in companies, property'),
  ('contract', 'Contract', 'Service agreements, concessions, partnerships'),
  ('regulation', 'Regulation', 'Rules, ordinances, codes, standards'),
  ('taxation', 'Taxation', 'Taxes, fees, tariffs'),
  ('allocation', 'Allocation', 'Programs, subsidies, budgets, funds'),
  ('designation', 'Designation', 'Zones, landmarks, protected areas, institutions'),
  ('infrastructure', 'Infrastructure', 'Public works, utilities, transportation networks, digital systems');

-- Provisions: institutional/legal/operational infrastructure owned by entities
create table if not exists public.provisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  avatar_url text,

  -- Relationships
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  idea_id uuid references public.ideas(id) on delete set null,

  -- Taxonomy and filtering
  -- tags and provision_types_associations are used for taxonomy and filtering

  -- Master data / source of truth
  summary_md text check (length(summary_md) <= 20000),

  -- UI fields - Extracted from summary_md
  description_short text check (length(description_short) <= 100),
  description text check (length(description) <= 1000),
  relevance integer check (relevance >= 0 and relevance <= 10),
  display_data jsonb not null default '{"items":[]}',

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Status data - DEPRECATED - This is deprecated because the provision table represents the current state of the political entities' provisions. Provisions that don't exist any more should just be deleted
  status text not null default 'active', -- 'active', 'repealed', 'suspended'
  effective_from date,
  effective_until date
);

-- Provision type associations (many-to-many junction table)
create table if not exists public.provision_type_associations (
  id uuid primary key default gen_random_uuid(),
  provision_id uuid not null references public.provisions(id) on delete cascade,
  type_id uuid not null references public.provision_types(id) on delete cascade,
  created_at timestamptz default now(),
  unique(provision_id, type_id)
);

create index if not exists idx_provisions_entity_id on public.provisions(entity_id);
create index if not exists idx_provisions_idea_id on public.provisions(idea_id);
create index if not exists idx_provisions_status on public.provisions(status);
create index if not exists idx_provision_type_associations_provision_id on public.provision_type_associations(provision_id);
create index if not exists idx_provision_type_associations_type_id on public.provision_type_associations(type_id);

create trigger set_updated_at_provisions
  before update on public.provisions
  for each row
  execute function public.handle_updated_at();

-- Events: temporal occurrences that shape provisions (government activities, judicial decrees, etc.)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  administration_id uuid references public.administrations(id) on delete cascade,
  title text not null,
  description_short text check (length(description_short) <= 100),
  description text check (length(description) <= 1000),
  type text not null, -- Legislative: 'legislative_session', 'bill_proposal', 'referendum', 'amendment'
                      -- Executive: 'executive_order', 'appointment', 'regulation_update', 'administrative_reform'
                      -- Judicial: 'court_ruling', 'legal_challenge'
                      -- Public: 'public_consultation', 'citizen_petition', 'protest'
                      -- Budget: 'budget_approval', 'funding_decision', 'tax_change'
                      -- Planning: 'plan_adoption', 'zoning_decision', 'project_launch'
                      -- Operations: 'service_change', 'contract_award', 'partnership_agreement'
                      -- Emergency: 'emergency_declaration', 'crisis_response'
                      -- Review: 'policy_review'
  occurred_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_events_administration_id on public.events(administration_id);
create index if not exists idx_events_type on public.events(type);
create index if not exists idx_events_occurred_at on public.events(occurred_at);

create trigger set_updated_at_events
  before update on public.events
  for each row
  execute function public.handle_updated_at();

-- Changes: polymorphic bridge between events and their targets (provisions, entities, administrations)
create table if not exists public.changes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  target_type text not null check (target_type in ('provision', 'entity', 'administration')),
  target_id uuid not null,
  change_type text not null check (change_type in ('create', 'update', 'deactivate', 'activate', 'merge', 'split')),
  description text,
  effective_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_changes_event_id on public.changes(event_id);
create index if not exists idx_changes_target on public.changes(target_type, target_id);
create index if not exists idx_changes_effective_at on public.changes(effective_at);

-- Provision drafts: work-in-progress provisions from AI ingestion pipeline
create table if not exists public.provision_drafts (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,

  -- User input
  input_description text not null,

  -- Prompt generation phase
  research_prompt text,

  -- Research phase (loose coupling via research_id)
  research_id uuid,                        -- Links to ra_researches (no FK)
  research_summary text,                   -- Cached summary from research

  -- Simplified job status (no classification steps)
  job_status text not null default 'input' check (job_status in (
    'input',              -- Initial: user provides topic
    'prompt_generated',   -- LLM generated research prompt
    'researching',        -- Research agent running
    'research_complete',  -- Research done
    'generating_draft',   -- LLM generating provision draft
    'review',             -- User reviewing/editing
    'completed',          -- Ready for production
    'failed'
  )),
  error_message text,

  -- Draft content (populated by LLM after research)
  title text,
  description_short text check (length(description_short) <= 100),
  description text check (length(description) <= 1000),
  summary_md text check (length(summary_md) <= 20000),
  provision_type_codes text[], -- Array of provision type codes
  display_data jsonb not null default '{"items":[]}',

  -- Metadata
  confidence float,
  source_urls text[],
  relevance integer check (relevance >= 0 and relevance <= 10),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_provision_drafts_entity_id on public.provision_drafts(entity_id);
create index if not exists idx_provision_drafts_job_status on public.provision_drafts(job_status);
create index if not exists idx_provision_drafts_created_by on public.provision_drafts(created_by);

create trigger set_updated_at_provision_drafts
  before update on public.provision_drafts
  for each row
  execute function public.handle_updated_at();

