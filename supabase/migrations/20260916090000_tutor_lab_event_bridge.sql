-- Trusted Tutor LMS → Analytics Lab event ledger and course-entitlement bridge.
-- Only the server-side service role may call the receiver RPC.

create table if not exists public.tutor_lab_events (
  event_id uuid primary key,
  event_type text not null check (event_type in ('enrolment_created', 'course_completed')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  source_url text not null check (source_url like 'https://%'),
  tutor_user_id bigint not null check (tutor_user_id > 0),
  user_email text not null,
  tutor_course_id bigint not null check (tutor_course_id > 0),
  woo_order_id bigint,
  payload jsonb not null,
  mapped_user_id uuid references auth.users(id) on delete set null
);

create table if not exists public.tutor_lab_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  tutor_course_id bigint not null check (tutor_course_id > 0),
  enrolment_event_id uuid not null references public.tutor_lab_events(event_id) on delete restrict,
  completion_event_id uuid references public.tutor_lab_events(event_id) on delete restrict,
  state text not null default 'active' check (state in ('active', 'completed', 'revoked')),
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, tutor_course_id)
);

create index if not exists tutor_lab_events_email_idx on public.tutor_lab_events (lower(user_email));
create index if not exists tutor_lab_entitlements_course_idx on public.tutor_lab_entitlements (tutor_course_id, state);

alter table public.tutor_lab_events enable row level security;
alter table public.tutor_lab_entitlements enable row level security;

drop policy if exists tutor_lab_entitlements_own_read on public.tutor_lab_entitlements;
create policy tutor_lab_entitlements_own_read on public.tutor_lab_entitlements
for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.receive_tutor_lab_event(
  p_event_id uuid, p_event_type text, p_occurred_at timestamptz, p_source_url text,
  p_tutor_user_id bigint, p_user_email text, p_course_id bigint, p_order_id bigint, p_payload jsonb
)
returns table(status text, learner_mapped boolean)
language plpgsql security definer set search_path = ''
as $$
declare v_learner_id uuid; v_inserted integer;
begin
  if p_event_type not in ('enrolment_created', 'course_completed') then raise exception 'Unsupported Tutor event'; end if;
  if p_source_url not like 'https://%' or p_tutor_user_id < 1 or p_course_id < 1 or p_user_email !~ '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' then raise exception 'Invalid Tutor event fields'; end if;
  insert into public.tutor_lab_events(event_id,event_type,occurred_at,source_url,tutor_user_id,user_email,tutor_course_id,woo_order_id,payload)
  values(p_event_id,p_event_type,p_occurred_at,p_source_url,p_tutor_user_id,lower(trim(p_user_email)),p_course_id,p_order_id,p_payload) on conflict(event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return query select 'duplicate'::text, false; return; end if;
  select id into v_learner_id from auth.users where lower(email) = lower(trim(p_user_email)) limit 1;
  update public.tutor_lab_events set mapped_user_id = v_learner_id where event_id = p_event_id;
  if v_learner_id is null then return query select 'accepted_unmapped'::text, false; return; end if;
  if p_event_type = 'enrolment_created' then
    insert into public.tutor_lab_entitlements(user_id,tutor_course_id,enrolment_event_id,state) values(v_learner_id,p_course_id,p_event_id,'active')
    on conflict(user_id,tutor_course_id) do update set state = case when public.tutor_lab_entitlements.state = 'revoked' then 'revoked' else 'active' end, updated_at = now();
  else
    update public.tutor_lab_entitlements set completion_event_id = p_event_id, state = case when state = 'revoked' then 'revoked' else 'completed' end, updated_at = now() where user_id = v_learner_id and tutor_course_id = p_course_id;
    get diagnostics v_inserted = row_count;
    if v_inserted = 0 then return query select 'accepted_without_entitlement'::text, true; return; end if;
  end if;
  return query select 'accepted'::text, true;
end;
$$;

revoke all on function public.receive_tutor_lab_event(uuid,text,timestamptz,text,bigint,text,bigint,bigint,jsonb) from public, anon, authenticated;
grant execute on function public.receive_tutor_lab_event(uuid,text,timestamptz,text,bigint,text,bigint,bigint,jsonb) to service_role;
