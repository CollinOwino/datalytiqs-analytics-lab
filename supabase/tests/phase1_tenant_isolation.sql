-- Phase 1 security verification.
-- Run against a disposable branch or inside a transaction.
-- The fixed UUID below is rolled back and never persists.

begin;

insert into public.organizations(id,name,slug,created_by)
values (
  '11111111-2222-4333-8444-555555555555',
  'PHASE1 ISOLATION TEST',
  'phase1-isolation-test',
  '2040e12b-b5ed-4c37-b01d-93b859e6b492'
);

select set_config(
  'request.jwt.claim.sub',
  '2040e12b-b5ed-4c37-b01d-93b859e6b492',
  true
);
set local role authenticated;

do $test$
declare
  visible_count integer;
  audit_count integer;
begin
  select count(*) into visible_count
  from public.organizations
  where id='11111111-2222-4333-8444-555555555555';

  if visible_count <> 0 then
    raise exception 'CROSS_TENANT_READ_ALLOWED';
  end if;

  begin
    insert into public.departments(organization_id,name,created_by)
    values (
      '11111111-2222-4333-8444-555555555555',
      'Unauthorized Department',
      auth.uid()
    );
    raise exception 'CROSS_TENANT_WRITE_ALLOWED';
  exception
    when insufficient_privilege then null;
  end;

  insert into public.departments(organization_id,name,created_by)
  values (
    'b994229a-4298-4ae6-b97e-766d2b9f7528',
    'Authorized Audit Test',
    auth.uid()
  );

  select count(*) into audit_count
  from public.audit_events
  where organization_id='b994229a-4298-4ae6-b97e-766d2b9f7528'
    and object_type='departments'
    and event_type='insert';

  if audit_count < 1 then
    raise exception 'AUDIT_TRIGGER_DID_NOT_RECORD';
  end if;
end
$test$;

reset role;
rollback;

select 'TENANT_ISOLATION_AND_AUDIT_TEST_PASSED' as result;
