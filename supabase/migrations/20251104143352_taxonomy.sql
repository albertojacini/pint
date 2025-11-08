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
