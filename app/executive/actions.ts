'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

function required(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function optional(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim()
  return value || null
}

async function authUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/executive')
  return { supabase, user }
}

export async function provisionExecutivePilot() {
  const { supabase } = await authUser()
  const { data, error } = await supabase.rpc('provision_executive_pilot')
  if (error) throw new Error(error.message)
  revalidatePath('/executive')
  redirect(`/executive?org=${data}`)
}

export async function createDecision(formData: FormData) {
  const { supabase, user } = await authUser()
  const organizationId = required(formData, 'organization_id')
  const workspaceId = optional(formData, 'workspace_id')
  const title = required(formData, 'title')
  const decisionStatement = required(formData, 'decision_statement')
  const rationale = required(formData, 'rationale')
  const priority = String(formData.get('priority') || 'medium')
  const reviewDate = optional(formData, 'review_date')

  const { error } = await supabase.from('executive_decisions').insert({
    organization_id: organizationId,
    workspace_id: workspaceId,
    title,
    decision_statement: decisionStatement,
    rationale,
    priority,
    status: 'proposed',
    review_date: reviewDate,
    decision_owner: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/executive')
  revalidatePath('/executive/decisions')
}

export async function createAction(formData: FormData) {
  const { supabase, user } = await authUser()
  const organizationId = required(formData, 'organization_id')
  const decisionId = required(formData, 'decision_id')
  const title = required(formData, 'title')
  const description = optional(formData, 'description')
  const dueDate = optional(formData, 'due_date')
  const expectedResult = optional(formData, 'expected_result')

  const { error } = await supabase.from('executive_actions').insert({
    organization_id: organizationId,
    decision_id: decisionId,
    title,
    description,
    due_date: dueDate,
    expected_result: expectedResult,
    owner_user_id: user.id,
    created_by: user.id,
    status: 'not_started',
    progress_percent: 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/executive')
  revalidatePath('/executive/actions')
}

export async function recordKpiObservation(formData: FormData) {
  const { supabase, user } = await authUser()
  const organizationId = required(formData, 'organization_id')
  const kpiId = required(formData, 'kpi_id')
  const periodStart = required(formData, 'period_start')
  const periodEnd = required(formData, 'period_end')
  const value = Number(required(formData, 'value'))
  const targetRaw = optional(formData, 'target_value')
  const target = targetRaw === null ? null : Number(targetRaw)
  const status = String(formData.get('status') || 'neutral')

  const { error } = await supabase.from('executive_kpi_observations').insert({
    organization_id: organizationId,
    kpi_id: kpiId,
    period_start: periodStart,
    period_end: periodEnd,
    value,
    target_value: target,
    status,
    variance: target === null ? null : value - target,
    source_reference: 'Executive UI entry',
    recorded_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/executive')
  revalidatePath('/executive/kpis')
}

export async function createEvidence(formData: FormData) {
  const { supabase, user } = await authUser()
  const organizationId = required(formData, 'organization_id')
  const workspaceId = optional(formData, 'workspace_id')
  const title = required(formData, 'title')
  const summary = required(formData, 'summary')
  const evidenceType = String(formData.get('evidence_type') || 'other')
  const classification = String(formData.get('classification') || 'internal')

  const { error } = await supabase.from('executive_evidence').insert({
    organization_id: organizationId,
    workspace_id: workspaceId,
    evidence_type: evidenceType,
    title,
    summary,
    classification,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/executive')
  revalidatePath('/executive/data')
}
