-- Exam Hub 2.0 reusable theory, assessment-map and timed-mock foundation.
create table if not exists public.exam_theory_lessons(
 id uuid primary key default gen_random_uuid(),
 programme_id uuid not null references public.exam_programmes(id) on delete cascade,
 topic_id uuid not null references public.exam_topics(id) on delete cascade,
 code text not null,title text not null,
 objectives jsonb not null default '[]'::jsonb check(jsonb_typeof(objectives)='array'),
 content_md text not null,worked_example text not null,exam_focus text not null,
 sequence_no integer not null check(sequence_no>0),active boolean not null default true,
 created_at timestamptz not null default now(),unique(programme_id,code),unique(topic_id,sequence_no)
);
alter table public.exam_theory_lessons enable row level security;
revoke all on public.exam_theory_lessons from public,anon,authenticated;
grant select on public.exam_theory_lessons to authenticated;
grant select,insert,update,delete on public.exam_theory_lessons to service_role;
drop policy if exists "authenticated read active theory lessons" on public.exam_theory_lessons;
create policy "authenticated read active theory lessons" on public.exam_theory_lessons for select to authenticated using(active=true);

alter table public.exam_questions add column if not exists item_code text;
create unique index if not exists exam_questions_programme_item_code_uidx on public.exam_questions(programme_id,item_code) where item_code is not null;

create table if not exists public.exam_assessment_questions(
 assessment_id uuid not null references public.exam_assessments(id) on delete cascade,
 question_id uuid not null references public.exam_questions(id) on delete cascade,
 sequence_no integer not null check(sequence_no>0),points numeric not null default 1 check(points>0),
 primary key(assessment_id,question_id),unique(assessment_id,sequence_no)
);
alter table public.exam_assessment_questions enable row level security;
revoke all on public.exam_assessment_questions from public,anon,authenticated;
grant select on public.exam_assessment_questions to authenticated;
grant select,insert,update,delete on public.exam_assessment_questions to service_role;
drop policy if exists "authenticated read published assessment map" on public.exam_assessment_questions;
create policy "authenticated read published assessment map" on public.exam_assessment_questions for select to authenticated using(exists(select 1 from public.exam_assessments a where a.id=assessment_id and a.status='published'));

create table if not exists public.exam_mock_attempts(
 id uuid primary key default gen_random_uuid(),assessment_id uuid not null references public.exam_assessments(id),
 enrollment_id uuid not null references public.exam_enrollments(id),user_id uuid not null references auth.users(id),
 started_at timestamptz not null default now(),expires_at timestamptz not null,submitted_at timestamptz,
 answers jsonb not null default '{}'::jsonb check(jsonb_typeof(answers)='object'),
 score numeric,percentage numeric,passed boolean,domain_scores jsonb not null default '{}'::jsonb,
 status text not null default 'in_progress' check(status in ('in_progress','submitted','expired'))
);
alter table public.exam_mock_attempts enable row level security;
revoke all on public.exam_mock_attempts from public,anon,authenticated;
grant select,insert,update on public.exam_mock_attempts to authenticated;
grant select,insert,update,delete on public.exam_mock_attempts to service_role;
drop policy if exists "learners read own mock attempts" on public.exam_mock_attempts;
create policy "learners read own mock attempts" on public.exam_mock_attempts for select to authenticated using((select auth.uid())=user_id);
drop policy if exists "learners create own mock attempts" on public.exam_mock_attempts;
create policy "learners create own mock attempts" on public.exam_mock_attempts for insert to authenticated with check((select auth.uid())=user_id and exists(select 1 from public.exam_enrollments e where e.id=enrollment_id and e.user_id=(select auth.uid()) and e.status='active'));
drop policy if exists "learners update own live mock attempts" on public.exam_mock_attempts;
create policy "learners update own live mock attempts" on public.exam_mock_attempts for update to authenticated using((select auth.uid())=user_id and status='in_progress') with check((select auth.uid())=user_id);
