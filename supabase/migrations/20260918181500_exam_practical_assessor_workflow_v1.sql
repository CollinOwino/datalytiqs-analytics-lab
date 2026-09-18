alter table public.exam_topic_practical_submissions add column if not exists reviewer_user_id uuid references auth.users(id);
alter table public.exam_topic_practical_submissions add column if not exists rubric_scores jsonb;
alter table public.exam_topic_practical_submissions add column if not exists determination text;
alter table public.exam_topic_practical_submissions drop constraint if exists exam_topic_practical_submissions_determination_check;
alter table public.exam_topic_practical_submissions add constraint exam_topic_practical_submissions_determination_check check (determination is null or determination in ('competent','not_yet_competent'));

create or replace function public.review_ca35p_topic_practical(p_submission_id uuid,p_structure integer,p_method integer,p_interpretation integer,p_recommendation integer,p_feedback text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_reviewer uuid:=(select auth.uid()); v_s public.exam_topic_practical_submissions%rowtype; v_programme uuid; v_total integer; v_det text; v_all_subtopics boolean; v_quiz_pass boolean;
begin
 if v_reviewer is null then raise exception 'Authentication required'; end if;
 if p_structure not between 0 and 5 or p_method not between 0 and 5 or p_interpretation not between 0 and 5 or p_recommendation not between 0 and 5 then raise exception 'Each rubric score must be 0 to 5'; end if;
 if char_length(trim(coalesce(p_feedback,''))) < 20 then raise exception 'Reviewer feedback must contain at least 20 characters'; end if;
 select s.* into v_s from public.exam_topic_practical_submissions s where s.id=p_submission_id for update;
 if v_s.id is null then raise exception 'Submission not found'; end if;
 select sv.programme_id into v_programme from public.exam_topics t join public.exam_syllabus_versions sv on sv.id=t.syllabus_version_id where t.id=v_s.topic_id;
 if not public.is_exam_programme_staff(v_programme,array['reviewer','instructor','administrator']) then raise exception 'Reviewer role required'; end if;
 if v_s.status not in ('submitted','under_review','revision_required') then raise exception 'Submission already finally assessed'; end if;
 v_total:=p_structure+p_method+p_interpretation+p_recommendation; v_det:=case when v_total>=14 then 'competent' else 'not_yet_competent' end;
 update public.exam_topic_practical_submissions set status=case when v_det='competent' then 'competent' else 'revision_required' end,score=v_total,reviewer_feedback=trim(p_feedback),reviewer_user_id=v_reviewer,rubric_scores=jsonb_build_object('structure_controls_integrity',p_structure,'analytical_method_accuracy',p_method,'interpretation_evidence',p_interpretation,'decision_recommendation_presentation',p_recommendation),determination=v_det,reviewed_at=now() where id=v_s.id;
 if v_det='competent' then
  insert into public.exam_competency_evidence(enrollment_id,user_id,competency_id,source_type,source_id,score)
  select v_s.enrollment_id,v_s.user_id,tc.competency_id,'practical',v_s.id,v_total*5 from public.exam_topic_competencies tc where tc.topic_id=v_s.topic_id on conflict do nothing;
 end if;
 select not exists(select 1 from public.exam_subtopics st where st.topic_id=v_s.topic_id and not exists(select 1 from public.exam_subtopic_progress sp where sp.enrollment_id=v_s.enrollment_id and sp.subtopic_id=st.id and sp.status='completed')) into v_all_subtopics;
 select exists(select 1 from public.exam_quiz_attempts qa where qa.enrollment_id=v_s.enrollment_id and qa.topic_id=v_s.topic_id and qa.passed) into v_quiz_pass;
 insert into public.exam_topic_progress(enrollment_id,user_id,topic_id,status,started_at,completed_at,updated_at) values(v_s.enrollment_id,v_s.user_id,v_s.topic_id,case when v_det='competent' and v_all_subtopics and v_quiz_pass then 'completed' else 'in_progress' end,now(),case when v_det='competent' and v_all_subtopics and v_quiz_pass then now() else null end,now())
 on conflict(enrollment_id,topic_id) do update set status=excluded.status,completed_at=excluded.completed_at,updated_at=now();
 return jsonb_build_object('submission_id',v_s.id,'score',v_total,'determination',v_det,'topic_completed',(v_det='competent' and v_all_subtopics and v_quiz_pass));
end $$;
revoke execute on function public.review_ca35p_topic_practical(uuid,integer,integer,integer,integer,text) from public, anon;
grant execute on function public.review_ca35p_topic_practical(uuid,integer,integer,integer,integer,text) to authenticated;
drop policy if exists "Exam staff read topic practical submissions" on public.exam_topic_practical_submissions;
create policy "Exam staff read topic practical submissions" on public.exam_topic_practical_submissions for select to authenticated using (exists(select 1 from public.exam_enrollments e where e.id=enrollment_id and public.is_exam_programme_staff(e.programme_id,array['reviewer','instructor','administrator'])));