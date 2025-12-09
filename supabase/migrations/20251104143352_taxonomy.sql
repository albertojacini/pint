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

-- Unified tags table for all content types
create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique, -- URL-friendly version
  description text,
  category text, -- 'policy-topic', 'geographic', 'impact-area', 'maturity'
  metadata jsonb default '{}', -- Flexible field for tag-specific data
  usage_count integer default 0, -- Track popularity
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Polymorphic tagging junction table
create table if not exists public.taggables (
  id uuid primary key default uuid_generate_v4(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  taggable_type text not null, -- 'entity', 'provision', 'idea', 'event', 'administration'
  taggable_id uuid not null, -- ID of the tagged item
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique(tag_id, taggable_type, taggable_id)
);

-- Indexes for performance
create index if not exists idx_tags_slug on public.tags(slug);
create index if not exists idx_tags_category on public.tags(category);
create index if not exists idx_tags_name_trgm on public.tags using gin(name gin_trgm_ops); -- For fuzzy search
create index if not exists idx_taggables_tag_id on public.taggables(tag_id);
create index if not exists idx_taggables_taggable on public.taggables(taggable_type, taggable_id);

-- Update usage_count trigger
create or replace function update_tag_usage_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update tags set usage_count = usage_count + 1 where id = NEW.tag_id;
  elsif TG_OP = 'DELETE' then
    update tags set usage_count = usage_count - 1 where id = OLD.tag_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_tag_count_on_taggable_change
  after insert or delete on public.taggables
  for each row
  execute function update_tag_usage_count();

create trigger set_updated_at_tags
  before update on public.tags
  for each row
  execute function public.handle_updated_at();
