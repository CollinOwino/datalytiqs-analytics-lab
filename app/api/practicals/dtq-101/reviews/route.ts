import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { DTQ_COURSE, dtqAccess } from '../../../../../lib/practicals/dtq101'

export const dynamic = 'force-dynamic'
function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status, headers: { 'Cache-Control': 'no-store' } })
}
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return fail('Invalid request origin.', 403)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Sign in as an assigned instructor.', 401)
  const { reviewer } = await dtqAccess(user.id)
  if (!reviewer) return fail('Instructor authorization required.', 403)
  let input: Record<string, unknown>
  try { input = await request.json() } catch { return fail('Invalid review form.', 400) }
  const id = String(input.id || '')
  const feedback = String(input.feedback || '').trim()
  const determination = input.determination
  const limits = { questionnaire: 40, codebook: 25, pilot: 20, interpretation: 15 } as const
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['graded','revision_requested'].includes(String(determination)) ||
      feedback.length < 30 || feedback.length > 3000) return fail('Provide a valid determination and substantive feedback.', 400)
  const rubric: Record<string, number> = {}
  for (const [key, maximum] of Object.entries(limits)) {
    const raw = (input.rubric as Record<string, unknown> | undefined)?.[key]
    const score = typeof raw === 'number' ? raw : Number.NaN
    if (!Number.isInteger(score) || score < 0 || score > maximum)
      return fail(`Provide a valid integer score for ${key} (0–${maximum}).`, 400)
    rubric[key] = score
  }
  const admin = createAdminClient()
  const { data: submission, error: readError } = await admin.from('practical_submissions')
    .select('id,user_id,status').eq('id', id).eq('course_code', DTQ_COURSE).maybeSingle()
  if (readError || !submission || submission.status !== 'submitted')
    return fail('Submission is unavailable or already reviewed.', 409)
  if (submission.user_id === user.id) return fail('You cannot grade your own evidence.', 403)
  const score = Object.values(rubric).reduce((total, part) => total + part, 0)
  const { data: updated, error } = await admin.from('practical_submissions')
    .update({ status: determination, rubric_scores: rubric,
      score: determination === 'graded' ? score : null, reviewer_feedback: feedback,
      reviewer_id: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id).eq('course_code', DTQ_COURSE).eq('status', 'submitted').select('id').maybeSingle()
  if (error || !updated) return fail('Review was not saved. Refresh before retrying.', 409)
  return NextResponse.json({ ok: true, message: 'Review recorded securely.' }, { headers: { 'Cache-Control': 'no-store' } })
}
