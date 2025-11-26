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
  description text,
  type text not null, -- Legal: 'law', 'regulation', 'ordinance', 'decree', 'standard', 'code'
                      -- Institutional: 'institution', 'utility', 'agency', 'program', 'fund'
                      -- Planning: 'plan', 'zone', 'project', 'guideline'
                      -- Fiscal: 'tax', 'fee', 'budget', 'subsidy', 'tariff'
                      -- Administrative: 'procedure', 'agreement', 'delegation', 'protocol', 'policy'
  status text not null default 'active', -- 'active', 'repealed', 'suspended'
  effective_from date,
  effective_until date,
  idea_id uuid references public.ideas(id) on delete set null,
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
  description text,
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

-- Provision-Event relationships: how events relate to provisions
create table if not exists public.provision_events (
  id uuid primary key default uuid_generate_v4(),
  provision_id uuid not null references public.provisions(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  relationship_type text, -- 'establishes', 'repeals', 'modifies', 'influences'
  created_at timestamptz default now(),
  unique(provision_id, event_id)
);

create index if not exists idx_provision_events_provision_id on public.provision_events(provision_id);
create index if not exists idx_provision_events_event_id on public.provision_events(event_id);
create index if not exists idx_provision_events_relationship_type on public.provision_events(relationship_type);
