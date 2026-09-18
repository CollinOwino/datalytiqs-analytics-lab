-- DatalytIQs Exam & Competency Hub — Phase 1 foundation
-- Generic, versioned and exam-body neutral. Reference programme seed is intentionally
-- deferred until the KASNEB CA35P/CA36P code discrepancy is resolved.

create schema if not exists private;

create table public.exam_bodies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  name text not null,
  country_code text,
  website_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.exam_programmes (
  id uuid primary key default gen_random_uuid(),
  exam_body_id uuid not null references public.exam_bodies(id) on delete restrict,
  code text not null,
  title text not null,
  description text,
  free_topic_limit integer not null default 3 check (free_topic_limit between 0 and 99),
  status text not null default 'draft' check (status in ('draft','published','retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_body_id, code)
);

create table public.exam_syllabus_versions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exam_programmes(id) on delete restrict,
  version_label text not null,
  effective_from date,
  effective_to date,
  source_url text,
  source_checksum text,
  status text not null default 'draft' check (status in ('draft','published','superseded')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from),
  unique (programme_id, version_label)
);

create table public.exam_topics (
  id uuid primary key default gen_random_uuid(),
  syllabus_version_id uuid not null references public.exam_syllabus_versions(id) on delete cascade,
  parent_topic_id uuid references public.exam_topics(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  sequence_no integer not null check (sequence_no > 0),
  estimated_minutes integer check (estimated_minutes > 0),
  learning_outcomes jsonb not null default '[]'::jsonb check (jsonb_typeof(learning_outcomes) = 'array'),
  active boolean not null default true,
  unique (syllabus_version_id, code),
  unique (syllabus_version_id, sequence_no)
);

create table public.exam_competencies (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exam_programmes(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  domain text not null,
  proficiency_levels jsonb not null default '["developing","competent","proficient"]'::jsonb,
  active boolean not null default true,
  unique (programme_id, code)
);

create table public.exam_subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.exam_topics(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  sequence_no integer not null check (sequence_no > 0),
  learning_outcomes jsonb not null default '[]'::jsonb check (jsonb_typeof(learning_outcomes) = 'array'),
  active boolean not null default true,
  unique (topic_id, code),
  unique (topic_id, sequence_no)
);

create table public.exam_topic_competencies (
  topic_id uuid not null references public.exam_topics(id) on delete cascade,
  competency_id uuid not null references public.exam_competencies(id) on delete cascade,
  weight numeric(5,2) not null default 1 check (weight > 0),
  primary key (topic_id, competency_id)
);

create table public.exam_programme_staff (
  programme_id uuid not null references public.exam_programmes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('instructor','reviewer','administrator')),
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  primary key (programme_id, user_id, role)
);

create table public.exam_enrollments (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exam_programmes(id) on delete restrict,
  syllabus_version_id uuid not null references public.exam_syllabus_versions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','completed','withdrawn')),
  target_exam_date date,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (programme_id, user_id)
);

create table public.exam_access_grants (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exam_programmes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_level text not null check (access_level in ('full','topic')),
  topic_id uuid references public.exam_topics(id) on delete cascade,
  source text not null check (source in ('subscription','purchase','voucher','organization','administrator')),
  source_reference text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check ((access_level = 'topic' and topic_id is not null) or (access_level = 'full' and topic_id is null)),
  check (expires_at is null or expires_at > starts_at)
);

create unique index exam_access_grants_source_unique
  on public.exam_access_grants(user_id, programme_id, source, source_reference)
  where source_reference is not null;

create table public.exam_study_plans (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_minutes integer not null check (weekly_minutes between 30 and 10080),
  generated_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','completed','replaced'))
);

create unique index exam_study_plans_one_active_idx
  on public.exam_study_plans(enrollment_id) where status = 'active';

create table public.exam_study_plan_items (
  id uuid primary key default gen_random_uuid(),
  study_plan_id uuid not null references public.exam_study_plans(id) on delete cascade,
  topic_id uuid not null references public.exam_topics(id) on delete restrict,
  due_on date not null,
  planned_minutes integer not null check (planned_minutes > 0),
  status text not null default 'planned' check (status in ('planned','in_progress','completed','skipped')),
  completed_at timestamptz,
  unique (study_plan_id, topic_id)
);

create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exam_programmes(id) on delete cascade,
  syllabus_version_id uuid not null references public.exam_syllabus_versions(id) on delete restrict,
  topic_id uuid not null references public.exam_topics(id) on delete restrict,
  question_type text not null check (question_type in ('single_choice','multiple_choice','numeric','short_text','case_study','practical')),
  stem text not null,
  options jsonb check (options is null or jsonb_typeof(options) = 'array'),
  difficulty text not null check (difficulty in ('foundation','intermediate','advanced')),
  provenance text not null check (provenance in ('original','licensed','examiner_style')),
  rights_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','published','retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.exam_question_keys (
  question_id uuid primary key references public.exam_questions(id) on delete cascade,
  answer_key jsonb not null,
  rubric jsonb not null default '{}'::jsonb,
  explanation text,
  reviewed_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.exam_question_competencies (
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  competency_id uuid not null references public.exam_competencies(id) on delete cascade,
  weight numeric(5,2) not null default 1 check (weight > 0),
  primary key (question_id, competency_id)
);

create table public.exam_assessments (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exam_programmes(id) on delete cascade,
  syllabus_version_id uuid not null references public.exam_syllabus_versions(id) on delete restrict,
  title text not null,
  assessment_type text not null check (assessment_type in ('diagnostic','topic','mock','practical')),
  time_limit_minutes integer check (time_limit_minutes > 0),
  pass_mark numeric(5,2) not null default 50 check (pass_mark between 0 and 100),
  max_attempts integer check (max_attempts is null or max_attempts > 0),
  status text not null default 'draft' check (status in ('draft','published','retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.exam_assessment_items (
  assessment_id uuid not null references public.exam_assessments(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete restrict,
  sequence_no integer not null check (sequence_no > 0),
  points numeric(8,2) not null default 1 check (points > 0),
  primary key (assessment_id, question_id),
  unique (assessment_id, sequence_no)
);

create table public.exam_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.exam_assessments(id) on delete restrict,
  enrollment_id uuid not null references public.exam_enrollments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_no integer not null check (attempt_no > 0),
  status text not null default 'in_progress' check (status in ('in_progress','submitted','graded','voided')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  score numeric(8,2),
  percentage numeric(5,2) check (percentage is null or percentage between 0 and 100),
  passed boolean,
  integrity_metadata jsonb not null default '{}'::jsonb,
  unique (assessment_id, user_id, attempt_no)
);

create table public.exam_assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_assessment_attempts(id) on delete restrict,
  question_id uuid not null references public.exam_questions(id) on delete restrict,
  response jsonb not null,
  awarded_points numeric(8,2),
  grader_feedback text,
  graded_by uuid references auth.users(id) on delete set null,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table public.exam_competency_evidence (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  competency_id uuid not null references public.exam_competencies(id) on delete restrict,
  source_type text not null check (source_type in ('assessment','practical','instructor_review')),
  source_id uuid not null,
  score numeric(5,2) not null check (score between 0 and 100),
  recorded_at timestamptz not null default now(),
  unique (user_id, competency_id, source_type, source_id)
);

create table public.exam_recommendations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.exam_topics(id) on delete cascade,
  competency_id uuid references public.exam_competencies(id) on delete cascade,
  reason text not null,
  priority integer not null default 3 check (priority between 1 and 5),
  status text not null default 'open' check (status in ('open','accepted','completed','dismissed')),
  generated_at timestamptz not null default now()
);

create table public.exam_practical_submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.exam_topics(id) on delete restrict,
  artifact_uri text,
  response jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('draft','submitted','reviewed','revision_required')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  feedback text
);

create index exam_topics_syllabus_sequence_idx on public.exam_topics(syllabus_version_id, sequence_no);
create index exam_enrollments_user_idx on public.exam_enrollments(user_id, status);
create index exam_access_grants_user_idx on public.exam_access_grants(user_id, programme_id, expires_at) where revoked_at is null;
create index exam_attempts_user_idx on public.exam_assessment_attempts(user_id, started_at desc);
create index exam_evidence_user_competency_idx on public.exam_competency_evidence(user_id, competency_id, recorded_at desc);

create or replace function public.is_exam_programme_staff(p_programme_id uuid, p_roles text[] default array['instructor','reviewer','administrator'])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.exam_programme_staff s
    where s.programme_id = p_programme_id and s.user_id = (select auth.uid())
      and s.active and s.role = any(p_roles)
  )
$$;

create or replace function public.can_access_exam_topic(p_topic_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.exam_topics t
    join public.exam_syllabus_versions sv on sv.id = t.syllabus_version_id
    join public.exam_programmes p on p.id = sv.programme_id
    where t.id = p_topic_id and t.active and sv.status = 'published' and p.status = 'published'
      and (
        t.sequence_no <= p.free_topic_limit
        or public.is_exam_programme_staff(p.id)
        or exists (
          select 1 from public.exam_access_grants g
          where g.user_id = (select auth.uid()) and g.programme_id = p.id
            and g.revoked_at is null and g.starts_at <= now()
            and (g.expires_at is null or g.expires_at > now())
            and (g.access_level = 'full' or g.topic_id = t.id)
        )
      )
  )
$$;

-- Keep published syllabus records immutable; publish a new version instead.
create or replace function public.protect_published_exam_syllabus()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.status in ('published','superseded') then
    raise exception 'Published syllabus versions are immutable; create a new version';
  end if;
  return new;
end $$;
create trigger protect_published_exam_syllabus before update or delete on public.exam_syllabus_versions
for each row execute function public.protect_published_exam_syllabus();

create or replace function public.protect_published_exam_topic()
returns trigger language plpgsql set search_path = '' as $$
declare v_version_id uuid;
begin
  v_version_id := case when tg_op = 'DELETE' then old.syllabus_version_id else new.syllabus_version_id end;
  if exists (
    select 1 from public.exam_syllabus_versions
    where id = v_version_id and status in ('published','superseded')
  ) then
    raise exception 'Topics in a published syllabus are immutable; create a new version';
  end if;
  return coalesce(new, old);
end $$;
create trigger protect_published_exam_topic before insert or update or delete on public.exam_topics
for each row execute function public.protect_published_exam_topic();

create or replace function public.protect_published_exam_subtopic()
returns trigger language plpgsql set search_path = '' as $$
declare v_topic_id uuid;
begin
  v_topic_id := case when tg_op = 'DELETE' then old.topic_id else new.topic_id end;
  if exists (
    select 1 from public.exam_topics t
    join public.exam_syllabus_versions sv on sv.id = t.syllabus_version_id
    where t.id = v_topic_id and sv.status in ('published','superseded')
  ) then
    raise exception 'Subtopics in a published syllabus are immutable; create a new version';
  end if;
  return coalesce(new, old);
end $$;
create trigger protect_published_exam_subtopic before insert or update or delete on public.exam_subtopics
for each row execute function public.protect_published_exam_subtopic();

alter table public.exam_bodies enable row level security;
alter table public.exam_programmes enable row level security;
alter table public.exam_syllabus_versions enable row level security;
alter table public.exam_topics enable row level security;
alter table public.exam_competencies enable row level security;
alter table public.exam_subtopics enable row level security;
alter table public.exam_topic_competencies enable row level security;
alter table public.exam_programme_staff enable row level security;
alter table public.exam_enrollments enable row level security;
alter table public.exam_access_grants enable row level security;
alter table public.exam_study_plans enable row level security;
alter table public.exam_study_plan_items enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_question_competencies enable row level security;
alter table public.exam_assessments enable row level security;
alter table public.exam_assessment_items enable row level security;
alter table public.exam_assessment_attempts enable row level security;
alter table public.exam_assessment_responses enable row level security;
alter table public.exam_competency_evidence enable row level security;
alter table public.exam_recommendations enable row level security;
alter table public.exam_practical_submissions enable row level security;
alter table private.exam_question_keys enable row level security;

create policy exam_bodies_read on public.exam_bodies for select to authenticated using (active);
create policy exam_programmes_read on public.exam_programmes for select to authenticated using (status = 'published' or public.is_exam_programme_staff(id));
create policy exam_syllabus_read on public.exam_syllabus_versions for select to authenticated using (status = 'published' or public.is_exam_programme_staff(programme_id));
create policy exam_topics_read on public.exam_topics for select to authenticated using (public.can_access_exam_topic(id));
create policy exam_competencies_read on public.exam_competencies for select to authenticated using (exists(select 1 from public.exam_programmes p where p.id=programme_id and (p.status='published' or public.is_exam_programme_staff(p.id))));
create policy exam_subtopics_read on public.exam_subtopics for select to authenticated using (exists(select 1 from public.exam_topics t where t.id=topic_id and public.can_access_exam_topic(t.id)));
create policy exam_topic_competencies_read on public.exam_topic_competencies for select to authenticated using (public.can_access_exam_topic(topic_id));
create policy exam_staff_read on public.exam_programme_staff for select to authenticated using (user_id=(select auth.uid()) or public.is_exam_programme_staff(programme_id,array['administrator']));
create policy exam_enrollments_own_read on public.exam_enrollments for select to authenticated using (user_id=(select auth.uid()) or public.is_exam_programme_staff(programme_id));
create policy exam_enrollments_own_insert on public.exam_enrollments for insert to authenticated with check (user_id=(select auth.uid()));
create policy exam_access_grants_own_read on public.exam_access_grants for select to authenticated using (user_id=(select auth.uid()) or public.is_exam_programme_staff(programme_id,array['administrator']));
create policy exam_study_plans_own_read on public.exam_study_plans for select to authenticated using (user_id=(select auth.uid()));
create policy exam_study_plan_items_own_read on public.exam_study_plan_items for select to authenticated using (exists(select 1 from public.exam_study_plans p where p.id=study_plan_id and p.user_id=(select auth.uid())));
create policy exam_questions_access_read on public.exam_questions for select to authenticated using (status='published' and public.can_access_exam_topic(topic_id) or public.is_exam_programme_staff(programme_id));
create policy exam_question_competencies_read on public.exam_question_competencies for select to authenticated using (exists(select 1 from public.exam_questions q where q.id=question_id and (q.status='published' and public.can_access_exam_topic(q.topic_id) or public.is_exam_programme_staff(q.programme_id))));
create policy exam_assessments_read on public.exam_assessments for select to authenticated using (status='published' or public.is_exam_programme_staff(programme_id));
create policy exam_assessment_items_read on public.exam_assessment_items for select to authenticated using (exists(select 1 from public.exam_assessments a where a.id=assessment_id and (a.status='published' or public.is_exam_programme_staff(a.programme_id))));
create policy exam_attempts_own_read on public.exam_assessment_attempts for select to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.exam_assessments a where a.id=assessment_id and public.is_exam_programme_staff(a.programme_id)));
create policy exam_responses_own_read on public.exam_assessment_responses for select to authenticated using (exists(select 1 from public.exam_assessment_attempts a where a.id=attempt_id and (a.user_id=(select auth.uid()) or exists(select 1 from public.exam_assessments x where x.id=a.assessment_id and public.is_exam_programme_staff(x.programme_id)))));
create policy exam_evidence_own_read on public.exam_competency_evidence for select to authenticated using (user_id=(select auth.uid()));
create policy exam_recommendations_own_read on public.exam_recommendations for select to authenticated using (user_id=(select auth.uid()));
create policy exam_practicals_own_read on public.exam_practical_submissions for select to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.exam_enrollments e where e.id=enrollment_id and public.is_exam_programme_staff(e.programme_id)));

-- Writes for questions, keys, grading, grants, evidence and recommendations are service/RPC only.
grant select on public.exam_bodies, public.exam_programmes, public.exam_syllabus_versions, public.exam_topics,
  public.exam_competencies, public.exam_subtopics, public.exam_topic_competencies, public.exam_programme_staff, public.exam_enrollments,
  public.exam_access_grants, public.exam_study_plans, public.exam_study_plan_items, public.exam_questions,
  public.exam_question_competencies, public.exam_assessments, public.exam_assessment_items,
  public.exam_assessment_attempts, public.exam_assessment_responses, public.exam_competency_evidence,
  public.exam_recommendations, public.exam_practical_submissions to authenticated;
grant insert on public.exam_enrollments to authenticated;
revoke all on private.exam_question_keys from public, anon, authenticated;
revoke all on function public.is_exam_programme_staff(uuid,text[]) from public, anon;
revoke all on function public.can_access_exam_topic(uuid) from public, anon;
grant execute on function public.is_exam_programme_staff(uuid,text[]) to authenticated;
grant execute on function public.can_access_exam_topic(uuid) to authenticated;

comment on schema private is 'Non-Data-API schema for secrets and assessment answer keys.';
comment on table private.exam_question_keys is 'Never readable by learners; grading services/RPCs only.';
comment on table public.exam_access_grants is 'Server-authoritative programme/topic entitlements originating from commerce or administrators.';
