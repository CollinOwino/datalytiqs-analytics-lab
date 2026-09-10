create or replace function public.grade_merl_level1_quiz(p_module_id text,p_answers jsonb)
returns table(score numeric,passed boolean,attempts integer)
language plpgsql
security definer
set search_path=''
as $$
declare
  v_user uuid:=auth.uid();
  v_score numeric(5,2);
  v_question_count integer;
  v_answer_count integer;
  v_correct_count integer;
  v_attempt_count integer;
  v_passed boolean;
  v_now timestamptz:=now();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_module_id not in ('01','02','03','04','05') then raise exception 'Invalid module'; end if;
  if not public.merl_previous_module_complete(v_user,p_module_id) then
    raise exception 'Previous module must be completed first';
  end if;

  perform 1 from public.merl_level1_progress
  where user_id=v_user and module_id=p_module_id for update;

  if (
    select count(*) from public.merl_level1_progress p,
      jsonb_each(coalesce(p.lesson_evidence,'{}'::jsonb)) item
    where p.user_id=v_user and p.module_id=p_module_id and item.value='true'::jsonb
  )<3 then raise exception 'Complete all lesson evidence first'; end if;

  if not exists(
    select 1 from public.merl_level1_evidence
    where user_id=v_user and module_id=p_module_id and status in ('submitted','accepted')
  ) then raise exception 'Professional evidence must be submitted before the quiz'; end if;

  select count(*) into v_attempt_count from public.merl_level1_quiz_attempts
  where user_id=v_user and module_id=p_module_id;
  if v_attempt_count>=2 then raise exception 'Maximum quiz attempts reached'; end if;

  select count(*) into v_question_count from public.merl_level1_quiz_items
  where module_id=p_module_id and active;
  select count(*) into v_answer_count from jsonb_object_keys(coalesce(p_answers,'{}'::jsonb));
  if v_question_count=0 then raise exception 'Quiz is not configured'; end if;
  if v_answer_count<>v_question_count then
    raise exception 'Every active quiz question must be answered exactly once';
  end if;

  select count(*) into v_correct_count from public.merl_level1_quiz_items q
  where q.module_id=p_module_id and q.active and p_answers?q.question_id
    and (p_answers->>q.question_id)=q.correct_option::text;
  v_score:=round((v_correct_count::numeric/v_question_count)*100,2);
  v_passed:=v_score>=70;

  insert into public.merl_level1_quiz_attempts(user_id,module_id,answers,score,passed)
  values(v_user,p_module_id,p_answers,v_score,v_passed);

  insert into public.merl_level1_progress(
    user_id,module_id,quiz_score,quiz_passed,quiz_attempts,module_completed_at,updated_at
  ) values(
    v_user,p_module_id,v_score,v_passed,v_attempt_count+1,
    case when v_passed then v_now else null end,v_now
  )
  on conflict(user_id,module_id) do update set
    quiz_score=greatest(coalesce(public.merl_level1_progress.quiz_score,0),excluded.quiz_score),
    quiz_passed=public.merl_level1_progress.quiz_passed or excluded.quiz_passed,
    quiz_attempts=excluded.quiz_attempts,
    module_completed_at=case
      when excluded.quiz_passed then coalesce(public.merl_level1_progress.module_completed_at,v_now)
      else public.merl_level1_progress.module_completed_at end,
    updated_at=v_now;

  return query select v_score::numeric,v_passed,v_attempt_count+1;
end;
$$;

revoke all on function public.grade_merl_level1_quiz(text,jsonb) from public,anon;
grant execute on function public.grade_merl_level1_quiz(text,jsonb) to authenticated;

create or replace function public.protect_merl_progress_grading()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  if auth.uid() is not null and current_user<>'postgres' then
    new.quiz_score:=old.quiz_score;
    new.quiz_passed:=old.quiz_passed;
    new.quiz_attempts:=old.quiz_attempts;
    new.module_completed_at:=old.module_completed_at;
  end if;
  new.updated_at:=now();
  return new;
end;
$$;

revoke all on function public.protect_merl_progress_grading() from public,anon,authenticated;
