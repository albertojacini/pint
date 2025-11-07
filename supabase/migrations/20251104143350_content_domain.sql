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
