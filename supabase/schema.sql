-- Run once in the Supabase SQL editor.
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique,
  nickname text not null check (char_length(nickname) between 3 and 12),
  score integer not null check (score between 0 and 10000),
  survival_time numeric(4, 1) not null check (survival_time between 0 and 60),
  outcome text not null check (outcome in ('gameover', 'victory')),
  phase_index smallint not null check (phase_index between 0 and 5),
  near_misses integer not null default 0 check (near_misses >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_rank_idx on public.scores (score desc, created_at asc);
create index if not exists scores_created_idx on public.scores (created_at desc);
create index if not exists scores_ip_idx on public.scores (ip_hash, created_at desc);

-- No policies on purpose: only the server (service role key) can read or write.
alter table public.scores enable row level security;
