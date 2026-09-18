-- Correct the generic topic-code validator deployed in the preceding migration.

create or replace function public.submit_ca35p_topic_quiz(p_topic_code text, p_answers jsonb)
returns table(attempt_no integer, score integer, max_score integer, percentage numeric, passed boolean, feedback text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_topic uuid;
  v_syllabus uuid;
  v_enrollment uuid;
  v_attempt integer;
  v_score integer;
  v_feedback text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_topic_code !~ '^[1-5]\.0$' then raise exception 'Invalid CA35P topic'; end if;
  if jsonb_typeof(p_answers) <> 'object'
    or (select count(*) from jsonb_object_keys(p_answers)) <> 5
    or not (p_answers ?& array['q1','q2','q3','q4','q5'])
    or exists (select 1 from jsonb_each_text(p_answers) answer where answer.value not in ('a','b','c','d')) then
    raise exception 'A valid answer is required for all five questions';
  end if;

  select topic.id, topic.syllabus_version_id into v_topic, v_syllabus
  from public.exam_topics topic
  join public.exam_syllabus_versions syllabus on syllabus.id = topic.syllabus_version_id
  join public.exam_programmes programme on programme.id = syllabus.programme_id
  where topic.code = p_topic_code and topic.active = true
    and syllabus.status = 'published' and programme.code = 'CA35P' and programme.status = 'published'
  limit 1;
  if v_topic is null or not public.can_access_exam_topic(v_topic) then raise exception 'Topic access required'; end if;

  select enrollment.id into v_enrollment from public.exam_enrollments enrollment
  where enrollment.user_id = v_user and enrollment.status = 'active' and enrollment.syllabus_version_id = v_syllabus limit 1;
  if v_enrollment is null then raise exception 'Active CA35P enrolment required'; end if;

  select count(*)::integer into v_score from public.exam_quiz_answer_keys answer
  where answer.topic_id = v_topic and p_answers ->> answer.question_code = answer.correct_option;
  if (select count(*) from public.exam_quiz_answer_keys answer where answer.topic_id = v_topic) <> 5 then
    raise exception 'Assessment is not configured';
  end if;
  select coalesce(max(existing.attempt_no), 0) + 1 into v_attempt from public.exam_quiz_attempts existing
  where existing.enrollment_id = v_enrollment and existing.topic_id = v_topic;
  v_feedback := case when v_score = 5 then 'Excellent. You demonstrated complete control of this topic.' when v_score = 4 then 'Competent. Review the worked examples before completing the practical submission.' when v_score = 3 then 'Developing. Revisit the lessons and applied exercises, then retry.' else 'Further study required. Work through every lesson and answer guide before retrying.' end;
  insert into public.exam_quiz_attempts(enrollment_id, user_id, topic_id, attempt_no, answers, score, feedback)
  values(v_enrollment, v_user, v_topic, v_attempt, p_answers, v_score, v_feedback);
  return query select v_attempt, v_score, 5, (v_score::numeric / 5) * 100, (v_score >= 4), v_feedback;
end;
$$;

create or replace function public.submit_ca35p_topic_practical(p_topic_code text, p_summary text, p_evidence_link text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := (select auth.uid());
  v_topic uuid;
  v_syllabus uuid;
  v_enrollment uuid;
  v_submission uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_topic_code !~ '^[1-5]\.0$' then raise exception 'Invalid CA35P topic'; end if;
  if char_length(trim(coalesce(p_summary, ''))) not between 80 and 3000 then raise exception 'Summary must contain 80 to 3000 characters'; end if;
  if nullif(trim(coalesce(p_evidence_link, '')), '') is not null and trim(p_evidence_link) !~ '^https://[^[:space:]]+$' then raise exception 'Evidence link must be a valid HTTPS URL'; end if;
  select topic.id, topic.syllabus_version_id into v_topic, v_syllabus
  from public.exam_topics topic join public.exam_syllabus_versions syllabus on syllabus.id = topic.syllabus_version_id
  join public.exam_programmes programme on programme.id = syllabus.programme_id
  where topic.code = p_topic_code and topic.active = true and syllabus.status = 'published' and programme.code = 'CA35P' and programme.status = 'published' limit 1;
  if v_topic is null or not public.can_access_exam_topic(v_topic) then raise exception 'Topic access required'; end if;
  select enrollment.id into v_enrollment from public.exam_enrollments enrollment
  where enrollment.user_id = v_user and enrollment.status = 'active' and enrollment.syllabus_version_id = v_syllabus limit 1;
  if v_enrollment is null then raise exception 'Active CA35P enrolment required'; end if;
  insert into public.exam_topic_practical_submissions(enrollment_id, user_id, topic_id, summary, evidence_link)
  values(v_enrollment, v_user, v_topic, trim(p_summary), nullif(trim(coalesce(p_evidence_link, '')), '')) returning id into v_submission;
  return v_submission;
end;
$$;

revoke all on function public.submit_ca35p_topic_quiz(text, jsonb) from public, anon;
revoke all on function public.submit_ca35p_topic_practical(text, text, text) from public, anon;
grant execute on function public.submit_ca35p_topic_quiz(text, jsonb) to authenticated;
grant execute on function public.submit_ca35p_topic_practical(text, text, text) to authenticated;
