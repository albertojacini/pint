-- ============================================================================
-- POLICY METRICS DOMAIN
-- ============================================================================
-- Goals and metrics for measuring policy success
-- Dependencies: categories

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

create table if not exists public.metrics (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete cascade,
  title text not null,
  description text,
  unit text, -- e.g., 'percentage', 'count', 'score'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_metrics_category_id on public.metrics(category_id);

create trigger set_updated_at
  before update on public.metrics
  for each row
  execute function public.handle_updated_at();
