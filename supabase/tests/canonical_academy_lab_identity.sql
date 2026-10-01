-- Canonical Academy ↔ Lab identity acceptance checks.
-- Run in a transaction against a disposable/synthetic auth fixture.

begin;

do $$
begin
  if not exists (
    select 1 from pg_class
    where oid='public.learner_identity_links'::regclass
      and relrowsecurity
  ) then raise exception 'IDENTITY_LINK_RLS_DISABLED'; end if;

  if has_table_privilege('anon','public.learner_identity_links','select') then
    raise exception 'ANON_IDENTITY_LINK_READ_LEAK';
  end if;

  if has_function_privilege('authenticated','public.resolve_tutor_learner_identity(bigint,text)','execute') then
    raise exception 'AUTHENTICATED_CAN_EXECUTE_IDENTITY_RESOLVER';
  end if;

  if not has_function_privilege('service_role','public.resolve_tutor_learner_identity(bigint,text)','execute') then
    raise exception 'SERVICE_ROLE_CANNOT_EXECUTE_IDENTITY_RESOLVER';
  end if;
end $$;

rollback;
