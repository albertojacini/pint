-- ============================================================================
-- IDEAS DOMAIN
-- ============================================================================
-- Data-driven policy analysis framework: idea → effect → measurable → contribution → goal
-- This enables evidence-based policy making and cross-entity comparison
-- Dependencies: taxonomy (categories)

-- High-level goals that policies aim to achieve
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  maslow_level text, -- Link to Maslow hierarchy if applicable
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_updated_at
  before update on public.goals
  for each row
  execute function public.handle_updated_at();

-- Universal quantifiable metrics (entity-independent)
create table if not exists public.measurables (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  unit text not null, -- 'percentage', 'count', 'kg', 'EUR', etc.
  data_source text,
  measurement_frequency text, -- 'daily', 'monthly', 'yearly', 'one-time'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_updated_at
  before update on public.measurables
  for each row
  execute function public.handle_updated_at();

-- Abstract policy ideas (entity-independent)
create table if not exists public.ideas (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ideas_category_id on public.ideas(category_id);

create trigger set_updated_at
  before update on public.ideas
  for each row
  execute function public.handle_updated_at();

-- Effects: idea → measurable relationships
create table if not exists public.effects (
  id uuid primary key default uuid_generate_v4(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  measurable_id uuid not null references public.measurables(id) on delete cascade,
  title text not null,
  description text,
  mechanism text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_effects_idea_id on public.effects(idea_id);
create index if not exists idx_effects_measurable_id on public.effects(measurable_id);

create trigger set_updated_at
  before update on public.effects
  for each row
  execute function public.handle_updated_at();

-- Contributions: measurable → goal relationships
create table if not exists public.contributions (
  id uuid primary key default uuid_generate_v4(),
  measurable_id uuid not null references public.measurables(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  contribution_type text not null check (contribution_type in ('direct', 'indirect', 'supporting')),
  weight numeric check (weight >= 0 and weight <= 1), -- Importance weight 0-1
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(measurable_id, goal_id)
);

create index if not exists idx_contributions_measurable_id on public.contributions(measurable_id);
create index if not exists idx_contributions_goal_id on public.contributions(goal_id);

create trigger set_updated_at
  before update on public.contributions
  for each row
  execute function public.handle_updated_at();
