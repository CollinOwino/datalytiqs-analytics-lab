create policy "No direct Level 2 answer-key access"
on public.merl_level2_quiz_items
for select
to authenticated
using (false);
