-- The platform already has a generic practical-submission table with a
-- different evidence schema. Keep that workflow intact and isolate the
-- CA35P Topic 1 assessment contract in its own table.
drop policy if exists "Learners read own practical submissions" on public.exam_practical_submissions;

create table if not exists public.exam_topic_practical_submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.exam_topics(id) on delete cascade,
  summary text not null check (char_length(summary) between 80 and 3000),
  evidence_link text,
  status text not null default 'submitted' check (status in ('submitted','under_review','revision_required','competent')),
  score integer check (score between 0 and 20),
  reviewer_feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists exam_topic_practicals_owner_idx
on public.exam_topic_practical_submissions(user_id, topic_id, submitted_at desc);

alter table public.exam_topic_practical_submissions enable row level security;
drop policy if exists "Learners read own topic practical submissions" on public.exam_topic_practical_submissions;
create policy "Learners read own topic practical submissions"
on public.exam_topic_practical_submissions for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.exam_topic_practical_submissions from anon;
revoke insert, update, delete on public.exam_topic_practical_submissions from authenticated;
grant select on public.exam_topic_practical_submissions to authenticated;

create or replace function public.submit_ca35p_topic1_practical(p_summary text, p_evidence_link text default null)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_topic uuid;
  v_enrollment uuid;
  v_submission uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if char_length(trim(coalesce(p_summary,''))) not between 80 and 3000 then raise exception 'Summary must contain 80 to 3000 characters'; end if;
  if nullif(trim(coalesce(p_evidence_link,'')),'') is not null and trim(p_evidence_link) !~ '^https://[^[:space:]]+$' then raise exception 'Evidence link must be a valid HTTPS URL'; end if;
  select topic.id into v_topic from public.exam_topics topic where topic.code = '1.0' and topic.active = true;
  select enrollment.id into v_enrollment
  from public.exam_enrollments enrollment
  join public.exam_syllabi syllabus on syllabus.id = enrollment.syllabus_id
  join public.exam_programmes programme on programme.id = syllabus.programme_id
  where enrollment.user_id = v_user and enrollment.status = 'active' and programme.code = 'CA35P'
  limit 1;
  if v_topic is null or v_enrollment is null then raise exception 'Active CA35P enrolment required'; end if;
  insert into public.exam_topic_practical_submissions(enrollment_id,user_id,topic_id,summary,evidence_link)
  values(v_enrollment,v_user,v_topic,trim(p_summary),nullif(trim(coalesce(p_evidence_link,'')),''))
  returning id into v_submission;
  return v_submission;
end;
$$;

revoke all on function public.submit_ca35p_topic1_practical(text,text) from public, anon;
grant execute on function public.submit_ca35p_topic1_practical(text,text) to authenticated;
