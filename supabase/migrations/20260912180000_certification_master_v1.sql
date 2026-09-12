-- DatalytIQs Academy certification master v1
-- MERL Foundations Certificate of Competence, governed issuance, editable signatories, public verification.

create table if not exists public.certification_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'issuer' check (role in ('issuer','administrator')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  version integer not null default 1,
  credential_type text not null check (credential_type in ('completion','competence','professional')),
  programme_code text not null,
  programme_title text not null,
  certificate_title text not null default 'CERTIFICATE OF COMPETENCE',
  achievement_statement text not null,
  detail_statement text not null,
  result_label text not null default 'Competent',
  theme jsonb not null default '{"primary":"#0B2C4D","secondary":"#1565C0","accent":"#F4A261","paper":"#FFFFFF"}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificate_signatories (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.certificate_templates(id) on delete cascade,
  signatory_key text not null check (signatory_key in ('director','facilitator')),
  display_name text not null,
  title text not null,
  signature_image_url text,
  active boolean not null default true,
  sort_order integer not null default 1,
  updated_at timestamptz not null default now(),
  unique(template_id,signatory_key)
);

create table if not exists public.credential_review_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.certificate_templates(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','changes_requested','rejected','issued')),
  learner_declaration boolean not null default false,
  learner_name text,
  reviewer_notes text,
  reviewed_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique(user_id,template_id)
);

create sequence if not exists public.dqa_certificate_seq start 1;

create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  credential_id text not null unique,
  certificate_number text not null unique,
  template_id uuid not null references public.certificate_templates(id),
  learner_user_id uuid not null references auth.users(id),
  learner_name text not null,
  programme_title text not null,
  credential_type text not null,
  result text not null default 'Competent',
  issue_date date not null default current_date,
  status text not null default 'valid' check (status in ('valid','revoked','superseded')),
  issued_by uuid not null references auth.users(id),
  verification_slug text not null unique default encode(gen_random_bytes(12),'hex'),
  snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now()
);

create or replace function public.is_certification_admin()
returns boolean language sql stable security definer set search_path=public as $$
select exists(select 1 from public.certification_admins where user_id=auth.uid() and active)
$$;

create or replace function public.merl_foundations_eligibility(p_user_id uuid default auth.uid())
returns jsonb language plpgsql stable security definer set search_path=public,auth as $$
declare v_completed int; v_test boolean;
begin
  select coalesce((raw_app_meta_data->>'test_account')::boolean,(raw_app_meta_data->>'is_test_account')::boolean,raw_app_meta_data->>'data_classification'='acceptance_test',false)
  into v_test from auth.users where id=p_user_id;
  select count(*) into v_completed from public.merl_level1_progress
  where user_id=p_user_id and module_id in ('01','02','03','04','05') and module_completed_at is not null;
  return jsonb_build_object('eligible',v_completed=5 and not coalesce(v_test,false),'modules_competent',v_completed,'modules_required',5,'test_account',coalesce(v_test,false));
end $$;

create or replace function public.request_merl_foundations_review(p_learner_name text,p_declaration boolean)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_template uuid; v_elig jsonb; v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not p_declaration then raise exception 'Learner integrity declaration is required'; end if;
  if char_length(trim(p_learner_name))<3 then raise exception 'Enter the certificate learner name'; end if;
  select id into v_template from public.certificate_templates where code='MERL-FOUNDATIONS-COMP' and active order by version desc limit 1;
  v_elig:=public.merl_foundations_eligibility(auth.uid());
  if coalesce((v_elig->>'eligible')::boolean,false)=false then raise exception 'MERL Foundations competency gate is not satisfied'; end if;
  insert into public.credential_review_requests(user_id,template_id,status,learner_declaration,learner_name)
  values(auth.uid(),v_template,'pending',true,trim(p_learner_name))
  on conflict(user_id,template_id) do update set status=case when credential_review_requests.status='issued' then 'issued' else 'pending' end,
    learner_declaration=true,learner_name=excluded.learner_name,requested_at=case when credential_review_requests.status='issued' then credential_review_requests.requested_at else now() end
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.verify_credential(p_credential_id text)
returns table(credential_id text,certificate_number text,learner_name text,programme_title text,credential_type text,result text,issue_date date,status text,verification_slug text)
language sql security definer set search_path=public as $$
select c.credential_id,c.certificate_number,c.learner_name,c.programme_title,c.credential_type,c.result,c.issue_date,c.status,c.verification_slug
from public.credentials c where upper(c.credential_id)=upper(trim(p_credential_id))
$$;

create or replace function public.render_credential(p_credential_id text)
returns table(credential_id text,certificate_number text,learner_name text,programme_title text,credential_type text,result text,issue_date date,status text,verification_slug text,snapshot jsonb)
language sql security definer set search_path=public as $$
select c.credential_id,c.certificate_number,c.learner_name,c.programme_title,c.credential_type,c.result,c.issue_date,c.status,c.verification_slug,c.snapshot
from public.credentials c where upper(c.credential_id)=upper(trim(p_credential_id)) limit 1
$$;

alter table public.certification_admins enable row level security;
alter table public.certificate_templates enable row level security;
alter table public.certificate_signatories enable row level security;
alter table public.credential_review_requests enable row level security;
alter table public.credentials enable row level security;

drop policy if exists cert_admins_self_read on public.certification_admins;
create policy cert_admins_self_read on public.certification_admins for select to authenticated using(user_id=auth.uid());
drop policy if exists templates_authenticated_read on public.certificate_templates;
create policy templates_authenticated_read on public.certificate_templates for select to authenticated using(active or public.is_certification_admin());
drop policy if exists templates_admin_manage on public.certificate_templates;
create policy templates_admin_manage on public.certificate_templates for all to authenticated using(public.is_certification_admin()) with check(public.is_certification_admin());
drop policy if exists signatories_authenticated_read on public.certificate_signatories;
create policy signatories_authenticated_read on public.certificate_signatories for select to authenticated using(active or public.is_certification_admin());
drop policy if exists signatories_admin_manage on public.certificate_signatories;
create policy signatories_admin_manage on public.certificate_signatories for all to authenticated using(public.is_certification_admin()) with check(public.is_certification_admin());
drop policy if exists review_own_read on public.credential_review_requests;
create policy review_own_read on public.credential_review_requests for select to authenticated using(user_id=auth.uid() or public.is_certification_admin());
drop policy if exists review_admin_update on public.credential_review_requests;
create policy review_admin_update on public.credential_review_requests for update to authenticated using(public.is_certification_admin()) with check(public.is_certification_admin());
drop policy if exists credentials_learner_read on public.credentials;
create policy credentials_learner_read on public.credentials for select to authenticated using(learner_user_id=auth.uid() or public.is_certification_admin());

grant execute on function public.merl_foundations_eligibility(uuid) to authenticated;
grant execute on function public.request_merl_foundations_review(text,boolean) to authenticated;
grant execute on function public.verify_credential(text) to anon,authenticated;
grant execute on function public.render_credential(text) to anon,authenticated;

insert into public.certificate_templates(code,version,credential_type,programme_code,programme_title,certificate_title,achievement_statement,detail_statement,result_label)
values('MERL-FOUNDATIONS-COMP',1,'competence','MERL-L1','MONITORING, EVALUATION, RESEARCH & LEARNING (MERL) — FOUNDATIONS','CERTIFICATE OF COMPETENCE','has successfully demonstrated the required competencies in','Having successfully completed the prescribed learning activities, practical assessments and competency requirements in monitoring, evaluation, research and learning foundations, this certificate is awarded in recognition of demonstrated competence.','Competent')
on conflict(code) do update set programme_title=excluded.programme_title,certificate_title=excluded.certificate_title,achievement_statement=excluded.achievement_statement,detail_statement=excluded.detail_statement,result_label=excluded.result_label,active=true,updated_at=now();

insert into public.certificate_signatories(template_id,signatory_key,display_name,title,sort_order)
select id,'director','Director Name','Director, DatalytIQs Academy',1 from public.certificate_templates where code='MERL-FOUNDATIONS-COMP'
on conflict(template_id,signatory_key) do nothing;
insert into public.certificate_signatories(template_id,signatory_key,display_name,title,sort_order)
select id,'facilitator','Facilitator Name','Lead Facilitator, DatalytIQs Academy',2 from public.certificate_templates where code='MERL-FOUNDATIONS-COMP'
on conflict(template_id,signatory_key) do nothing;
