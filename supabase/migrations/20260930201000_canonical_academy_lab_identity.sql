-- DatalytIQs Academy ↔ Analytics Lab canonical identity foundation.
-- Additive only: preserves the existing Tutor event ledger and entitlements.
-- WordPress/Tutor numeric IDs are source-system identifiers; auth.users.id remains the Lab principal.

create table if not exists public.learner_identity_links (
  learner_id uuid primary key references auth.users(id) on delete cascade,
  tutor_user_id bigint unique check (tutor_user_id > 0),
  academy_email text,
  first_linked_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  link_method text not null default 'verified_event'
    check (link_method in ('verified_event','admin_verified','account_claim')),
  constraint learner_identity_links_email_format
    check (academy_email is null or academy_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

create unique index if not exists learner_identity_links_email_uidx
  on public.learner_identity_links (lower(academy_email))
  where academy_email is not null;

alter table public.learner_identity_links enable row level security;

drop policy if exists learner_identity_links_own_read on public.learner_identity_links;
create policy learner_identity_links_own_read on public.learner_identity_links
for select to authenticated
using ((select auth.uid()) = learner_id);

create or replace function public.resolve_tutor_learner_identity(
  p_tutor_user_id bigint,
  p_user_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_learner_id uuid;
  v_existing uuid;
begin
  if p_tutor_user_id < 1
     or p_user_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid learner identity fields';
  end if;

  -- Stable source-system ID wins after the first verified link.
  select learner_id into v_learner_id
  from public.learner_identity_links
  where tutor_user_id = p_tutor_user_id;

  if v_learner_id is not null then
    update public.learner_identity_links
      set last_verified_at = now(),
          academy_email = lower(trim(p_user_email))
    where learner_id = v_learner_id;
    return v_learner_id;
  end if;

  -- Bootstrap an existing Lab account only when its verified auth email matches.
  select id into v_learner_id
  from auth.users
  where lower(email) = lower(trim(p_user_email))
  limit 1;

  if v_learner_id is null then
    return null;
  end if;

  select learner_id into v_existing
  from public.learner_identity_links
  where learner_id = v_learner_id;

  if v_existing is not null then
    -- Never silently attach a second Tutor identity to an already-linked Lab principal.
    return null;
  end if;

  insert into public.learner_identity_links(
    learner_id,tutor_user_id,academy_email,link_method
  ) values (
    v_learner_id,p_tutor_user_id,lower(trim(p_user_email)),'verified_event'
  );

  return v_learner_id;
end;
$$;

revoke all on function public.resolve_tutor_learner_identity(bigint,text)
from public, anon, authenticated;
grant execute on function public.resolve_tutor_learner_identity(bigint,text)
to service_role;

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
  if p_source_url not like 'https://%' or p_tutor_user_id < 1 or p_course_id < 1 or p_user_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid Tutor event fields'; end if;
  insert into public.tutor_lab_events(event_id,event_type,occurred_at,source_url,tutor_user_id,user_email,tutor_course_id,woo_order_id,payload)
  values(p_event_id,p_event_type,p_occurred_at,p_source_url,p_tutor_user_id,lower(trim(p_user_email)),p_course_id,p_order_id,p_payload) on conflict(event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return query select 'duplicate'::text, false; return; end if;

  v_learner_id := public.resolve_tutor_learner_identity(p_tutor_user_id,p_user_email);
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

comment on table public.learner_identity_links is
  'Canonical Academy↔Lab identity link. auth.users.id is the Lab learner principal; Tutor user ID is a stable external identity. Email is bootstrap/verification metadata, not the long-term join key.';
