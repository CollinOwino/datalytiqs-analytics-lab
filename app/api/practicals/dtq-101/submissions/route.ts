import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { DTQ_BUCKET, DTQ_COURSE, dtqAccess, validatedEvidence } from '../../../../../lib/practicals/dtq101'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const kinds = ['questionnaire', 'codebook', 'pilot_note'] as const
type Kind = typeof kinds[number]
const column: Record<Kind, string> = {
  questionnaire: 'questionnaire_path', codebook: 'codebook_path', pilot_note: 'pilot_note_path',
}

function json(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  // A same-origin authenticated request is required; the service key never reaches the browser.
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return json('Invalid request origin.', 403)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json('Sign in before submitting evidence.', 401)
  try {
    const access = await dtqAccess(user.id)
    if (!access.entitled) return json('Active DTQ-101 enrolment is required.', 403)
    const form = await request.formData()
    const intent = form.get('intent')
    if (intent !== 'draft' && intent !== 'submit') return json('Invalid submission action.', 400)
    const summary = String(form.get('summary') || '').trim()
    if (summary.length > 3000 || (intent === 'submit' && summary.length < 80))
      return json('Provide an 80–3,000 character summary to submit.', 400)

    // Validate all files before writing any storage objects.
    const uploads: Partial<Record<Kind, Awaited<ReturnType<typeof validatedEvidence>>>> = {}
    for (const kind of kinds) {
      const value = form.get(kind)
      if (value instanceof File && value.size) uploads[kind] = await validatedEvidence(value)
    }
    const admin = createAdminClient()
    const { data: prior, error: readError } = await admin.from('practical_submissions')
      .select('id,status,updated_at,questionnaire_path,codebook_path,pilot_note_path')
      .eq('user_id', user.id).eq('course_code', DTQ_COURSE).maybeSingle()
    if (readError) throw readError
    if (prior && !['draft', 'revision_requested'].includes(prior.status))
      return json('This submission is locked. Contact your instructor for a revision request.', 409)

    const available = kinds.every(kind => Boolean(uploads[kind] || prior?.[column[kind] as keyof typeof prior]))
    if (intent === 'submit' && !available) return json('Attach the questionnaire, codebook and pilot-revision note.', 400)

    let current = prior
    if (!current) {
      const { data, error } = await admin.from('practical_submissions')
        .insert({ user_id: user.id, course_code: DTQ_COURSE, status: 'draft' })
        .select('id,status,updated_at,questionnaire_path,codebook_path,pilot_note_path').single()
      if (error || !data) return json('Could not create the draft. Refresh and try again.', 409)
      current = data
    }

    const newPaths: string[] = []
    const oldPaths: string[] = []
    const patch: Record<string, unknown> = {
      summary, status: intent === 'submit' ? 'submitted' : 'draft',
      updated_at: new Date().toISOString(),
    }
    try {
      for (const kind of kinds) {
        const upload = uploads[kind]
        if (!upload) continue
        const path = `${user.id}/${current.id}/${kind}/${crypto.randomUUID()}.${upload.extension}`
        const { error } = await admin.storage.from(DTQ_BUCKET)
          .upload(path, upload.bytes, { contentType: upload.mime, upsert: false })
        if (error) throw error
        newPaths.push(path)
        const previous = current[column[kind] as keyof typeof current]
        if (typeof previous === 'string') oldPaths.push(previous)
        patch[column[kind]] = path
      }
      if (intent === 'submit') {
        patch.submitted_at = new Date().toISOString()
        patch.score = null
        patch.rubric_scores = null
        patch.reviewer_feedback = null
        patch.reviewer_id = null
        patch.reviewed_at = null
      }
      // Optimistic locking prevents a stale tab from silently overwriting a newer draft.
      const { data: saved, error } = await admin.from('practical_submissions').update(patch)
        .eq('id', current.id).eq('user_id', user.id).eq('updated_at', current.updated_at)
        .in('status', ['draft', 'revision_requested']).select('id,status,submitted_at').maybeSingle()
      if (error || !saved) throw new Error('Draft changed in another tab. Refresh and retry.')
      if (oldPaths.length) await admin.storage.from(DTQ_BUCKET).remove(oldPaths)
      return NextResponse.json({ ok: true, status: saved.status, message: intent === 'submit'
        ? 'Evidence submitted. Your instructor can now review it.'
        : 'Draft saved securely.' }, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
      if (newPaths.length) await admin.storage.from(DTQ_BUCKET).remove(newPaths)
      throw error
    }
  } catch (error) {
    if (error instanceof Error && /Provide|Invalid|UTF-8|type|document|PDF/.test(error.message))
      return json(error.message, 400)
    return json('The submission could not be saved. Your existing evidence was not replaced.', 500)
  }
}
