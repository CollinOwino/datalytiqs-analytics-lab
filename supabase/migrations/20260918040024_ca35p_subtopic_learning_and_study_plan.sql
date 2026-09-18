create table public.exam_subtopic_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subtopic_id uuid not null references public.exam_subtopics(id) on delete restrict,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  started_at timestamptz not null default now(), completed_at timestamptz,
  updated_at timestamptz not null default now(), unique (enrollment_id, subtopic_id)
);
create index exam_subtopic_progress_user_idx on public.exam_subtopic_progress(user_id, updated_at desc);
create index exam_subtopic_progress_subtopic_idx on public.exam_subtopic_progress(subtopic_id);
alter table public.exam_subtopic_progress enable row level security;
create policy exam_subtopic_progress_own_read on public.exam_subtopic_progress for select to authenticated using (user_id = (select auth.uid()));
grant select on public.exam_subtopic_progress to authenticated;
revoke all on public.exam_subtopic_progress from anon;
revoke insert, update, delete on public.exam_subtopic_progress from authenticated;

create or replace function public.record_exam_subtopic_progress(p_subtopic_id uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := (select auth.uid()); v_topic_id uuid; v_enrollment_id uuid; v_topic_complete boolean;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_status not in ('in_progress','completed') then raise exception 'Invalid progress status'; end if;
  select s.topic_id into v_topic_id from public.exam_subtopics s where s.id=p_subtopic_id and s.active;
  if v_topic_id is null or not public.can_access_exam_topic(v_topic_id) then raise exception 'Topic access required'; end if;
  select e.id into v_enrollment_id from public.exam_enrollments e join public.exam_topics t on t.syllabus_version_id=e.syllabus_version_id where e.user_id=v_user_id and e.status='active' and t.id=v_topic_id limit 1;
  if v_enrollment_id is null then raise exception 'Active enrolment required'; end if;
  insert into public.exam_subtopic_progress(enrollment_id,user_id,subtopic_id,status,completed_at,updated_at)
  values(v_enrollment_id,v_user_id,p_subtopic_id,p_status,case when p_status='completed' then now() else null end,now())
  on conflict(enrollment_id,subtopic_id) do update set status=excluded.status,completed_at=case when excluded.status='completed' then coalesce(public.exam_subtopic_progress.completed_at,now()) else null end,updated_at=now();
  select not exists(select 1 from public.exam_subtopics s where s.topic_id=v_topic_id and s.active and not exists(select 1 from public.exam_subtopic_progress sp where sp.enrollment_id=v_enrollment_id and sp.subtopic_id=s.id and sp.status='completed')) into v_topic_complete;
  insert into public.exam_topic_progress(enrollment_id,user_id,topic_id,status,started_at,completed_at,updated_at)
  values(v_enrollment_id,v_user_id,v_topic_id,case when v_topic_complete then 'completed' else 'in_progress' end,now(),case when v_topic_complete then now() else null end,now())
  on conflict(enrollment_id,topic_id) do update set status=excluded.status,completed_at=case when excluded.status='completed' then coalesce(public.exam_topic_progress.completed_at,now()) else null end,updated_at=now();
  return jsonb_build_object('topic_id',v_topic_id,'topic_completed',v_topic_complete);
end; $$;

create or replace function public.set_exam_target_date(p_programme_code text,p_target_exam_date date)
returns date language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := (select auth.uid()); begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_target_exam_date <= current_date then raise exception 'Target exam date must be in the future'; end if;
  update public.exam_enrollments e set target_exam_date=p_target_exam_date from public.exam_programmes p where e.programme_id=p.id and p.code=upper(trim(p_programme_code)) and e.user_id=v_user_id and e.status='active';
  if not found then raise exception 'Active enrolment required'; end if; return p_target_exam_date;
end; $$;
revoke all on function public.record_exam_subtopic_progress(uuid,text) from public,anon;
revoke all on function public.set_exam_target_date(text,date) from public,anon;
grant execute on function public.record_exam_subtopic_progress(uuid,text) to authenticated;
grant execute on function public.set_exam_target_date(text,date) to authenticated;
comment on table public.exam_subtopic_progress is 'Learner-owned granular syllabus progress; writes use record_exam_subtopic_progress().';
