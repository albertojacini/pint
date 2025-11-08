-- ============================================================================
-- POLICIES DOMAIN
-- ============================================================================
-- Concrete policy implementations and government actions
-- Dependencies: ideas, entities (political_entities), administrations

-- Policies: concrete implementations of ideas by specific entities
create table if not exists public.policies (
  id uuid primary key default uuid_generate_v4(),
  idea_id uuid not null references public.ideas(id) on delete restrict,
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  administration_id uuid references public.administrations(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'proposed' check (status in ('proposed', 'planned', 'active', 'completed', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  budget_allocated numeric,
  budget_currency text default 'EUR',
  implementation_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_policies_idea_id on public.policies(idea_id);
create index if not exists idx_policies_entity_id on public.policies(entity_id);
create index if not exists idx_policies_administration_id on public.policies(administration_id);
create index if not exists idx_policies_status on public.policies(status);

create trigger set_updated_at
  before update on public.policies
  for each row
  execute function public.handle_updated_at();
