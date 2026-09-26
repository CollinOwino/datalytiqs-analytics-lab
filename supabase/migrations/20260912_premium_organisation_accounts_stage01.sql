create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  sector text,
  country text not null default 'Kenya',
  logo_url text,
  onboarding_status text not null default 'draft'
    check (onboarding_status in ('draft','active','suspended')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('ceo','org_admin','manager','facilitator','learner')),
  job_title text,
  status text not null default 'active' check (status in ('invited','active','suspended')),
  joined_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);

create table if not exists public.organization_subscriptions (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  plan text not null default 'premium' check (plan in ('premium','enterprise')),
  status text not null default 'trialing'
    check (status in ('trialing','active','past_due','cancelled','suspended')),
  seats integer not null default 10 check (seats > 0),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  learning_priorities jsonb not null default '[]'::jsonb,
  dashboard_config jsonb not null default
    '{"widgets":["workforce_learning","competency_certification","analytics_activity","evidence_portfolio","organisation_impact"]}'::jsonb,
  reporting_period text not null default 'rolling_90_days',
  timezone text not null default 'Africa/Nairobi',
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('ceo','org_admin','manager','facilitator','learner')),
  status text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  token_hash text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  invited_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists organization_members_user_idx on public.organization_members(user_id, organization_id);
create index if not exists organization_invites_org_idx on public.organization_invites(organization_id, status);
create unique index if not exists organization_invites_pending_email_uq on public.organization_invites(organization_id, lower(email)) where status='pending';

create or replace function public.is_org_member(org_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organization_members m where m.organization_id=org_id and m.user_id=auth.uid() and m.status='active'); $$;

create or replace function public.has_org_role(org_id uuid, allowed_roles text[]) returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organization_members m where m.organization_id=org_id and m.user_id=auth.uid() and m.status='active' and m.role=any(allowed_roles)); $$;

create or replace function public.provision_premium_organization(p_name text,p_slug text,p_sector text default null,p_country text default 'Kenya')
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  insert into public.organizations(name,slug,sector,country,created_by,onboarding_status)
  values(trim(p_name),lower(trim(p_slug)),nullif(trim(p_sector),''),coalesce(nullif(trim(p_country),''),'Kenya'),v_user,'draft')
  returning id into v_org;
  insert into public.organization_members(organization_id,user_id,role,status) values(v_org,v_user,'ceo','active');
  insert into public.organization_subscriptions(organization_id,plan,status,seats) values(v_org,'premium','trialing',10);
  insert into public.organization_settings(organization_id) values(v_org);
  return v_org;
end; $$;

create or replace function public.complete_organization_onboarding(p_org uuid,p_sector text,p_learning_priorities jsonb,p_dashboard_config jsonb,p_reporting_period text default 'rolling_90_days')
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_org_role(p_org,array['ceo','org_admin']) then raise exception 'Not authorized'; end if;
  update public.organizations set sector=nullif(trim(p_sector),''),onboarding_status='active',updated_at=now() where id=p_org;
  update public.organization_settings set learning_priorities=coalesce(p_learning_priorities,'[]'::jsonb),dashboard_config=coalesce(p_dashboard_config,dashboard_config),reporting_period=coalesce(nullif(trim(p_reporting_period),''),reporting_period),updated_at=now() where organization_id=p_org;
end; $$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_subscriptions enable row level security;
alter table public.organization_settings enable row level security;
alter table public.organization_invites enable row level security;

create policy org_select_member on public.organizations for select to authenticated using (public.is_org_member(id));
create policy org_update_admin on public.organizations for update to authenticated using (public.has_org_role(id,array['ceo','org_admin'])) with check (public.has_org_role(id,array['ceo','org_admin']));
create policy member_select_org on public.organization_members for select to authenticated using (public.is_org_member(organization_id));
create policy member_manage_admin on public.organization_members for all to authenticated using (public.has_org_role(organization_id,array['ceo','org_admin'])) with check (public.has_org_role(organization_id,array['ceo','org_admin']));
create policy subscription_select_exec on public.organization_subscriptions for select to authenticated using (public.has_org_role(organization_id,array['ceo','org_admin']));
create policy settings_select_org on public.organization_settings for select to authenticated using (public.is_org_member(organization_id));
create policy settings_manage_admin on public.organization_settings for update to authenticated using (public.has_org_role(organization_id,array['ceo','org_admin'])) with check (public.has_org_role(organization_id,array['ceo','org_admin']));
create policy invite_select_admin on public.organization_invites for select to authenticated using (public.has_org_role(organization_id,array['ceo','org_admin']));
create policy invite_insert_admin on public.organization_invites for insert to authenticated with check (public.has_org_role(organization_id,array['ceo','org_admin']) and invited_by=auth.uid());
create policy invite_update_admin on public.organization_invites for update to authenticated using (public.has_org_role(organization_id,array['ceo','org_admin'])) with check (public.has_org_role(organization_id,array['ceo','org_admin']));

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid,text[]) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid,text[]) to authenticated;
grant execute on function public.provision_premium_organization(text,text,text,text) to authenticated;
grant execute on function public.complete_organization_onboarding(uuid,text,jsonb,jsonb,text) to authenticated;
