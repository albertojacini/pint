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
