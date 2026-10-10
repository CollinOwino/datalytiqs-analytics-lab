import 'server-only'
import { createAdminClient } from '../supabase/admin'

export const DTQ_COURSE = 'DTQ-101'
export const DTQ_BUCKET = 'dtq-practical-evidence'

export async function dtqAccess(userId: string) {
  const admin = createAdminClient()
  const { data: catalogue, error: catalogueError } = await admin
    .from('practical_course_catalog')
    .select('enabled,tutor_course_id')
    .eq('course_code', DTQ_COURSE)
    .maybeSingle()
  if (catalogueError) throw catalogueError
  if (!catalogue?.enabled) return { entitled: false, reviewer: false }
  const [{ data: grant, error: grantError }, { data: staff, error: staffError }] = await Promise.all([
    admin.from('practical_course_access').select('status')
      .eq('user_id', userId).eq('course_code', DTQ_COURSE).maybeSingle(),
    admin.from('practical_course_reviewers').select('active')
      .eq('user_id', userId).eq('course_code', DTQ_COURSE).maybeSingle(),
  ])
  if (grantError || staffError) throw grantError || staffError
  let entitled = grant?.status === 'active'
  if (!entitled && catalogue.tutor_course_id) {
    const { data, error } = await admin.from('tutor_lab_entitlements').select('state')
      .eq('user_id', userId).eq('tutor_course_id', catalogue.tutor_course_id).maybeSingle()
    if (error) throw error
    entitled = data?.state === 'active' || data?.state === 'completed'
  }
  return { entitled, reviewer: staff?.active === true }
}

const accepted: Record<string, { mime: string; permitted: string[] }> = {
  pdf: { mime: 'application/pdf', permitted: ['application/pdf'] },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    permitted: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    permitted: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  csv: { mime: 'text/csv', permitted: ['text/csv', 'application/vnd.ms-excel', 'text/plain'] },
  txt: { mime: 'text/plain', permitted: ['text/plain'] },
}

export async function validatedEvidence(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const specification = accepted[extension]
  if (!specification || file.size === 0 || file.size > 1048576)
    throw new Error('Provide a PDF, DOCX, XLSX, CSV or TXT file of at most 1 MB.')
  if (file.type && file.type !== 'application/octet-stream' && !specification.permitted.includes(file.type))
    throw new Error('The selected file type does not match its extension.')
  const bytes = Buffer.from(await file.arrayBuffer())
  if (extension === 'pdf' && bytes.subarray(0, 5).toString() !== '%PDF-')
    throw new Error('Invalid PDF file.')
  if (['docx', 'xlsx'].includes(extension) && bytes.subarray(0, 2).toString() !== 'PK')
    throw new Error('Invalid Office document.')
  if (['csv', 'txt'].includes(extension) &&
    (bytes.includes(0) || new TextDecoder('utf-8', { fatal: true }).decode(bytes).includes('\uFFFD')))
    throw new Error('The text file must contain valid UTF-8 text.')
  return { bytes, extension, mime: specification.mime }
}
