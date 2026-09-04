-- Persistent Stage 01 learner work. The existing
-- "Learners manage own stage progress" policy already restricts all operations
-- to the authenticated owner through learner_projects.user_id.
alter table public.case_progress
  add column if not exists answers jsonb not null default '{}'::jsonb,
  add column if not exists completed_tasks text[] not null default '{}';
