'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

async function auth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/certification')
  return { supabase, user }
}

async function requireCertificationAdmin() {
  const { supabase, user } = await auth()
  const { data: admin } = await supabase
    .from('certification_admins')
    .select('user_id,role,active')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle()
  if (!admin) throw new Error('Certification administrator access required.')
  return { supabase, user, admin }
}

export async function requestMerlFoundationsReview(formData: FormData) {
  const { supabase } = await auth()
  const learnerName = String(formData.get('learner_name') || '').trim()
  const declaration = formData.get('declaration') === 'on'
  const { error } = await supabase.rpc('request_merl_foundations_review', {
    p_learner_name: learnerName,
    p_declaration: declaration,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/certification')
  revalidatePath('/merl/foundations/portfolio')
}

export async function updateCertificateSignatory(formData: FormData) {
  const { supabase } = await requireCertificationAdmin()
  const id = String(formData.get('id') || '')
  const displayName = String(formData.get('display_name') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const signatureImageUrl = String(formData.get('signature_image_url') || '').trim() || null
  if (!id || displayName.length < 2 || title.length < 2) throw new Error('Complete the signatory name and title.')

  const { error } = await supabase
    .from('certificate_signatories')
    .update({
      display_name: displayName,
      title,
      signature_image_url: signatureImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/certification/admin')
}

export async function issueMerlFoundationsCredential(formData: FormData) {
  const { supabase } = await requireCertificationAdmin()
  const userId = String(formData.get('user_id') || '')
  const learnerName = String(formData.get('learner_name') || '').trim()
  const notes = String(formData.get('review_notes') || '').trim() || null

  const { data, error } = await supabase.rpc('issue_merl_foundations_credential', {
    p_user_id: userId,
    p_learner_name: learnerName,
    p_review_notes: notes,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/certification/admin')
  revalidatePath('/certification')
  redirect(`/certificate/${data}`)
}
