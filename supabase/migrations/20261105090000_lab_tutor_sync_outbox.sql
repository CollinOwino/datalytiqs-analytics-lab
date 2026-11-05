create table if not exists public.lab_tutor_sync_outbox (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (char_length(idempotency_key) <= 200),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.learner_workspace_projects(id) on delete cascade,
  case_id text not null check (case_id ~ '^\d{3}$'),
  event_type text not null check (event_type in ('lab_pathway_completed')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','retry','delivered')),
  attempts integer not null default 0 check (attempts between 0 and 20),
  last_attempt_at timestamptz,
  last_error text check (char_length(last_error) <= 500),
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lab_tutor_sync_outbox enable row level security;
revoke all on public.lab_tutor_sync_outbox from anon, authenticated;
grant select on public.lab_tutor_sync_outbox to authenticated;
grant all on public.lab_tutor_sync_outbox to service_role;

drop policy if exists "owners_read_tutor_sync" on public.lab_tutor_sync_outbox;
create policy "owners_read_tutor_sync" on public.lab_tutor_sync_outbox
for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists lab_tutor_sync_pending_idx
on public.lab_tutor_sync_outbox (status, created_at)
where status in ('pending','retry');
