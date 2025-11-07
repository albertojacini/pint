-- ============================================================================
-- POLICY METRICS DOMAIN
-- ============================================================================
-- Goals for measuring policy success
-- Dependencies: none

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
