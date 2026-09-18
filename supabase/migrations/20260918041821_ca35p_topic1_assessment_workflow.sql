create table if not exists public.exam_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.exam_topics(id) on delete cascade,
  attempt_no integer not null check (attempt_no > 0),
  answers jsonb not null,
  score integer not null check (score between 0 and 5),
  max_score integer not null default 5 check (max_score = 5),
  percentage numeric(5,2) generated always as ((score::numeric / max_score) * 100) stored,
  passed boolean generated always as (score >= 4) stored,
  feedback text not null,
  submitted_at timestamptz not null default now(),
  unique (enrollment_id, topic_id, attempt_no)
);

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

create table if not exists public.exam_quiz_answer_keys (
  topic_id uuid not null references public.exam_topics(id) on delete cascade,
  question_code text not null,
  correct_option text not null,
  primary key (topic_id, question_code)
);

create index if not exists exam_quiz_attempts_owner_idx on public.exam_quiz_attempts(user_id, topic_id, submitted_at desc);
create index if not exists exam_topic_practicals_owner_idx on public.exam_topic_practical_submissions(user_id, topic_id, submitted_at desc);

alter table public.exam_quiz_attempts enable row level security;
alter table public.exam_topic_practical_submissions enable row level security;
alter table public.exam_quiz_answer_keys enable row level security;

create policy "Learners read own quiz attempts"
on public.exam_quiz_attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners read own practical submissions"
on public.exam_topic_practical_submissions for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.exam_quiz_answer_keys from public, anon, authenticated;
revoke insert, update, delete on public.exam_quiz_attempts from anon, authenticated;
revoke insert, update, delete on public.exam_topic_practical_submissions from anon, authenticated;
grant select on public.exam_quiz_attempts, public.exam_topic_practical_submissions to authenticated;

insert into public.exam_quiz_answer_keys(topic_id, question_code, correct_option)
select topic.id, answer.question_code, answer.correct_option
from public.exam_topics topic
cross join (values ('q1','b'),('q2','a'),('q3','b'),('q4','b'),('q5','a')) as answer(question_code, correct_option)
where topic.code = '1.0'
on conflict (topic_id, question_code) do update set correct_option = excluded.correct_option;

create or replace function public.submit_ca35p_topic1_quiz(p_answers jsonb)
returns table(attempt_no integer, score integer, max_score integer, percentage numeric, passed boolean, feedback text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_topic uuid;
  v_enrollment uuid;
  v_attempt integer;
  v_score integer;
  v_feedback text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(p_answers) <> 'object' or jsonb_object_length(p_answers) <> 5 then
    raise exception 'All five answers are required';
  end if;

  select topic.id into v_topic from public.exam_topics topic where topic.code = '1.0' and topic.active = true;
  select enrollment.id into v_enrollment
  from public.exam_enrollments enrollment
  join public.exam_syllabi syllabus on syllabus.id = enrollment.syllabus_id
  join public.exam_programmes programme on programme.id = syllabus.programme_id
  where enrollment.user_id = v_user and enrollment.status = 'active' and programme.code = 'CA35P'
  limit 1;
  if v_topic is null or v_enrollment is null then raise exception 'Active CA35P enrolment required'; end if;

  select count(*)::integer into v_score
  from public.exam_quiz_answer_keys answer
  where answer.topic_id = v_topic
    and p_answers ->> answer.question_code = answer.correct_option;

  select coalesce(max(existing.attempt_no),0)+1 into v_attempt
  from public.exam_quiz_attempts existing
  where existing.enrollment_id = v_enrollment and existing.topic_id = v_topic;

  v_feedback := case
    when v_score = 5 then 'Excellent. You demonstrated complete control of the Topic 1 principles.'
    when v_score = 4 then 'Competent. Review the worked examples before attempting the practical submission.'
    when v_score = 3 then 'Developing. Revisit conditional analysis and model-control concepts, then retry.'
    else 'Further study required. Work through all three lessons and exercises before retrying.'
  end;

  insert into public.exam_quiz_attempts(enrollment_id,user_id,topic_id,attempt_no,answers,score,feedback)
  values(v_enrollment,v_user,v_topic,v_attempt,p_answers,v_score,v_feedback);

  return query select v_attempt,v_score,5,(v_score::numeric/5)*100,(v_score>=4),v_feedback;
end;
$$;

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

revoke all on function public.submit_ca35p_topic1_quiz(jsonb) from public, anon;
revoke all on function public.submit_ca35p_topic1_practical(text,text) from public, anon;
grant execute on function public.submit_ca35p_topic1_quiz(jsonb) to authenticated;
grant execute on function public.submit_ca35p_topic1_practical(text,text) to authenticated;

comment on table public.exam_quiz_answer_keys is 'Protected assessment answer keys; never exposed through the learner API.';
comment on function public.submit_ca35p_topic1_quiz(jsonb) is 'Scores a complete CA35P Topic 1 quiz using protected answer keys.';
