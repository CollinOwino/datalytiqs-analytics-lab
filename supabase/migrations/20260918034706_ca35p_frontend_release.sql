-- Publish the verified CA35P catalogue and add the learner-owned progress workflow.
-- The first three top-level topics remain free. Topics four and five continue to
-- require a valid exam_access_grants row through can_access_exam_topic().

update public.exam_programmes p
set status = 'published', updated_at = now()
from public.exam_bodies b
where p.exam_body_id = b.id and b.code = 'KASNEB' and p.code = 'CA35P'
  and p.status = 'draft';

update public.exam_syllabus_versions sv
set status = 'published', published_at = coalesce(published_at, now())
from public.exam_programmes p
join public.exam_bodies b on b.id = p.exam_body_id
where sv.programme_id = p.id and b.code = 'KASNEB' and p.code = 'CA35P'
  and sv.version_label = 'provisional-2022' and sv.status = 'draft';

update public.exam_assessments a
set status = 'published'
from public.exam_programmes p
join public.exam_bodies b on b.id = p.exam_body_id
where a.programme_id = p.id and b.code = 'KASNEB' and p.code = 'CA35P'
  and a.title = 'CA35P Full Mock - Current Observed Structure'
  and a.status = 'draft';

create table public.exam_topic_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.exam_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.exam_topics(id) on delete restrict,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, topic_id)
);

create index exam_topic_progress_user_idx
  on public.exam_topic_progress(user_id, updated_at desc);

alter table public.exam_topic_progress enable row level security;

create policy exam_topic_progress_own_read on public.exam_topic_progress
for select to authenticated
using (user_id = (select auth.uid()));

create policy exam_topic_progress_own_insert on public.exam_topic_progress
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.can_access_exam_topic(topic_id)
  and exists (
    select 1 from public.exam_enrollments e
    where e.id = enrollment_id and e.user_id = (select auth.uid()) and e.status = 'active'
  )
);

create policy exam_topic_progress_own_update on public.exam_topic_progress
for update to authenticated
using (user_id = (select auth.uid()) and public.can_access_exam_topic(topic_id))
with check (user_id = (select auth.uid()) and public.can_access_exam_topic(topic_id));

grant select, insert, update on public.exam_topic_progress to authenticated;
revoke all on public.exam_topic_progress from anon;
revoke delete on public.exam_topic_progress from authenticated;

create or replace function public.enroll_in_exam_programme(p_programme_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_programme_id uuid;
  v_syllabus_id uuid;
  v_enrollment_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select p.id, sv.id into v_programme_id, v_syllabus_id
  from public.exam_programmes p
  join public.exam_syllabus_versions sv on sv.programme_id = p.id
  where p.code = upper(trim(p_programme_code))
    and p.status = 'published' and sv.status = 'published'
  order by sv.effective_from desc nulls last, sv.created_at desc
  limit 1;

  if v_programme_id is null then
    raise exception 'Published programme not found';
  end if;

  insert into public.exam_enrollments(programme_id, syllabus_version_id, user_id, status)
  values (v_programme_id, v_syllabus_id, v_user_id, 'active')
  on conflict (programme_id, user_id) do update
    set status = case when public.exam_enrollments.status = 'withdrawn' then 'active' else public.exam_enrollments.status end
  returning id into v_enrollment_id;

  return v_enrollment_id;
end;
$$;

revoke all on function public.enroll_in_exam_programme(text) from public, anon;
grant execute on function public.enroll_in_exam_programme(text) to authenticated;

comment on table public.exam_topic_progress is
  'Learner-owned top-level topic progress. Access remains subject to database entitlement checks.';
