create table if not exists public.learner_workspace_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null check (case_id ~ '^[0-9]{3}$'),
  title text not null check (char_length(title) between 1 and 200),
  code text not null default '' check (char_length(code) <= 100000),
  active_dataset text,
  stages jsonb not null default '[]'::jsonb check (jsonb_typeof(stages) = 'array'),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists learner_workspace_projects_owner_recent
  on public.learner_workspace_projects(user_id, updated_at desc);
alter table public.learner_workspace_projects enable row level security;
create policy learner_workspace_projects_select on public.learner_workspace_projects
  for select to authenticated using (user_id = (select auth.uid()));
create policy learner_workspace_projects_insert on public.learner_workspace_projects
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy learner_workspace_projects_update on public.learner_workspace_projects
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select on public.learner_workspace_projects to authenticated;
grant insert (user_id, case_id, title, code, active_dataset, stages)
  on public.learner_workspace_projects to authenticated;
grant update (title, code, active_dataset, stages, version, updated_at)
  on public.learner_workspace_projects to authenticated;

create table if not exists public.learner_execution_jobs (
  execution_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists learner_execution_jobs_owner_recent
  on public.learner_execution_jobs(user_id, created_at desc);
alter table public.learner_execution_jobs enable row level security;
create policy learner_execution_jobs_select on public.learner_execution_jobs
  for select to authenticated using (user_id = (select auth.uid()));
create policy learner_execution_jobs_insert on public.learner_execution_jobs
  for insert to authenticated with check (user_id = (select auth.uid()));
grant select on public.learner_execution_jobs to authenticated;
grant insert (execution_id, user_id, request_id)
  on public.learner_execution_jobs to authenticated;
