-- ============================================================================
-- GOVERNMENT ADMINISTRATION DOMAIN
-- ============================================================================
-- People, administrations, and their roles
-- Dependencies: political_entities

create table if not exists public.people (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_updated_at
  before update on public.people
  for each row
  execute function public.handle_updated_at();

-- Government terms/periods
create table if not exists public.administrations (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  name text not null,
  term_start timestamptz not null,
  term_end timestamptz,
  status text not null check (status in ('active', 'historical', 'upcoming')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_administrations_entity_id on public.administrations(entity_id);
create index if not exists idx_administrations_status on public.administrations(status);

create trigger set_updated_at
  before update on public.administrations
  for each row
  execute function public.handle_updated_at();

-- Many-to-many join table with roles
create table if not exists public.administration_members (
  id uuid primary key default uuid_generate_v4(),
  administration_id uuid not null references public.administrations(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  role_type text not null check (role_type in ('mayor', 'councilor', 'minister', 'president', 'governor', 'member')),
  role_title text,
  appointed_at timestamptz not null,
  left_at timestamptz,
  status text not null check (status in ('active', 'historical')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_administration_members_administration_id on public.administration_members(administration_id);
create index if not exists idx_administration_members_person_id on public.administration_members(person_id);
create index if not exists idx_administration_members_status on public.administration_members(status);

create trigger set_updated_at
  before update on public.administration_members
  for each row
  execute function public.handle_updated_at();
