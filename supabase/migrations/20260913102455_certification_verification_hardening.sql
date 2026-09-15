-- Harden credential eligibility, governed issuance and administrator access.
create or replace function public.is_certification_admin()
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.certification_admins where user_id=(select auth.uid()) and active)
$$;

create or replace function public.merl_foundations_eligibility(p_user_id uuid default auth.uid())
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_caller uuid:=auth.uid();v_completed integer;v_test boolean;
begin
  if v_caller is null then raise exception 'Authentication required' using errcode='42501'; end if;
  p_user_id:=coalesce(p_user_id,v_caller);
  if p_user_id<>v_caller and not public.is_certification_admin() then raise exception 'Learner eligibility is private' using errcode='42501'; end if;
  select lower(coalesce(raw_app_meta_data->>'test_account','false'))='true'
    or lower(coalesce(raw_app_meta_data->>'is_test_account','false'))='true'
    or raw_app_meta_data->>'data_classification'='acceptance_test'
  into v_test from auth.users where id=p_user_id;
  select count(*) into v_completed from public.merl_level1_progress
  where user_id=p_user_id and module_id in('01','02','03','04','05') and module_completed_at is not null;
  return jsonb_build_object('eligible',v_completed=5 and not coalesce(v_test,false),'modules_competent',v_completed,'modules_required',5,'test_account',coalesce(v_test,false),'rule','All five MERL Foundations modules competent and account not classified as acceptance-test.');
end $$;

create or replace function public.request_merl_foundations_review(p_learner_name text,p_declaration boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_template uuid;v_eligibility jsonb;v_request_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not coalesce(p_declaration,false) then raise exception 'Learner integrity declaration is required'; end if;
  if char_length(trim(coalesce(p_learner_name,'')))<3 then raise exception 'Enter the learner name exactly as it should appear on the certificate'; end if;
  select id into v_template from public.certificate_templates where code='MERL-FOUNDATIONS-COMP' and active order by version desc limit 1;
  if v_template is null then raise exception 'The MERL Foundations credential template is unavailable'; end if;
  v_eligibility:=public.merl_foundations_eligibility(auth.uid());
  if not coalesce((v_eligibility->>'eligible')::boolean,false) then raise exception 'MERL Foundations competency gate is not yet satisfied'; end if;
  insert into public.credential_review_requests(user_id,template_id,status,learner_declaration,learner_name,requested_at)
  values(auth.uid(),v_template,'pending',true,trim(p_learner_name),now())
  on conflict(user_id,template_id) do update set status=case when credential_review_requests.status='issued' then 'issued' else 'pending' end,learner_declaration=true,learner_name=case when credential_review_requests.status='issued' then credential_review_requests.learner_name else excluded.learner_name end,requested_at=case when credential_review_requests.status='issued' then credential_review_requests.requested_at else now() end
  returning id into v_request_id;
  return v_request_id;
end $$;

create or replace function public.issue_merl_foundations_credential(p_user_id uuid,p_learner_name text,p_review_notes text default null)
returns text language plpgsql security definer set search_path='' as $$
declare v_template public.certificate_templates%rowtype;v_request public.credential_review_requests%rowtype;v_eligibility jsonb;v_certificate_number text;v_public_credential_id text;v_signatories jsonb;v_competency_evidence jsonb;v_signatory_count integer;v_missing_signatures integer;v_placeholder_names integer;
begin
  if auth.uid() is null or not public.is_certification_admin() then raise exception 'Certification administrator required' using errcode='42501'; end if;
  if p_user_id is null then raise exception 'Learner identifier is required'; end if;
  if char_length(trim(coalesce(p_learner_name,'')))<3 then raise exception 'Learner name is required'; end if;
  select * into v_template from public.certificate_templates where code='MERL-FOUNDATIONS-COMP' and active order by version desc limit 1;
  if v_template.id is null then raise exception 'The MERL Foundations credential template is unavailable'; end if;
  select * into v_request from public.credential_review_requests where user_id=p_user_id and template_id=v_template.id for update;
  if v_request.id is null then raise exception 'No credential review request exists'; end if;
  select credential_id into v_public_credential_id from public.credentials where learner_user_id=p_user_id and template_id=v_template.id and status='valid' limit 1;
  if v_public_credential_id is not null then return v_public_credential_id; end if;
  if v_request.status not in('pending','approved') then raise exception 'Review request is not issuable'; end if;
  v_eligibility:=public.merl_foundations_eligibility(p_user_id);
  if not coalesce((v_eligibility->>'eligible')::boolean,false) then raise exception 'Learner is not currently eligible'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('key',signatory_key,'display_name',display_name,'title',title,'signature_image_url',signature_image_url) order by sort_order),'[]'::jsonb),count(*),count(*) filter(where signature_image_url is null or signature_image_url !~ '^https://'),count(*) filter(where display_name in('Director Name','Facilitator Name'))
  into v_signatories,v_signatory_count,v_missing_signatures,v_placeholder_names from public.certificate_signatories where template_id=v_template.id and active and signatory_key in('director','facilitator');
  if v_signatory_count<>2 or v_missing_signatures>0 or v_placeholder_names>0 then raise exception 'Configure the two authorized signatories and their HTTPS signature assets before issuance'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('module_id',module_id,'quiz_score',quiz_score,'quiz_attempts',quiz_attempts,'module_completed_at',module_completed_at) order by module_id),'[]'::jsonb)
  into v_competency_evidence from public.merl_level1_progress where user_id=p_user_id and module_id in('01','02','03','04','05') and module_completed_at is not null;
  v_certificate_number:='DQA-MERL-'||to_char(current_date,'YYYY')||'-'||lpad(nextval('public.dqa_certificate_seq')::text,6,'0');
  v_public_credential_id:='DQA-'||upper(encode(extensions.gen_random_bytes(16),'hex'));
  insert into public.credentials(credential_id,certificate_number,template_id,learner_user_id,learner_name,programme_title,credential_type,result,issued_by,snapshot,metadata)
  values(v_public_credential_id,v_certificate_number,v_template.id,p_user_id,trim(p_learner_name),v_template.programme_title,v_template.credential_type,v_template.result_label,auth.uid(),jsonb_build_object('template',jsonb_build_object('code',v_template.code,'version',v_template.version,'certificate_title',v_template.certificate_title,'programme_title',v_template.programme_title,'achievement_statement',v_template.achievement_statement,'detail_statement',v_template.detail_statement,'theme',v_template.theme),'signatories',v_signatories),jsonb_build_object('eligibility_at_issue',v_eligibility,'competency_evidence',v_competency_evidence,'review_request_id',v_request.id,'review_notes',p_review_notes));
  update public.credential_review_requests set status='issued',learner_name=trim(p_learner_name),reviewer_notes=p_review_notes,reviewed_by=auth.uid(),reviewed_at=now() where id=v_request.id;
  return v_public_credential_id;
end $$;

drop policy if exists credentials_admin_manage on public.credentials;
create policy credentials_admin_manage on public.credentials for all to authenticated using(public.is_certification_admin()) with check(public.is_certification_admin());
revoke all on function public.is_certification_admin() from public,anon;
revoke all on function public.merl_foundations_eligibility(uuid) from public,anon;
revoke all on function public.request_merl_foundations_review(text,boolean) from public,anon;
revoke all on function public.issue_merl_foundations_credential(uuid,text,text) from public,anon;
grant execute on function public.is_certification_admin() to authenticated;
grant execute on function public.merl_foundations_eligibility(uuid) to authenticated;
grant execute on function public.request_merl_foundations_review(text,boolean) to authenticated;
grant execute on function public.issue_merl_foundations_credential(uuid,text,text) to authenticated;
grant insert,update on public.credentials to authenticated;
