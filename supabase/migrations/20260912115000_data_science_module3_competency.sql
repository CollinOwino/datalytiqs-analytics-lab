-- Data Science Module 03: prerequisite enforcement, persistence and atomic competency grading.
alter table public.data_science_progress drop constraint if exists data_science_progress_module_id_check;
alter table public.data_science_progress add constraint data_science_progress_module_id_check check (module_id in ('01','02','03'));
alter table public.data_science_evidence drop constraint if exists data_science_evidence_module_id_check;
alter table public.data_science_evidence add constraint data_science_evidence_module_id_check check (module_id in ('01','02','03'));
alter table public.data_science_quiz_items drop constraint if exists data_science_quiz_items_module_id_check;
alter table public.data_science_quiz_items add constraint data_science_quiz_items_module_id_check check (module_id in ('01','02','03'));
alter table public.data_science_quiz_attempts drop constraint if exists data_science_quiz_attempts_module_id_check;
alter table public.data_science_quiz_attempts add constraint data_science_quiz_attempts_module_id_check check (module_id in ('01','02','03'));

create or replace function private.data_science_module2_complete(p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.data_science_progress where user_id=p_user and module_id='02' and module_completed_at is not null)
$$;
create or replace function private.data_science_module3_lessons_complete(p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((lesson_records->>'03-0')::boolean,false) and coalesce((lesson_records->>'03-1')::boolean,false) and coalesce((lesson_records->>'03-2')::boolean,false)
 from public.data_science_progress where user_id=p_user and module_id='03'
$$;

create or replace function private.get_data_science_module3_state()
returns table(module_id text,lesson_records jsonb,evidence_submission jsonb,quiz_score numeric,quiz_passed boolean,quiz_attempts integer,module_completed_at timestamptz,module_02_completed boolean,module_04_unlocked boolean)
language plpgsql stable security definer set search_path='' as $$
declare v_user uuid:=private.data_science_require_user();
begin
 return query select '03'::text,coalesce(p.lesson_records,'{}'::jsonb),
  (select jsonb_build_object('id',e.id,'evidence_type',e.evidence_type,'content',e.content,'status',e.status,'submitted_at',e.submitted_at) from public.data_science_evidence e where e.user_id=v_user and e.module_id='03'),
  p.quiz_score,coalesce(p.quiz_passed,false),coalesce(p.quiz_attempts,0),p.module_completed_at,private.data_science_module2_complete(v_user),(p.module_completed_at is not null)
 from (values(1)) seed(n) left join public.data_science_progress p on p.user_id=v_user and p.module_id='03';
end $$;
create or replace function public.get_data_science_module3_state()
returns table(module_id text,lesson_records jsonb,evidence_submission jsonb,quiz_score numeric,quiz_passed boolean,quiz_attempts integer,module_completed_at timestamptz,module_02_completed boolean,module_04_unlocked boolean)
language sql stable security invoker set search_path='' as $$ select * from private.get_data_science_module3_state() $$;

create or replace function private.mark_data_science_module3_lesson(p_lesson_index integer)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=private.data_science_require_user();v_key text;
begin
 if not private.data_science_module2_complete(v_user) then raise exception 'Complete Module 02 before entering Module 03'; end if;
 if p_lesson_index not between 0 and 2 then raise exception 'Invalid lesson'; end if;
 v_key:='03-'||p_lesson_index;
 insert into public.data_science_progress(user_id,module_id,lesson_records,updated_at) values(v_user,'03',jsonb_build_object(v_key,true),now())
 on conflict(user_id,module_id) do update set lesson_records=public.data_science_progress.lesson_records||excluded.lesson_records,updated_at=now();
end $$;
create or replace function public.mark_data_science_module3_lesson(p_lesson_index integer)
returns void language sql security invoker set search_path='' as $$ select private.mark_data_science_module3_lesson(p_lesson_index) $$;

create or replace function private.submit_data_science_module3_evidence(p_evidence_type text,p_content text)
returns bigint language plpgsql security definer set search_path='' as $$
declare v_user uuid:=private.data_science_require_user();v_id bigint;
begin
 if not private.data_science_module2_complete(v_user) then raise exception 'Complete Module 02 first'; end if;
 if not coalesce(private.data_science_module3_lessons_complete(v_user),false) then raise exception 'Complete all three Module 03 lesson records first'; end if;
 if char_length(trim(p_content)) not between 100 and 20000 then raise exception 'Professional evidence must contain 100 to 20000 characters'; end if;
 insert into public.data_science_evidence(user_id,module_id,evidence_type,content) values(v_user,'03',trim(p_evidence_type),trim(p_content)) returning id into v_id;return v_id;
end $$;
create or replace function public.submit_data_science_module3_evidence(p_evidence_type text,p_content text)
returns bigint language sql security invoker set search_path='' as $$ select private.submit_data_science_module3_evidence(p_evidence_type,p_content) $$;

create or replace function private.get_data_science_module3_quiz()
returns table(question_id text,question_order integer,stem text,options jsonb)
language plpgsql stable security definer set search_path='' as $$
declare v_user uuid:=private.data_science_require_user();
begin
 if not private.data_science_module2_complete(v_user) then raise exception 'Complete Module 02 first'; end if;
 if not coalesce(private.data_science_module3_lessons_complete(v_user),false) then raise exception 'Complete all Module 03 lesson records first'; end if;
 if not exists(select 1 from public.data_science_evidence where user_id=v_user and module_id='03') then raise exception 'Submit professional evidence before loading the quiz'; end if;
 return query select q.question_id,q.question_order,q.stem,q.options from public.data_science_quiz_items q where q.module_id='03' and q.active order by q.question_order;
end $$;
create or replace function public.get_data_science_module3_quiz()
returns table(question_id text,question_order integer,stem text,options jsonb)
language sql stable security invoker set search_path='' as $$ select * from private.get_data_science_module3_quiz() $$;

create or replace function private.grade_data_science_module3(p_answers jsonb)
returns table(score numeric,passed boolean,attempts integer,module_04_unlocked boolean)
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=private.data_science_require_user();v_questions integer;v_answer_count integer;v_correct integer;v_attempts integer;v_score numeric(5,2);v_passed boolean;v_now timestamptz:=now();
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text||':data-science:03',0));
 if not private.data_science_module2_complete(v_user) then raise exception 'Complete Module 02 first'; end if;
 if not coalesce(private.data_science_module3_lessons_complete(v_user),false) then raise exception 'Complete all Module 03 lesson records first'; end if;
 if not exists(select 1 from public.data_science_evidence where user_id=v_user and module_id='03' and status in ('submitted','accepted')) then raise exception 'Submit professional evidence before attempting the quiz'; end if;
 select count(*) into v_attempts from public.data_science_quiz_attempts where user_id=v_user and module_id='03';if v_attempts>=2 then raise exception 'Maximum quiz attempts reached';end if;
 select count(*) into v_questions from public.data_science_quiz_items where module_id='03' and active;select count(*) into v_answer_count from jsonb_object_keys(coalesce(p_answers,'{}'::jsonb));
 if v_questions=0 then raise exception 'Quiz is not configured';end if;if v_answer_count<>v_questions then raise exception 'Every active quiz question must be answered exactly once';end if;
 if exists(select 1 from jsonb_object_keys(p_answers) a where not exists(select 1 from public.data_science_quiz_items q where q.module_id='03' and q.active and q.question_id=a)) then raise exception 'Answers contain an invalid question';end if;
 select count(*) into v_correct from public.data_science_quiz_items q where q.module_id='03' and q.active and p_answers?q.question_id and p_answers->>q.question_id=q.correct_option::text;
 v_score:=round((v_correct::numeric/v_questions)*100,2);v_passed:=v_score>=70;
 insert into public.data_science_quiz_attempts(user_id,module_id,answers,score,passed) values(v_user,'03',p_answers,v_score,v_passed);
 insert into public.data_science_progress(user_id,module_id,quiz_score,quiz_passed,quiz_attempts,module_completed_at,updated_at) values(v_user,'03',v_score,v_passed,v_attempts+1,case when v_passed then v_now end,v_now)
 on conflict(user_id,module_id) do update set quiz_score=greatest(coalesce(public.data_science_progress.quiz_score,0),excluded.quiz_score),quiz_passed=public.data_science_progress.quiz_passed or excluded.quiz_passed,quiz_attempts=excluded.quiz_attempts,module_completed_at=case when excluded.quiz_passed then coalesce(public.data_science_progress.module_completed_at,v_now) else public.data_science_progress.module_completed_at end,updated_at=v_now;
 return query select v_score::numeric,v_passed,v_attempts+1,v_passed;
end $$;
create or replace function public.grade_data_science_module3_quiz(p_answers jsonb)
returns table(score numeric,passed boolean,attempts integer,module_04_unlocked boolean)
language sql security invoker set search_path='' as $$ select * from private.grade_data_science_module3(p_answers) $$;

revoke all on function private.data_science_module2_complete(uuid),private.data_science_module3_lessons_complete(uuid),private.get_data_science_module3_state(),private.mark_data_science_module3_lesson(integer),private.submit_data_science_module3_evidence(text,text),private.get_data_science_module3_quiz(),private.grade_data_science_module3(jsonb) from public,anon,authenticated;
grant execute on function private.data_science_module2_complete(uuid),private.data_science_module3_lessons_complete(uuid),private.get_data_science_module3_state(),private.mark_data_science_module3_lesson(integer),private.submit_data_science_module3_evidence(text,text),private.get_data_science_module3_quiz(),private.grade_data_science_module3(jsonb) to authenticated;
revoke all on function public.get_data_science_module3_state(),public.mark_data_science_module3_lesson(integer),public.submit_data_science_module3_evidence(text,text),public.get_data_science_module3_quiz(),public.grade_data_science_module3_quiz(jsonb) from public,anon;
grant execute on function public.get_data_science_module3_state(),public.mark_data_science_module3_lesson(integer),public.submit_data_science_module3_evidence(text,text),public.get_data_science_module3_quiz(),public.grade_data_science_module3_quiz(jsonb) to authenticated;

insert into public.data_science_quiz_items(module_id,question_id,question_order,stem,options,correct_option) values
('03','ds03-q1',1,'An operational payments database is reused for policy analysis. How should it be classified for the analysis?','["Primary experimental data","Administrative secondary data whose fitness must be assessed","Synthetic data","Unstructured observation"]',1),
('03','ds03-q2',2,'Which provenance record is sufficient for reproducibility?','["Downloaded online","Publisher, title, version, extraction date, query or URL, licence and transformations","A screenshot","Only the analyst name"]',1),
('03','ds03-q3',3,'What is the strongest pre-deployment control for a new digital instrument?','["Remove validations","Pilot the full instrument, device, routing, transfer and supervision workflow","Collect extra identifiers","Allow unversioned edits"]',1),
('03','ds03-q4',4,'What does data minimisation require?','["Collect everything potentially useful","Collect only necessary and proportionate data for the approved purpose","Delete all metadata","Give every employee access"]',1)
on conflict(module_id,question_id) do update set question_order=excluded.question_order,stem=excluded.stem,options=excluded.options,correct_option=excluded.correct_option,active=true;
