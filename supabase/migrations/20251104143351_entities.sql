-- ============================================================================
-- POLITICAL GEOGRAPHY DOMAIN
-- ============================================================================
-- Political entities (cities, regions, countries) and their relationships
-- Dependencies: None (root domain)

create table if not exists public.political_entities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  avatar_url text,
  type text not null check (type in ('neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational')),
  population integer,
  score_innovation integer check (score_innovation >= 0 and score_innovation <= 10),
  score_sustainability integer check (score_sustainability >= 0 and score_sustainability <= 10),
  score_impact integer check (score_impact >= 0 and score_impact <= 10),
  identity_data jsonb,
  essential_stats jsonb,
  political_landscape jsonb,
  performance_indicators jsonb,
  community_metrics jsonb,
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
