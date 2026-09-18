-- Explicit Data API privilege boundary for the Exam & Competency Hub.
-- RLS remains enabled as defense in depth, but anon must not reach these tables.

revoke all on public.exam_bodies, public.exam_programmes, public.exam_syllabus_versions,
  public.exam_topics, public.exam_subtopics, public.exam_competencies,
  public.exam_topic_competencies, public.exam_programme_staff, public.exam_enrollments,
  public.exam_access_grants, public.exam_study_plans, public.exam_study_plan_items,
  public.exam_questions, public.exam_question_competencies, public.exam_assessments,
  public.exam_assessment_items, public.exam_assessment_attempts,
  public.exam_assessment_responses, public.exam_competency_evidence,
  public.exam_recommendations, public.exam_practical_submissions
from anon;

revoke insert, update, delete on public.exam_bodies, public.exam_programmes,
  public.exam_syllabus_versions, public.exam_topics, public.exam_subtopics,
  public.exam_competencies, public.exam_topic_competencies, public.exam_programme_staff,
  public.exam_access_grants, public.exam_study_plans, public.exam_study_plan_items,
  public.exam_questions, public.exam_question_competencies, public.exam_assessments,
  public.exam_assessment_items, public.exam_assessment_attempts,
  public.exam_assessment_responses, public.exam_competency_evidence,
  public.exam_recommendations, public.exam_practical_submissions
from authenticated;

revoke update, delete on public.exam_enrollments from authenticated;
revoke all on private.exam_question_keys from public, anon, authenticated;

-- Helper functions are intentionally available only to signed-in users because RLS
-- policies invoke them. Both derive identity exclusively from auth.uid().
revoke all on function public.is_exam_programme_staff(uuid,text[]) from public, anon;
revoke all on function public.can_access_exam_topic(uuid) from public, anon;
grant execute on function public.is_exam_programme_staff(uuid,text[]) to authenticated;
grant execute on function public.can_access_exam_topic(uuid) to authenticated;
