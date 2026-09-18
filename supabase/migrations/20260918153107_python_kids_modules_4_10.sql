-- Publish the paid Python for Kids pathway while retaining Modules 1–3 as the free acquisition tier.

update public.learning_modules module
set status='published'
from public.learning_programmes programme
where module.programme_id=programme.id and programme.code='PY-KIDS' and module.sequence_no between 4 and 10;

update public.learning_lessons lesson
set status='published'
from public.learning_modules module, public.learning_programmes programme
where lesson.module_id=module.id and module.programme_id=programme.id and programme.code='PY-KIDS' and module.sequence_no between 4 and 10;

with programme as (select id from public.learning_programmes where code='PY-KIDS')
insert into public.learning_badges(programme_id,code,title,description,required_lesson_code)
select programme.id,b.code,b.title,b.description,b.lesson from programme cross join (values
('decision-designer','Decision Designer','Built and tested a program that makes clear decisions.','4.3'),
('loop-builder','Loop Builder','Used controlled repetition to solve a coding challenge.','5.3'),
('list-organiser','List Organiser','Built a useful program with a collection of values.','6.3'),
('function-maker','Function Maker','Created and called a reusable function.','7.3'),
('game-creator','Game Creator','Planned, tested and improved a small game.','8.3'),
('young-data-analyst','Young Data Analyst','Summarised data and communicated an evidence-based finding.','9.3'),
('python-project-builder','Python Project Builder','Completed the final guided Python project challenge.','10.3')) as b(code,title,description,lesson)
on conflict(programme_id,code) do update set title=excluded.title,description=excluded.description,required_lesson_code=excluded.required_lesson_code;

create or replace function public.submit_python_kids_project(p_module_code text,p_title text,p_code text,p_reflection text)
returns bigint language plpgsql security definer set search_path='' as $$
declare v_user uuid:=(select auth.uid()); v_module uuid; v_sequence integer; v_enrollment uuid; v_project bigint; v_competency uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_title)) not between 3 and 120 or char_length(p_code) not between 20 and 10000 or char_length(trim(p_reflection)) not between 20 and 2000 then raise exception 'Project evidence is incomplete'; end if;
  select module.id,module.sequence_no into v_module,v_sequence from public.learning_modules module join public.learning_programmes programme on programme.id=module.programme_id where programme.code='PY-KIDS' and module.code=p_module_code and module.status='published';
  select enrollment.id into v_enrollment from public.learning_enrollments enrollment join public.learning_programmes programme on programme.id=enrollment.programme_id where enrollment.user_id=v_user and enrollment.status='active' and programme.code='PY-KIDS';
  if v_module is null or v_enrollment is null then raise exception 'Active Python for Kids enrolment required'; end if;
  if v_sequence>3 and not exists(select 1 from public.learning_access_grants grant_row where grant_row.user_id=v_user and grant_row.programme_id=(select id from public.learning_programmes where code='PY-KIDS') and grant_row.revoked_at is null and grant_row.starts_at<=now() and (grant_row.expires_at is null or grant_row.expires_at>now())) then raise exception 'Full programme access required'; end if;
  insert into public.learning_projects(enrollment_id,user_id,module_id,title,code_text,reflection) values(v_enrollment,v_user,v_module,trim(p_title),p_code,trim(p_reflection)) returning id into v_project;
  select competency.id into v_competency from public.learning_competencies competency where competency.programme_id=(select id from public.learning_programmes where code='PY-KIDS') and competency.code='creative-projects';
  insert into public.learning_competency_evidence(user_id,competency_id,source_type,source_id,level) values(v_user,v_competency,'project',v_project::text,'demonstrated') on conflict do nothing;
  return v_project;
end $$;

revoke all on function public.submit_python_kids_project(text,text,text,text) from public,anon;
grant execute on function public.submit_python_kids_project(text,text,text,text) to authenticated;
