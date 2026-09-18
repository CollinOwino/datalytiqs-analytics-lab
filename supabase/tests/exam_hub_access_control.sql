-- Exam Hub Phase 1 access-control verification. Run on a disposable branch.
begin;

do $$
begin
  if has_table_privilege('authenticated','private.exam_question_keys','select') then
    raise exception 'ANSWER_KEY_READ_LEAK';
  end if;
  if has_table_privilege('anon','public.exam_access_grants','select') then
    raise exception 'ANON_ENTITLEMENT_READ_LEAK';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.exam_access_grants'::regclass) then
    raise exception 'ENTITLEMENT_RLS_DISABLED';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.exam_assessment_attempts'::regclass) then
    raise exception 'ATTEMPT_RLS_DISABLED';
  end if;
  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name in ('exam_assessment_attempts','exam_assessment_responses','exam_competency_evidence')
      and grantee in ('anon','authenticated') and privilege_type in ('UPDATE','DELETE')
  ) then
    raise exception 'IMMUTABLE_EVIDENCE_MUTATION_ALLOWED';
  end if;
end $$;

rollback;
select 'EXAM_HUB_ACCESS_CONTROL_TEST_PASSED' as result;
