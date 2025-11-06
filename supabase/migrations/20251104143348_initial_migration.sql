-- ============================================================================
-- CORE INFRASTRUCTURE
-- ============================================================================
-- Extensions and shared functions used across all domains

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Function to update updated_at timestamp (used by all tables)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;


-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT DOMAIN
-- ============================================================================
-- Dependencies: auth.users (Supabase managed)

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- CONTENT DOMAIN
-- ============================================================================
-- Simple content for application testing (/posts routes)
-- Dependencies: auth.users only

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title varchar(200) not null,
  content text not null,
  status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();


-- ============================================================================
-- POLITICAL GEOGRAPHY DOMAIN
-- ============================================================================
-- Political entities (cities, regions, countries) and their relationships
-- Dependencies: None (root domain)

create table if not exists public.political_entities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  native_name text,
  description text,
  avatar_url text,
  type text not null check (type in ('neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational')),
  population integer,
  score_innovation integer check (score_innovation >= 0 and score_innovation <= 10),
  score_sustainability integer check (score_sustainability >= 0 and score_sustainability <= 10),
  score_impact integer check (score_impact >= 0 and score_impact <= 10),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_political_entities_type on public.political_entities(type);

create trigger set_updated_at
  before update on public.political_entities
  for each row
  execute function public.handle_updated_at();

-- Entity relationships (hierarchical: city → region → country)
create table if not exists public.entity_relationships (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  related_entity_id uuid not null references public.political_entities(id) on delete cascade,
  relationship_type text not null, -- e.g., 'parent city', 'parent region', 'parent country'
  created_at timestamptz default now(),
  unique(entity_id, related_entity_id, relationship_type)
);

create index if not exists idx_entity_relationships_entity_id on public.entity_relationships(entity_id);
create index if not exists idx_entity_relationships_related_entity_id on public.entity_relationships(related_entity_id);


-- ============================================================================
-- POLICY CLASSIFICATION DOMAIN
-- ============================================================================
-- Categories, tags, and taxonomies for organizing policies
-- Dependencies: political_entities (for category constraints)

-- Hierarchical policy categories (self-referential tree)
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references public.categories(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  only_entities_with_types text[], -- Constraint: only certain entity types can use this category
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_categories_parent_id on public.categories(parent_id);

create trigger set_updated_at
  before update on public.categories
  for each row
  execute function public.handle_updated_at();

-- Tag taxonomies (e.g., 'country', 'maturity', 'successfulness')
create table if not exists public.policy_tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Individual values within each taxonomy
create table if not exists public.tag_values (
  id uuid primary key default uuid_generate_v4(),
  tag_id uuid not null references public.policy_tags(id) on delete cascade,
  value text not null,
  description text,
  created_at timestamptz default now(),
  unique(tag_id, value)
);

create index if not exists idx_tag_values_tag_id on public.tag_values(tag_id);


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
