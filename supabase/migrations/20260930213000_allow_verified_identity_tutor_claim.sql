-- Permit an already verified Lab identity with no Tutor ID to claim its first stable Tutor identity.
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
     or p_user_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+ then
    raise exception 'Invalid learner identity fields';
  end if;
  select learner_id into v_learner_id from public.learner_identity_links where tutor_user_id = p_tutor_user_id;
  if v_learner_id is not null then
    update public.learner_identity_links set last_verified_at=now(), academy_email=lower(trim(p_user_email)) where learner_id=v_learner_id;
    return v_learner_id;
  end if;
  select id into v_learner_id from auth.users where lower(email)=lower(trim(p_user_email)) limit 1;
  if v_learner_id is null then return null; end if;
  select learner_id into v_existing from public.learner_identity_links where learner_id=v_learner_id;
  if v_existing is not null then
    update public.learner_identity_links
      set tutor_user_id=p_tutor_user_id, academy_email=lower(trim(p_user_email)), last_verified_at=now()
    where learner_id=v_learner_id and tutor_user_id is null;
    if found then return v_learner_id; end if;
    return null;
  end if;
  insert into public.learner_identity_links(learner_id,tutor_user_id,academy_email,link_method)
  values(v_learner_id,p_tutor_user_id,lower(trim(p_user_email)),'verified_event');
  return v_learner_id;
end;
$$;
revoke all on function public.resolve_tutor_learner_identity(bigint,text) from public, anon, authenticated;
grant execute on function public.resolve_tutor_learner_identity(bigint,text) to service_role;
 then
    raise exception 'Invalid learner identity fields';
  end if;
  select learner_id into v_learner_id from public.learner_identity_links where tutor_user_id = p_tutor_user_id;
  if v_learner_id is not null then
    update public.learner_identity_links set last_verified_at=now(), academy_email=lower(trim(p_user_email)) where learner_id=v_learner_id;
    return v_learner_id;
  end if;
  select id into v_learner_id from auth.users where lower(email)=lower(trim(p_user_email)) limit 1;
  if v_learner_id is null then return null; end if;
  select learner_id into v_existing from public.learner_identity_links where learner_id=v_learner_id;
  if v_existing is not null then
    update public.learner_identity_links
      set tutor_user_id=p_tutor_user_id, academy_email=lower(trim(p_user_email)), last_verified_at=now()
    where learner_id=v_learner_id and tutor_user_id is null;
    if found then return v_learner_id; end if;
    return null;
  end if;
  insert into public.learner_identity_links(learner_id,tutor_user_id,academy_email,link_method)
  values(v_learner_id,p_tutor_user_id,lower(trim(p_user_email)),'verified_event');
  return v_learner_id;
end;
$$;
revoke all on function public.resolve_tutor_learner_identity(bigint,text) from public, anon, authenticated;
grant execute on function public.resolve_tutor_learner_identity(bigint,text) to service_role;
