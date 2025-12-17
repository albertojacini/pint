-- ============================================================================
-- PROVISIONS DOMAIN
-- ============================================================================
-- State infrastructure (provisions), temporal events, and their relationships
-- Provisions: laws, institutions, utilities, regulations that define political entity state
-- Events: occurrences that shape, create, modify, or repeal provisions
-- Dependencies: ideas, entities (political_entities), administrations

-- Provisions: institutional/legal/operational infrastructure owned by entities
create table if not exists public.provisions (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  title text not null,
  slug text not null,
  description_short text check (length(description_short) <= 100),
  description text check (length(description) <= 1000),
  summary text check (length(summary) <= 20000),
  avatar_url text,
  type text not null check (type in ('ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation')),
                      -- ownership: stakes in companies, property, infrastructure
                      -- contract: service agreements, concessions, partnerships
                      -- regulation: rules, ordinances, codes, standards
                      -- taxation: taxes, fees, tariffs
                      -- allocation: programs, subsidies, budgets, funds
                      -- designation: zones, landmarks, protected areas, institutions
  status text not null default 'active', -- 'active', 'repealed', 'suspended'
  relevance integer check (relevance >= 0 and relevance <= 10),
  effective_from date,
  effective_until date,
  idea_id uuid references public.ideas(id) on delete set null,
  extra_data jsonb default '{}', -- Type-specific data: utility→{revenues}, tax→{rate}, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_provisions_entity_id on public.provisions(entity_id);
create index if not exists idx_provisions_idea_id on public.provisions(idea_id);
create index if not exists idx_provisions_type on public.provisions(type);
create index if not exists idx_provisions_status on public.provisions(status);

create trigger set_updated_at_provisions
  before update on public.provisions
  for each row
  execute function public.handle_updated_at();

-- Events: temporal occurrences that shape provisions (government activities, judicial decrees, etc.)
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
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
  id uuid primary key default uuid_generate_v4(),
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

-- Provision resources: URLs to be processed by the provision generator agent
create table if not exists public.provision_resources (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  url text not null,
  status text not null default 'pending' check (status in ('pending', 'scraped', 'processed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(entity_id, url)
);

create index if not exists idx_provision_resources_entity_id on public.provision_resources(entity_id);
create index if not exists idx_provision_resources_status on public.provision_resources(status);

create trigger set_updated_at_provision_resources
  before update on public.provision_resources
  for each row
  execute function public.handle_updated_at();
