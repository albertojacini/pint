-- ============================================================================
-- POLICIES DOMAIN
-- ============================================================================
-- Regulatory frameworks (policies), government activities (actions), and their relationships
-- Dependencies: ideas, entities (political_entities), administrations

-- Policies: regulatory frameworks owned by entities (can span multiple administrations)
create table if not exists public.policies (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  title text not null,
  description text,
  idea_id uuid references public.ideas(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_policies_entity_id on public.policies(entity_id);
create index if not exists idx_policies_idea_id on public.policies(idea_id);

create trigger set_updated_at_policies
  before update on public.policies
  for each row
  execute function public.handle_updated_at();

-- Actions: concrete government activities tied to administrations
create table if not exists public.actions (
  id uuid primary key default uuid_generate_v4(),
  administration_id uuid not null references public.administrations(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_actions_administration_id on public.actions(administration_id);

create trigger set_updated_at_actions
  before update on public.actions
  for each row
  execute function public.handle_updated_at();

-- Policy-Action relationships: how actions relate to policies (loose, optional)
create table if not exists public.policy_actions (
  id uuid primary key default uuid_generate_v4(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  action_id uuid not null references public.actions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(policy_id, action_id)
);

create index if not exists idx_policy_actions_policy_id on public.policy_actions(policy_id);
create index if not exists idx_policy_actions_action_id on public.policy_actions(action_id);
