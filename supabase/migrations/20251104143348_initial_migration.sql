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