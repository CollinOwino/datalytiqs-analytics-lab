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

export async function reviewMerlFoundationsRequest(formData: FormData) {
  const { supabase, user } = await requireCertificationAdmin()
  const requestId = String(formData.get('request_id') || '')
  const decision = String(formData.get('decision') || '')
  const notes = String(formData.get('review_notes') || '').trim() || null
  if (!requestId || !['approved','changes_requested','rejected'].includes(decision)) {
    throw new Error('Select a valid credential review decision.')
  }
  if ((decision === 'changes_requested' || decision === 'rejected') && !notes) {
    throw new Error('Reviewer notes are required when returning or rejecting a portfolio.')
  }

  const { error } = await supabase
    .from('credential_review_requests')
    .update({
      status: decision,
      reviewer_notes: notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .in('status', ['pending','approved','changes_requested'])

  if (error) throw new Error(error.message)
  revalidatePath('/certification/admin')
  revalidatePath('/certification')
}

export async function issueMerlFoundationsCredential(formData: FormData) {
  const { supabase } = await requireCertificationAdmin()
  const userId = String(formData.get('user_id') || '')
  const learnerName = String(formData.get('learner_name') || '').trim()
  const notes = String(formData.get('review_notes') || '').trim() || null

  const { data: template } = await supabase
    .from('certificate_templates')
    .select('id')
    .eq('code', 'MERL-FOUNDATIONS-COMP')
    .eq('active', true)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!template) throw new Error('Active MERL Foundations certificate template not found.')

  const { data: signatories, error: signatoryError } = await supabase
    .from('certificate_signatories')
    .select('signatory_key,display_name,title,signature_image_url')
    .eq('template_id', template.id)
    .eq('active', true)
  if (signatoryError) throw new Error(signatoryError.message)

  const required = ['director','facilitator']
  for (const key of required) {
    const signatory = signatories?.find((item:any) => item.signatory_key === key)
    if (!signatory) throw new Error(`Missing active ${key} signatory.`)
    if (/^(director|facilitator) name$/i.test(signatory.display_name.trim())) {
      throw new Error(`Replace the placeholder ${key} signatory name before issuing credentials.`)
    }
    if (!signatory.signature_image_url || !/^https:\/\//i.test(signatory.signature_image_url)) {
      throw new Error(`Add an approved HTTPS signature image for the ${key} signatory before issuing credentials.`)
    }
  }

  const { data: review } = await supabase
    .from('credential_review_requests')
    .select('status')
    .eq('user_id', userId)
    .eq('template_id', template.id)
    .maybeSingle()
  if (review?.status !== 'approved') {
    throw new Error('Approve the credential review before issuing the certificate.')
  }

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


export async function requestMealLevel2Review(formData: FormData) {
  const { supabase } = await auth()
  const learnerName = String(formData.get('learner_name') || '').trim()
  const declaration = formData.get('declaration') === 'on'
  const { error } = await supabase.rpc('request_meal_level2_review', {
    p_learner_name: learnerName,
    p_declaration: declaration,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/merl/applied/portfolio')
  revalidatePath('/certification/admin')
}

export async function reviewMealLevel2Request(formData: FormData) {
  const { supabase } = await requireCertificationAdmin()
  const requestId = String(formData.get('request_id') || '')
  const decision = String(formData.get('decision') || '')
  const notes = String(formData.get('review_notes') || '').trim() || null
  const keys = ['results_logic','measurement','integrity','accountability','analysis','learning','adaptation','communication']
  const scores: Record<string, number> = {}
  for (const key of keys) {
    const raw = String(formData.get(key) ?? '')
    if (!/^[0-3]$/.test(raw)) throw new Error('Score every MEAL rubric dimension from 0 to 3.')
    scores[key] = Number(raw)
  }
  const { error } = await supabase.rpc('review_meal_level2_request', {
    p_request_id: requestId,
    p_decision: decision,
    p_scores: scores,
    p_notes: notes,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/certification/admin')
  revalidatePath('/merl/applied/portfolio')
}
