-- Young Analysts persistent competency schema
-- Apply through Supabase migration tooling before enabling real learner writes.

create table if not exists public.young_analyst_lesson_progress(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 track_slug text not null, module_code text not null, lesson_code text not null, status text not null check(status in('started','completed')),
 completed_at timestamptz, created_at timestamptz not null default now(), unique(user_id,lesson_code)
);
create table if not exists public.young_analyst_evidence(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 track_slug text not null,module_code text not null,title text not null,evidence_text text not null,reflection text not null,dataset_id text,
 status text not null default 'submitted' check(status in('submitted','revision_needed','competent')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.young_analyst_quiz_attempts(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 track_slug text not null,module_code text not null,attempt_no integer not null check(attempt_no>0),score integer not null check(score between 0 and 100),
 passed boolean not null,answers jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),unique(user_id,module_code,attempt_no)
);
create table if not exists public.young_analyst_reviews(
 id uuid primary key default gen_random_uuid(),evidence_id uuid not null references public.young_analyst_evidence(id) on delete cascade,
 reviewer_id uuid not null references auth.users(id),method_score integer not null check(method_score between 0 and 3),
 testing_score integer not null check(testing_score between 0 and 3),reasoning_score integer not null check(reasoning_score between 0 and 3),
 responsible_score integer not null check(responsible_score between 0 and 3),total_score integer not null check(total_score between 0 and 12),
 decision text not null check(decision in('revision_needed','competent')),feedback text not null default '',created_at timestamptz not null default now()
);
create table if not exists public.young_analyst_competency_state(
 user_id uuid not null references auth.users(id) on delete cascade,track_slug text not null,module_code text not null,
 status text not null default 'learning' check(status in('learning','evidence_submitted','revision_needed','competent')),
 latest_evidence_id uuid references public.young_analyst_evidence(id),rubric_score integer check(rubric_score between 0 and 12),
 updated_at timestamptz not null default now(),primary key(user_id,track_slug,module_code)
);

alter table public.young_analyst_lesson_progress enable row level security;
alter table public.young_analyst_evidence enable row level security;
alter table public.young_analyst_quiz_attempts enable row level security;
alter table public.young_analyst_reviews enable row level security;
alter table public.young_analyst_competency_state enable row level security;

create policy "YA learner reads own lessons" on public.young_analyst_lesson_progress for select using(auth.uid()=user_id);
create policy "YA learner writes own lessons" on public.young_analyst_lesson_progress for insert with check(auth.uid()=user_id);
create policy "YA learner updates own lessons" on public.young_analyst_lesson_progress for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "YA learner reads own evidence" on public.young_analyst_evidence for select using(auth.uid()=user_id);
create policy "YA learner submits own evidence" on public.young_analyst_evidence for insert with check(auth.uid()=user_id);
create policy "YA learner reads own quiz attempts" on public.young_analyst_quiz_attempts for select using(auth.uid()=user_id);
create policy "YA learner submits own quiz attempts" on public.young_analyst_quiz_attempts for insert with check(auth.uid()=user_id);
create policy "YA learner reads own competency" on public.young_analyst_competency_state for select using(auth.uid()=user_id);
create policy "YA learner creates own competency" on public.young_analyst_competency_state for insert with check(auth.uid()=user_id);
create policy "YA learner updates own competency" on public.young_analyst_competency_state for update using(auth.uid()=user_id) with check(auth.uid()=user_id);

-- Instructor access is intentionally NOT granted by a broad authenticated policy.
-- Add institution/cohort membership policies only after the role relationship tables are verified.
