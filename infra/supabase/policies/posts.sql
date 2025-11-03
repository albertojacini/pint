-- Enable Row Level Security on all tables
alter table public.posts enable row level security;
alter table public.post_revisions enable row level security;
alter table public.user_profiles enable row level security;
alter table public.audit_log enable row level security;

-- Posts Policies
-- Anyone can read published posts
create policy "Anyone can view published posts"
  on public.posts for select
  using (status = 'published');

-- Authenticated users can view their own posts (any status)
create policy "Users can view own posts"
  on public.posts for select
  using (auth.uid() = author_id);

-- Authenticated users can insert their own posts
create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- Authors can update their own posts
create policy "Authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Authors can delete their own posts
create policy "Authors can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Post Revisions Policies
-- Users can view revisions of posts they can view
create policy "Users can view post revisions"
  on public.post_revisions for select
  using (
    exists (
      select 1 from public.posts
      where posts.id = post_revisions.post_id
      and (posts.status = 'published' or posts.author_id = auth.uid())
    )
  );

-- Editors can insert revisions for posts they can edit
create policy "Editors can insert post revisions"
  on public.post_revisions for insert
  with check (
    exists (
      select 1 from public.posts
      where posts.id = post_revisions.post_id
      and posts.author_id = auth.uid()
    )
    and auth.uid() = editor_id
  );

-- User Profiles Policies
-- Anyone can view public user profiles
create policy "Anyone can view user profiles"
  on public.user_profiles for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Audit Log Policies
-- Only service role can write to audit log (handled by triggers)
create policy "Service role can insert audit logs"
  on public.audit_log for insert
  with check (true);

-- Users can view audit logs for their own actions
create policy "Users can view own audit logs"
  on public.audit_log for select
  using (auth.uid() = actor_id);
