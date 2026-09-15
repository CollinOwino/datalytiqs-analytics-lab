-- Recreate the issuance function so the cryptographic generator is resolvable
-- under its deliberately locked-down search path.
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

revoke all on function public.issue_merl_foundations_credential(uuid,text,text) from public,anon;
grant execute on function public.issue_merl_foundations_credential(uuid,text,text) to authenticated;
