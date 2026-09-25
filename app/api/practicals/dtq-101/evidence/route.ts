import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { DTQ_BUCKET, DTQ_COURSE, dtqAccess } from '../../../../../lib/practicals/dtq101'

export const dynamic = 'force-dynamic'
const columns: Record<string, string> = {
  questionnaire: 'questionnaire_path', codebook: 'codebook_path', pilot_note: 'pilot_note_path',
}
function failure(status: number) {
  return NextResponse.json({ error: 'Evidence unavailable or access denied.' }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') || ''
  if (!columns[kind]) return failure(400)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return failure(401)
  const requestedId = request.nextUrl.searchParams.get('submission')
  if (requestedId && !/^[0-9a-f-]{36}$/i.test(requestedId)) return failure(400)
  const { reviewer } = await dtqAccess(user.id)
  if (requestedId && !reviewer) return failure(403)

  const admin = createAdminClient()
  let query = admin.from('practical_submissions')
    .select('id,user_id,questionnaire_path,codebook_path,pilot_note_path')
    .eq('course_code', DTQ_COURSE)
  if (requestedId) query = query.eq('id', requestedId)
  else query = query.eq('user_id', user.id)
  const { data: submission, error } = await query.maybeSingle()
  if (error || !submission || (!reviewer && submission.user_id !== user.id)) return failure(404)
  const path = submission[columns[kind] as keyof typeof submission]
  if (typeof path !== 'string' || !path.startsWith(`${submission.user_id}/${submission.id}/${kind}/`))
    return failure(404)
  const { data, error: signingError } = await admin.storage.from(DTQ_BUCKET).createSignedUrl(path, 60)
  if (signingError || !data?.signedUrl) return failure(500)
  const response = NextResponse.redirect(data.signedUrl, 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
