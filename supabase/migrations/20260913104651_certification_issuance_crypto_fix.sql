-- Make the pgcrypto generator resolvable without exposing application schemas.
alter function public.issue_merl_foundations_credential(uuid,text,text)
set search_path to '', extensions;
