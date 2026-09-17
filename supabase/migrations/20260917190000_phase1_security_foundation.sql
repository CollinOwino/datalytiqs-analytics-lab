-- Phase 1: canonical multi-tenant security and governance foundation.
-- Backward-compatible: legacy CEO tables remain operational and are linked, not replaced.

create table if not exists public.organization_legacy_links (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  legacy_ceo_organisation_id uuid unique references public.ceo_organisations(id) on delete restrict,
  linked_at timestamptz not null default now(),
  linked_by uuid references auth.users(id)
);

insert into public.organization_legacy_links (organization_id, legacy_ceo_organisation_id)
select o.id, c.id
from public.organizations o
join public.ceo_organisations c on lower(trim(c.name)) = lower(trim(o.name))
on conflict do nothing;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 160),
  code text,
  parent_department_id uuid references public.departments(id) on delete set null,
  head_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (organization_id, code)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 160),
  lead_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  role_key text not null check (role_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists roles_platform_key_unique on public.roles(role_key) where organization_id is null;
create unique index if not exists roles_org_key_unique on public.roles(organization_id, role_key) where organization_id is not null;

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique check (permission_key ~ '^[a-z][a-z0-9_.]{2,95}$'),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.member_roles (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  scope_type text not null default 'organization' check (scope_type in ('organization','department','team')),
  scope_id uuid,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (organization_id, user_id, role_id, scope_type, scope_id)
);

insert into public.roles (organization_id, role_key, name, description, is_system) values
(null,'ceo','CEO / Executive Director','Executive authority for an organization.',true),
(null,'executive_assistant','Executive Assistant','Delegated executive coordination and meeting support.',true),
(null,'board_member','Board Member','Governance and board-level review.',true),
(null,'manager','Manager / Head of Department','Departmental management and delegated approvals.',true),
(null,'officer','Officer / Staff Member','Operational execution and evidence submission.',true),
(null,'org_admin','Organization Administrator','Organization membership, configuration and access administration.',true),
(null,'auditor','Auditor / Reviewer','Read-only assurance and audit review.',true),
(null,'platform_admin','DatalytIQs Platform Administrator','Platform operations outside tenant business records.',true)
on conflict do nothing;

insert into public.permissions (permission_key,name,description) values
('organization.manage','Manage organization','Update organization configuration and structure.'),
('members.manage','Manage members','Invite, activate and manage organization members.'),
('documents.read','Read documents','Read authorized organization documents.'),
('documents.manage','Manage documents','Create and manage authorized organization documents.'),
('meetings.manage','Manage meetings','Create and administer meetings.'),
('decisions.manage','Manage decisions','Create, approve and update decisions.'),
('actions.assign','Assign actions','Assign and delegate actions.'),
('actions.update','Update actions','Update assigned actions and submit evidence.'),
('approvals.review','Review approvals','Approve or return submitted work.'),
('performance.read','Read performance','Read authorized KPI and performance records.'),
('performance.manage','Manage performance','Configure and update performance records.'),
('audit.read','Read audit trail','Review append-only audit and activity records.'),
('ai.use','Use executive intelligence','Run authorized AI-supported workflows.'),
('platform.manage','Manage platform','Administer platform-level configuration.')
on conflict (permission_key) do nothing;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive','retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  entitlement_key text not null unique,
  name text not null,
  unit text not null default 'boolean' check (unit in ('boolean','count','bytes','credits')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_entitlements (
  plan_id uuid not null references public.plans(id) on delete cascade,
  entitlement_id uuid not null references public.entitlements(id) on delete cascade,
  enabled boolean not null default true,
  limit_value bigint,
  configuration jsonb not null default '{}'::jsonb,
  primary key (plan_id, entitlement_id)
);

create table if not exists public.usage_records (
  id bigint generated by default as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entitlement_key text not null references public.entitlements(entitlement_key) on delete restrict,
  quantity bigint not null check (quantity >= 0),
  source_type text,
  source_id text,
  recorded_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

insert into public.plans(plan_key,name) values
('executive','Executive'),('organization','Organization'),('enterprise','Enterprise')
on conflict (plan_key) do nothing;

insert into public.entitlements(entitlement_key,name,unit) values
('organization.seats','Organization seats','count'),
('storage.bytes','Secure storage','bytes'),
('ai.processing.credits','AI processing','credits'),
('meeting_intelligence','Meeting Intelligence','boolean'),
('decision_register','Decision Register','boolean'),
('delegation','Delegation workflows','boolean'),
('departments','Departments and teams','boolean'),
('analytics','Performance analytics','boolean'),
('organizational_knowledge','Organizational knowledge','boolean'),
('audit_governance','Audit and governance','boolean'),
('integrations','External integrations','boolean'),
('api_access','API access','boolean'),
('advanced_security','Advanced security','boolean')
on conflict (entitlement_key) do nothing;

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  object_type text not null,
  object_id text,
  previous_state jsonb,
  new_state jsonb,
  request_id text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  activity_type text not null,
  summary text not null,
  object_type text,
  object_id text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists departments_org_idx on public.departments(organization_id,status);
create index if not exists teams_org_idx on public.teams(organization_id,status);
create index if not exists member_roles_user_idx on public.member_roles(user_id,organization_id);
create index if not exists usage_records_org_time_idx on public.usage_records(organization_id,recorded_at desc);
create index if not exists audit_events_org_time_idx on public.audit_events(organization_id,occurred_at desc);
create index if not exists audit_events_object_idx on public.audit_events(object_type,object_id);
create index if not exists activity_logs_org_time_idx on public.activity_logs(organization_id,occurred_at desc);

create or replace function public.append_phase1_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid;
  object_identifier text;
begin
  org_id := coalesce(
    case when tg_op <> 'DELETE' then (to_jsonb(new)->>'organization_id')::uuid end,
    case when tg_op <> 'INSERT' then (to_jsonb(old)->>'organization_id')::uuid end
  );
  object_identifier := coalesce(
    case when tg_op <> 'DELETE' then to_jsonb(new)->>'id' end,
    case when tg_op <> 'INSERT' then to_jsonb(old)->>'id' end,
    case when tg_op <> 'DELETE' then to_jsonb(new)->>'user_id' end,
    case when tg_op <> 'INSERT' then to_jsonb(old)->>'user_id' end
  );
  insert into public.audit_events(
    organization_id, actor_user_id, event_type, object_type, object_id,
    previous_state, new_state
  ) values (
    org_id, auth.uid(), lower(tg_op), tg_table_name, object_identifier,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;
revoke all on function public.append_phase1_audit_event() from public, anon, authenticated;

drop trigger if exists audit_departments on public.departments;
create trigger audit_departments after insert or update or delete on public.departments
for each row execute function public.append_phase1_audit_event();
drop trigger if exists audit_teams on public.teams;
create trigger audit_teams after insert or update or delete on public.teams
for each row execute function public.append_phase1_audit_event();
drop trigger if exists audit_member_roles on public.member_roles;
create trigger audit_member_roles after insert or update or delete on public.member_roles
for each row execute function public.append_phase1_audit_event();

alter table public.organization_legacy_links enable row level security;
alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.member_roles enable row level security;
alter table public.plans enable row level security;
alter table public.entitlements enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.usage_records enable row level security;
alter table public.audit_events enable row level security;
alter table public.activity_logs enable row level security;

create policy legacy_links_read on public.organization_legacy_links for select to authenticated using (public.is_org_member(organization_id));
create policy legacy_links_manage on public.organization_legacy_links for all to authenticated
using (public.has_org_role(organization_id,array['ceo','org_admin']))
with check (public.has_org_role(organization_id,array['ceo','org_admin']));

create policy departments_read on public.departments for select to authenticated using (public.is_org_member(organization_id));
create policy departments_manage on public.departments for all to authenticated
using (public.has_org_role(organization_id,array['ceo','org_admin','executive','manager']))
with check (public.has_org_role(organization_id,array['ceo','org_admin','executive','manager']));

create policy teams_read on public.teams for select to authenticated using (public.is_org_member(organization_id));
create policy teams_manage on public.teams for all to authenticated
using (public.has_org_role(organization_id,array['ceo','org_admin','executive','manager']))
with check (public.has_org_role(organization_id,array['ceo','org_admin','executive','manager']));

create policy roles_read on public.roles for select to authenticated
using (organization_id is null or public.is_org_member(organization_id));
create policy roles_manage on public.roles for all to authenticated
using (organization_id is not null and public.has_org_role(organization_id,array['ceo','org_admin']))
with check (organization_id is not null and public.has_org_role(organization_id,array['ceo','org_admin']));

create policy permissions_read on public.permissions for select to authenticated using (true);
create policy role_permissions_read on public.role_permissions for select to authenticated
using (exists(select 1 from public.roles r where r.id=role_id and (r.organization_id is null or public.is_org_member(r.organization_id))));
create policy role_permissions_manage on public.role_permissions for all to authenticated
using (exists(select 1 from public.roles r where r.id=role_id and r.organization_id is not null and public.has_org_role(r.organization_id,array['ceo','org_admin'])))
with check (exists(select 1 from public.roles r where r.id=role_id and r.organization_id is not null and public.has_org_role(r.organization_id,array['ceo','org_admin'])));

create policy member_roles_read on public.member_roles for select to authenticated
using (public.is_org_member(organization_id));
create policy member_roles_manage on public.member_roles for all to authenticated
using (public.has_org_role(organization_id,array['ceo','org_admin']))
with check (public.has_org_role(organization_id,array['ceo','org_admin']));

create policy plans_read on public.plans for select to authenticated using (status='active');
create policy entitlements_read on public.entitlements for select to authenticated using (true);
create policy plan_entitlements_read on public.plan_entitlements for select to authenticated using (true);
create policy usage_records_read on public.usage_records for select to authenticated
using (public.has_org_role(organization_id,array['ceo','org_admin','executive','auditor']));
create policy usage_records_insert on public.usage_records for insert to authenticated
with check (public.is_org_member(organization_id) and recorded_by=auth.uid());

create policy audit_events_read on public.audit_events for select to authenticated
using (public.has_org_role(organization_id,array['ceo','org_admin','auditor']));
create policy activity_logs_read on public.activity_logs for select to authenticated
using (public.is_org_member(organization_id));

grant select on public.organization_legacy_links,public.departments,public.teams,public.roles,public.permissions,
public.role_permissions,public.member_roles,public.plans,public.entitlements,public.plan_entitlements,
public.usage_records,public.audit_events,public.activity_logs to authenticated;
grant insert,update,delete on public.organization_legacy_links,public.departments,public.teams,
public.roles,public.role_permissions,public.member_roles to authenticated;
grant insert on public.usage_records to authenticated;
grant usage,select on sequence public.usage_records_id_seq to authenticated;
revoke insert,update,delete on public.audit_events,public.activity_logs from anon,authenticated;
revoke all on public.organization_legacy_links,public.departments,public.teams,public.roles,public.permissions,
public.role_permissions,public.member_roles,public.plans,public.entitlements,public.plan_entitlements,
public.usage_records,public.audit_events,public.activity_logs from anon;

do $$
declare r record;
begin
  for r in
    select schemaname,tablename,policyname
    from pg_policies
    where schemaname='public'
      and tablename like 'executive_%'
      and roles @> array['public'::name]
  loop
    execute format('alter policy %I on %I.%I to authenticated',r.policyname,r.schemaname,r.tablename);
  end loop;
end $$;

comment on table public.audit_events is 'Append-oriented material transaction audit trail. Client roles cannot insert, update or delete.';
comment on table public.organization_legacy_links is 'Compatibility bridge from the canonical organization model to the legacy CEO organization model.';
