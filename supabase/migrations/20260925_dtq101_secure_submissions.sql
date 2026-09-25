-- DTQ-101 secure practical submissions. Additive migration; no existing tables modified.
create table if not exists public.practical_course_catalog (
 course_code text primary key,
 tutor_course_id bigint unique,
 enabled boolean not null default false,
 created_at timestamptz not null default now(),
 constraint practical_course_code_check check (course_code ~ '^[A-Z0-9-]{3,32}$')
);
insert into public.practical_course_catalog(course_code,enabled) values ('DTQ-101',true)
on conflict (course_code) do nothing;

create table if not exists public.practical_course_access (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_code text not null references public.practical_course_catalog(course_code),
 status text not null default 'active' check(status in ('active','revoked')),
 granted_at timestamptz not null default now(),
 primary key(user_id,course_code)
);
create table if not exists public.practical_course_reviewers (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_code text not null references public.practical_course_catalog(course_code),
 active boolean not null default true,
 primary key(user_id,course_code)
);
create table if not exists public.practical_submissions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_code text not null references public.practical_course_catalog(course_code),
 summary text not null default '',
 questionnaire_path text,
 codebook_path text,
 pilot_note_path text,
 status text not null default 'draft' check(status in ('draft','submitted','revision_requested','graded')),
 score integer check(score between 0 and 100),
 rubric_scores jsonb,
 reviewer_feedback text,
 reviewer_id uuid references auth.users(id),
 submitted_at timestamptz,
 reviewed_at timestamptz,
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(user_id,course_code)
);
create index if not exists practical_submissions_review_queue
 on public.practical_submissions(course_code,status,submitted_at);
alter table public.practical_course_catalog enable row level security;
alter table public.practical_course_access enable row level security;
alter table public.practical_course_reviewers enable row level security;
alter table public.practical_submissions enable row level security;
revoke all on public.practical_course_catalog,public.practical_course_access,public.practical_course_reviewers,public.practical_submissions from anon;
grant select on public.practical_course_catalog,public.practical_course_access,public.practical_course_reviewers,public.practical_submissions to authenticated;
create policy "catalog enabled visible" on public.practical_course_catalog for select to authenticated using (enabled);
create policy "learner may read own practical access" on public.practical_course_access for select to authenticated using (user_id = (select auth.uid()));
create policy "reviewer may read own membership" on public.practical_course_reviewers for select to authenticated using (user_id = (select auth.uid()) and active);
create policy "learner may read own submission" on public.practical_submissions for select to authenticated using (user_id = (select auth.uid()));
create policy "reviewers may read assigned course submissions" on public.practical_submissions for select to authenticated using (
 exists(select 1 from public.practical_course_reviewers r where r.course_code=practical_submissions.course_code and r.user_id=(select auth.uid()) and r.active)
);
-- Writes are exclusively through authenticated server routes after server-side entitlement/role checks.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('dtq-practical-evidence','dtq-practical-evidence',false,1048576,
 array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','text/plain'])
on conflict (id) do update set public=false,file_size_limit=1048576,allowed_mime_types=excluded.allowed_mime_types;
-- Deliberately no authenticated storage.objects policies: all uploads and short-lived downloads pass guarded server routes.
