-- Preserve learner progress recorded before subtopic-level tracking was introduced.
-- A topic explicitly marked complete in the previous UI maps to all of its
-- constituent subtopics being complete in the guided workspace.
insert into public.exam_subtopic_progress (
  enrollment_id,
  user_id,
  subtopic_id,
  status,
  started_at,
  completed_at,
  updated_at
)
select
  progress.enrollment_id,
  progress.user_id,
  subtopic.id,
  'completed',
  coalesce(progress.started_at, progress.updated_at),
  coalesce(progress.completed_at, progress.updated_at),
  progress.updated_at
from public.exam_topic_progress as progress
join public.exam_subtopics as subtopic
  on subtopic.topic_id = progress.topic_id
where progress.status = 'completed'
on conflict (enrollment_id, subtopic_id) do nothing;
