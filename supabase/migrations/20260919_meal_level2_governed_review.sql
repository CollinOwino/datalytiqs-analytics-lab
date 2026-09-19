-- Governed Level 2 MEAL professional review workflow.
-- Production-applied migration: meal_level2_governed_review_workflow.
-- Creates learner review requests, eight-dimension human scoring, self-review prevention,
-- and a mandatory issuance guard that rejects synthetic/acceptance-test learners.

create table if not exists public.meal_level2_review_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learner_name text not null check (char_length(trim(learner_name)) >= 3),
  integrity_declaration boolean not null default false,
  test_account_snapshot boolean not null default false,
  status text not null default 'pending' check (status in ('pending','changes_requested','approved','rejected')),
  rubric_scores jsonb,
  rubric_total integer,
  reviewer_notes text,
  reviewed_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id)
);
alter table public.meal_level2_review_requests enable row level security;
drop policy if exists meal_review_own_read on public.meal_level2_review_requests;
create policy meal_review_own_read on public.meal_level2_review_requests for select to authenticated using (user_id=auth.uid() or public.is_certification_admin());
drop policy if exists meal_review_admin_update on public.meal_level2_review_requests;
create policy meal_review_admin_update on public.meal_level2_review_requests for update to authenticated using (public.is_certification_admin() and user_id<>auth.uid()) with check (public.is_certification_admin() and user_id<>auth.uid());

create or replace function public.request_meal_level2_review(p_learner_name text,p_declaration boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_id uuid; v_complete int; v_test boolean;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if not coalesce(p_declaration,false) then raise exception 'Integrity declaration is required'; end if;
 if char_length(trim(coalesce(p_learner_name,'')))<3 then raise exception 'Learner name is required'; end if;
 select count(*) into v_complete from public.merl_level2_progress where user_id=v_user and module_id in ('06','07','08','09','10') and module_completed_at is not null;
 if v_complete<>5 then raise exception 'All five Level 2 competency modules must be complete'; end if;
 select coalesce((raw_app_meta_data->>'test_account')::boolean,false) or coalesce((raw_app_meta_data->>'is_test_account')::boolean,false) or coalesce(raw_app_meta_data->>'data_classification','')='acceptance_test' into v_test from auth.users where id=v_user;
 insert into public.meal_level2_review_requests(user_id,learner_name,integrity_declaration,test_account_snapshot,status,rubric_scores,rubric_total,reviewer_notes,reviewed_by,reviewed_at,requested_at,updated_at)
 values(v_user,trim(p_learner_name),true,coalesce(v_test,false),'pending',null,null,null,null,null,now(),now())
 on conflict(user_id) do update set learner_name=excluded.learner_name,integrity_declaration=true,test_account_snapshot=excluded.test_account_snapshot,status='pending',rubric_scores=null,rubric_total=null,reviewer_notes=null,reviewed_by=null,reviewed_at=null,requested_at=now(),updated_at=now()
 where public.meal_level2_review_requests.status in ('changes_requested','rejected')
 returning id into v_id;
 if v_id is null then select id into v_id from public.meal_level2_review_requests where user_id=v_user; end if;
 return v_id;
end $$;

create or replace function public.review_meal_level2_request(p_request_id uuid,p_decision text,p_scores jsonb,p_notes text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.meal_level2_review_requests%rowtype; v_total int:=0; v_key text; v_val int; v_competent boolean; v_strong boolean;
declare required_keys text[]:=array['results_logic','measurement','integrity','accountability','analysis','learning','adaptation','communication'];
begin
 if auth.uid() is null or not public.is_certification_admin() then raise exception 'Certification administrator access required'; end if;
 select * into r from public.meal_level2_review_requests where id=p_request_id for update;
 if not found then raise exception 'Review request not found'; end if;
 if r.user_id=auth.uid() then raise exception 'Reviewers cannot review their own portfolio'; end if;
 if r.status<>'pending' then raise exception 'Only pending requests can be reviewed'; end if;
 if p_decision not in ('approved','changes_requested','rejected') then raise exception 'Invalid review decision'; end if;
 if p_scores is null or jsonb_typeof(p_scores)<>'object' then raise exception 'Eight-dimension rubric scores are required'; end if;
 if (select count(*) from jsonb_object_keys(p_scores))<>8 then raise exception 'Exactly eight rubric dimensions are required'; end if;
 foreach v_key in array required_keys loop
   if not (p_scores ? v_key) then raise exception 'Missing rubric dimension: %',v_key; end if;
   begin v_val:=(p_scores->>v_key)::int; exception when others then raise exception 'Rubric scores must be integers'; end;
   if v_val<0 or v_val>3 then raise exception 'Rubric scores must be between 0 and 3'; end if;
   v_total:=v_total+v_val;
 end loop;
 v_competent:=v_total>=16 and (p_scores->>'integrity')::int>0 and (p_scores->>'accountability')::int>0;
 v_strong:=v_total>=20 and not exists(select 1 from jsonb_each_text(p_scores) e where e.value::int<2);
 if p_decision='approved' and not v_competent then raise exception 'Approval requires at least 16/24 and no zero in critical gates'; end if;
 if p_decision in ('changes_requested','rejected') and nullif(trim(coalesce(p_notes,'')),'') is null then raise exception 'Reviewer notes are required'; end if;
 update public.meal_level2_review_requests set status=p_decision,rubric_scores=p_scores,rubric_total=v_total,reviewer_notes=nullif(trim(coalesce(p_notes,'')),''),reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=p_request_id;
 return jsonb_build_object('status',p_decision,'total',v_total,'competent',v_competent,'strong',v_strong,'credential_eligible',(p_decision='approved' and v_competent and not r.test_account_snapshot));
end $$;

create or replace function public.assert_meal_level2_credential_issuable(p_user_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.meal_level2_review_requests%rowtype; v_test boolean;
begin
 if auth.uid() is null or not public.is_certification_admin() then raise exception 'Certification administrator access required'; end if;
 select * into r from public.meal_level2_review_requests where user_id=p_user_id;
 if not found or r.status<>'approved' or coalesce(r.rubric_total,0)<16 then raise exception 'Approved professional MEAL review required'; end if;
 select coalesce((raw_app_meta_data->>'test_account')::boolean,false) or coalesce((raw_app_meta_data->>'is_test_account')::boolean,false) or coalesce(raw_app_meta_data->>'data_classification','')='acceptance_test' into v_test from auth.users where id=p_user_id;
 if coalesce(v_test,false) or r.test_account_snapshot then raise exception 'Synthetic or acceptance-test learners are not eligible for credential issuance'; end if;
 return true;
end $$;
revoke execute on function public.request_meal_level2_review(text,boolean) from public,anon;
grant execute on function public.request_meal_level2_review(text,boolean) to authenticated;
revoke execute on function public.review_meal_level2_request(uuid,text,jsonb,text) from public,anon;
grant execute on function public.review_meal_level2_request(uuid,text,jsonb,text) to authenticated;
revoke execute on function public.assert_meal_level2_credential_issuable(uuid) from public,anon;
grant execute on function public.assert_meal_level2_credential_issuable(uuid) to authenticated;

-- Force all state changes through the governed SECURITY DEFINER RPCs above.
revoke insert, update, delete on table public.meal_level2_review_requests from anon, authenticated;
grant select on table public.meal_level2_review_requests to authenticated;
