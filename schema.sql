create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  session_id text unique,
  name text, email text, phone text,
  product_asked text,
  meeting_time timestamptz,
  needs_human boolean default false,
  chat_history jsonb default '[]',
  source text default 'web',
  created_at timestamptz default now()
);
alter table leads enable row level security; -- only the server (service role) touches it
