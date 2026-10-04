-- WooCommerce -> shared learner entitlement bridge for Python for Kids.

create table public.learning_commerce_products (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('woocommerce')),
  external_product_id text,
  sku text,
  programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  access_level text not null default 'full' check (access_level in ('full','guided','school')),
  duration_days integer check (duration_days is null or duration_days between 1 and 3650),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (external_product_id is not null or sku is not null)
);
create unique index learning_commerce_product_id_unique on public.learning_commerce_products(provider,external_product_id) where external_product_id is not null;
create unique index learning_commerce_product_sku_unique on public.learning_commerce_products(provider,sku) where sku is not null;

create table public.learning_commerce_events (
  event_id uuid primary key,
  provider text not null check (provider in ('woocommerce')),
  event_type text not null,
  external_order_id text not null,
  order_status text not null,
  purchaser_email text not null,
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  mapped_user_id uuid references auth.users(id) on delete set null,
  processing_status text not null check (processing_status in ('granted','pending_identity','revoked','ignored')),
  processed_at timestamptz not null default now()
);

create table public.learning_pending_entitlements (
  id uuid primary key default gen_random_uuid(),
  purchaser_email text not null,
  programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  access_level text not null check (access_level in ('full','guided','school')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  source_reference text not null unique,
  status text not null default 'pending' check (status in ('pending','claimed','revoked')),
  claimed_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create unique index learning_access_grants_source_unique on public.learning_access_grants(programme_id,source_reference) where source_reference is not null;
create index learning_pending_email_idx on public.learning_pending_entitlements(lower(purchaser_email),status);

alter table public.learning_commerce_products enable row level security;
alter table public.learning_commerce_events enable row level security;
alter table public.learning_pending_entitlements enable row level security;
revoke all on public.learning_commerce_products,public.learning_commerce_events,public.learning_pending_entitlements from anon,authenticated;
grant all on public.learning_commerce_products,public.learning_commerce_events,public.learning_pending_entitlements to service_role;

insert into public.learning_commerce_products(provider,sku,programme_id,access_level,duration_days)
select 'woocommerce','PYKIDS-FULL',id,'full',365 from public.learning_programmes where code='PY-KIDS'
on conflict(provider,sku) where sku is not null do update set programme_id=excluded.programme_id,access_level=excluded.access_level,duration_days=excluded.duration_days,active=true;

create or replace function private.claim_learning_entitlement(p_user_id uuid,p_email text,p_programme_id uuid,p_access_level text,p_starts_at timestamptz,p_expires_at timestamptz,p_source_reference text)
returns void language plpgsql security definer set search_path='' as $$
begin
  insert into public.young_learner_profiles(user_id,safeguarding_status) values(p_user_id,'pilot') on conflict(user_id) do nothing;
  insert into public.learning_enrollments(user_id,programme_id,status,enrolment_source) values(p_user_id,p_programme_id,'active','woocommerce')
  on conflict(user_id,programme_id) do update set status='active',enrolment_source='woocommerce';
  insert into public.learning_access_grants(user_id,programme_id,access_level,starts_at,expires_at,revoked_at,source_reference)
  values(p_user_id,p_programme_id,p_access_level,p_starts_at,p_expires_at,null,p_source_reference)
  on conflict(programme_id,source_reference) where source_reference is not null do update set user_id=excluded.user_id,access_level=excluded.access_level,starts_at=excluded.starts_at,expires_at=excluded.expires_at,revoked_at=null;
end $$;

create or replace function public.process_learning_commerce_event(p_event_id uuid,p_event_type text,p_order_id text,p_order_status text,p_email text,p_items jsonb,p_payload_sha256 text)
returns table(processing_status text,learner_mapped boolean,entitlements_changed integer)
language plpgsql security definer set search_path='' as $$
declare v_email text:=lower(trim(p_email));v_user uuid;v_changed integer:=0;v_status text;v_item jsonb;v_product public.learning_commerce_products%rowtype;v_reference text;v_starts timestamptz:=now();v_expires timestamptz;
begin
  if p_event_id is null or p_order_id='' or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or jsonb_typeof(p_items)<>'array' or p_payload_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'Invalid commerce event'; end if;
  if exists(select 1 from public.learning_commerce_events where event_id=p_event_id) then return query select e.processing_status,e.mapped_user_id is not null,0 from public.learning_commerce_events e where e.event_id=p_event_id;return;end if;
  select id into v_user from auth.users where lower(email)=v_email order by created_at limit 1;
  v_status:=case when p_order_status in ('processing','completed') then case when v_user is null then 'pending_identity' else 'granted' end when p_order_status in ('cancelled','refunded','failed') then 'revoked' else 'ignored' end;
  for v_item in select value from jsonb_array_elements(p_items) loop
    select * into v_product from public.learning_commerce_products product where product.provider='woocommerce' and product.active and ((product.external_product_id is not null and product.external_product_id=v_item->>'product_id') or (product.sku is not null and product.sku=v_item->>'sku')) order by (product.external_product_id is not null) desc limit 1;
    if v_product.id is null then continue;end if;
    v_reference:='woocommerce:order:'||p_order_id||':product:'||coalesce(v_item->>'product_id',v_item->>'sku');v_expires:=case when v_product.duration_days is null then null else v_starts+make_interval(days=>v_product.duration_days) end;
    if p_order_status in ('processing','completed') then
      if v_user is null then insert into public.learning_pending_entitlements(purchaser_email,programme_id,access_level,starts_at,expires_at,source_reference,status) values(v_email,v_product.programme_id,v_product.access_level,v_starts,v_expires,v_reference,'pending') on conflict(source_reference) do update set purchaser_email=excluded.purchaser_email,access_level=excluded.access_level,starts_at=excluded.starts_at,expires_at=excluded.expires_at,status='pending',updated_at=now();
      else perform private.claim_learning_entitlement(v_user,v_email,v_product.programme_id,v_product.access_level,v_starts,v_expires,v_reference);insert into public.learning_pending_entitlements(purchaser_email,programme_id,access_level,starts_at,expires_at,source_reference,status,claimed_user_id) values(v_email,v_product.programme_id,v_product.access_level,v_starts,v_expires,v_reference,'claimed',v_user) on conflict(source_reference) do update set status='claimed',claimed_user_id=v_user,updated_at=now();end if;v_changed:=v_changed+1;
    elsif p_order_status in ('cancelled','refunded','failed') then update public.learning_access_grants set revoked_at=now() where programme_id=v_product.programme_id and source_reference=v_reference and revoked_at is null;update public.learning_pending_entitlements set status='revoked',updated_at=now() where source_reference=v_reference;v_changed:=v_changed+1;end if;
  end loop;
  insert into public.learning_commerce_events(event_id,provider,event_type,external_order_id,order_status,purchaser_email,payload_sha256,mapped_user_id,processing_status) values(p_event_id,'woocommerce',p_event_type,p_order_id,p_order_status,v_email,p_payload_sha256,v_user,case when v_changed=0 then 'ignored' else v_status end);
  return query select case when v_changed=0 then 'ignored' else v_status end,v_user is not null,v_changed;
end $$;

create or replace function private.claim_pending_learning_entitlements()
returns trigger language plpgsql security definer set search_path='' as $$
declare pending record;
begin
  for pending in select * from public.learning_pending_entitlements where lower(purchaser_email)=lower(new.email) and status='pending' loop
    perform private.claim_learning_entitlement(new.id,new.email,pending.programme_id,pending.access_level,pending.starts_at,pending.expires_at,pending.source_reference);
    update public.learning_pending_entitlements set status='claimed',claimed_user_id=new.id,updated_at=now() where id=pending.id;
  end loop;return new;
end $$;
drop trigger if exists claim_learning_entitlements_after_signup on auth.users;
create trigger claim_learning_entitlements_after_signup after insert on auth.users for each row execute function private.claim_pending_learning_entitlements();

revoke all on function public.process_learning_commerce_event(uuid,text,text,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.process_learning_commerce_event(uuid,text,text,text,text,jsonb,text) to service_role;
