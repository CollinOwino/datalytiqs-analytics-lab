revoke execute on function public.is_org_member(uuid) from anon;
revoke execute on function public.has_org_role(uuid,text[]) from anon;
revoke execute on function public.provision_premium_organization(text,text,text,text) from anon;
revoke execute on function public.complete_organization_onboarding(uuid,text,jsonb,jsonb,text) from anon;
