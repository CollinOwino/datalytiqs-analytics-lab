-- Young Analysts reviewer authorization hardening
-- Reviewer access is cohort-scoped; learners remain owner-scoped.
create or replace function public.can_review_young_analyst(p_learner_user_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.ya_cohort_memberships reviewer join public.ya_cohort_memberships learner on learner.cohort_id=reviewer.cohort_id where reviewer.user_id=auth.uid() and reviewer.status='active' and reviewer.member_role in ('instructor','facilitator') and learner.user_id=p_learner_user_id and learner.status='active' and learner.member_role='learner');
$$;
revoke all on function public.can_review_young_analyst(uuid) from public,anon;
grant execute on function public.can_review_young_analyst(uuid) to authenticated;

drop policy if exists "YA reviewer reads assigned evidence" on public.young_analyst_evidence;
create policy "YA reviewer reads assigned evidence" on public.young_analyst_evidence for select to authenticated using(public.can_review_young_analyst(user_id));
drop policy if exists "YA reviewer reads assigned competency" on public.young_analyst_competency_state;
create policy "YA reviewer reads assigned competency" on public.young_analyst_competency_state for select to authenticated using(public.can_review_young_analyst(user_id));
drop policy if exists "YA reviewer reads assigned reviews" on public.young_analyst_reviews;
create policy "YA reviewer reads assigned reviews" on public.young_analyst_reviews for select to authenticated using(exists(select 1 from public.young_analyst_evidence e where e.id=evidence_id and public.can_review_young_analyst(e.user_id)));

create or replace function public.review_young_analyst_evidence(p_evidence_id uuid,p_method integer,p_testing integer,p_reasoning integer,p_responsible integer,p_feedback text)
returns table(total_score integer,decision text,track_slug text) language plpgsql security definer set search_path=public as $$
declare e public.young_analyst_evidence%rowtype; v_total integer; v_decision text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_method not between 0 and 3 or p_testing not between 0 and 3 or p_reasoning not between 0 and 3 or p_responsible not between 0 and 3 then raise exception 'Rubric scores must be whole numbers from 0 to 3'; end if;
 select * into e from public.young_analyst_evidence where id=p_evidence_id; if not found then raise exception 'Evidence not found'; end if;
 if not public.can_review_young_analyst(e.user_id) then raise exception 'Not authorized to review this learner'; end if;
 v_total:=p_method+p_testing+p_reasoning+p_responsible; v_decision:=case when v_total>=8 and p_responsible>0 then 'competent' else 'revision_needed' end;
 insert into public.young_analyst_reviews(evidence_id,reviewer_id,method_score,testing_score,reasoning_score,responsible_score,total_score,decision,feedback) values(p_evidence_id,auth.uid(),p_method,p_testing,p_reasoning,p_responsible,v_total,v_decision,coalesce(trim(p_feedback),''));
 update public.young_analyst_evidence set status=v_decision,updated_at=now() where id=p_evidence_id;
 insert into public.young_analyst_competency_state(user_id,track_slug,module_code,status,latest_evidence_id,rubric_score,updated_at) values(e.user_id,e.track_slug,e.module_code,v_decision,e.id,v_total,now()) on conflict(user_id,track_slug,module_code) do update set status=excluded.status,latest_evidence_id=excluded.latest_evidence_id,rubric_score=excluded.rubric_score,updated_at=excluded.updated_at;
 return query select v_total,v_decision,e.track_slug;
end; $$;
revoke all on function public.review_young_analyst_evidence(uuid,integer,integer,integer,integer,text) from public,anon;
grant execute on function public.review_young_analyst_evidence(uuid,integer,integer,integer,integer,text) to authenticated;
revoke all on public.young_analyst_lesson_progress,public.young_analyst_evidence,public.young_analyst_quiz_attempts,public.young_analyst_reviews,public.young_analyst_competency_state from anon;
grant select,insert,update on public.young_analyst_lesson_progress to authenticated;
grant select,insert on public.young_analyst_evidence to authenticated;
grant select,insert on public.young_analyst_quiz_attempts to authenticated;
grant select on public.young_analyst_reviews to authenticated;
grant select,insert,update on public.young_analyst_competency_state to authenticated;
