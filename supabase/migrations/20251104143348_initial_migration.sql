-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create user_profiles table (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title varchar(200) not null,
  content text not null,
  status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create post_revisions table for history tracking
create table if not exists public.post_revisions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  editor_id uuid not null references auth.users(id),
  title varchar(200) not null,
  content text not null,
  created_at timestamptz default now()
);

-- Create audit_log table
create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references auth.users(id),
  action varchar(100) not null,
  subject_type varchar(50) not null,
  subject_id uuid not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_post_revisions_post_id on public.post_revisions(post_id);
create index if not exists idx_audit_log_actor_id on public.audit_log(actor_id);
create index if not exists idx_audit_log_subject on public.audit_log(subject_type, subject_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

-- Create function to automatically create user profile on signup
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

-- Create trigger to create profile on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create categories table (hierarchical policy categories)
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

-- Create political_entities table
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

-- Create entity_relationships table (for parent/child relationships)
create table if not exists public.entity_relationships (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid not null references public.political_entities(id) on delete cascade,
  related_entity_id uuid not null references public.political_entities(id) on delete cascade,
  relationship_type text not null, -- e.g., 'parent city', 'parent region', 'parent country'
  created_at timestamptz default now(),
  unique(entity_id, related_entity_id, relationship_type)
);

-- Create policy_tags table (tag taxonomies)
create table if not exists public.policy_tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique, -- e.g., 'country', 'maturity', 'successfulness'
  description text,
  created_at timestamptz default now()
);

-- Create tag_values table (individual values within each taxonomy)
create table if not exists public.tag_values (
  id uuid primary key default uuid_generate_v4(),
  tag_id uuid not null references public.policy_tags(id) on delete cascade,
  value text not null,
  description text,
  created_at timestamptz default now(),
  unique(tag_id, value)
);

-- Create goals table
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  maslow_level text, -- Link to Maslow hierarchy if applicable
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create metrics table
create table if not exists public.metrics (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete cascade,
  title text not null,
  description text,
  unit text, -- e.g., 'percentage', 'count', 'score'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for new tables
create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_political_entities_type on public.political_entities(type);
create index if not exists idx_entity_relationships_entity_id on public.entity_relationships(entity_id);
create index if not exists idx_entity_relationships_related_entity_id on public.entity_relationships(related_entity_id);
create index if not exists idx_tag_values_tag_id on public.tag_values(tag_id);
create index if not exists idx_metrics_category_id on public.metrics(category_id);

-- Create triggers for updated_at on new tables
create trigger set_updated_at
  before update on public.categories
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.political_entities
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.goals
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.metrics
  for each row
  execute function public.handle_updated_at();