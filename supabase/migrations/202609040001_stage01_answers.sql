alter table public.case_progress
  add column if not exists answers jsonb not null default '{}'::jsonb,
  add column if not exists completed_tasks text[] not null default '{}';

alter table public.case_progress enable row level security;

drop policy if exists "Learners can read their own progress" on public.case_progress;
create policy "Learners can read their own progress" on public.case_progress for select to authenticated
using (exists (select 1 from public.learner_projects p where p.id = case_progress.project_id and p.user_id = (select auth.uid())));

drop policy if exists "Learners can update their own progress" on public.case_progress;
create policy "Learners can update their own progress" on public.case_progress for update to authenticated
using (exists (select 1 from public.learner_projects p where p.id = case_progress.project_id and p.user_id = (select auth.uid())))
with check (exists (select 1 from public.learner_projects p where p.id = case_progress.project_id and p.user_id = (select auth.uid())));
