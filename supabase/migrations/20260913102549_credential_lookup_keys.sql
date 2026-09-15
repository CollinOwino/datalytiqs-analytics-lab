-- Accept credential ID, certificate number or opaque verification key in public verification.
create or replace function public.verify_credential(p_credential_id text)
returns table(credential_id text,certificate_number text,learner_name text,programme_title text,credential_type text,result text,issue_date date,status text,verification_slug text)
language sql stable security definer set search_path='' as $$
  select c.credential_id,c.certificate_number,c.learner_name,c.programme_title,c.credential_type,c.result,c.issue_date,c.status,c.verification_slug
  from public.credentials c
  where upper(c.credential_id)=upper(trim(p_credential_id))
     or upper(c.certificate_number)=upper(trim(p_credential_id))
     or c.verification_slug=lower(trim(p_credential_id))
  limit 1
$$;
revoke all on function public.verify_credential(text) from public;
grant execute on function public.verify_credential(text) to anon,authenticated;
