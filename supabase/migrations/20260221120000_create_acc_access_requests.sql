create table acc_access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  message text,
  created_at timestamptz not null default now()
);

-- Allow anonymous inserts (public form)
alter table acc_access_requests enable row level security;
create policy "Anyone can request access"
  on acc_access_requests for insert
  with check (true);
