import { createClient } from '../supabase/server'
import type { LearnerProject, ProjectPatch, StageProgress } from './types'
import { defaultStages } from './store'

type Client = Awaited<ReturnType<typeof createClient>>
type Row = { id:string;user_id:string;case_id:string;title:string;code:string;active_dataset:string|null;stages:StageProgress[];version:number;created_at:string;updated_at:string }

export async function account() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return !error && user ? { supabase, userId: user.id } : null
}

const map = (row: Row): LearnerProject => ({
  id: row.id, learnerId: row.user_id, caseId: row.case_id, title: row.title,
  code: row.code, activeDataset: row.active_dataset || undefined,
  stages: row.stages, version: row.version, createdAt: row.created_at, updatedAt: row.updated_at,
})
const validText = (value: unknown, max: number) => typeof value === 'string' && value.length <= max
const validId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export async function listAccountProjects(supabase: Client, userId: string) {
  const { data, error } = await supabase.from('learner_workspace_projects').select('*')
    .eq('user_id', userId).order('updated_at', { ascending: false }).limit(100)
  if (error) throw error
  return (data as Row[]).map(map)
}
export async function getAccountProject(supabase: Client, userId: string, id: string) {
  if (!validId(id)) return null
  const { data, error } = await supabase.from('learner_workspace_projects').select('*')
    .eq('id', id).eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? map(data as Row) : null
}
export async function createAccountProject(supabase: Client, userId: string, body: Record<string, unknown>) {
  const caseId = body.caseId ?? '001', title = body.title ?? 'Case Study 001 Analysis'
  if (typeof caseId !== 'string' || !/^\d{3}$/.test(caseId) || !validText(title, 200) || !String(title).trim()
    || !validText(body.code ?? '', 100000) || (body.activeDataset !== undefined && !validText(body.activeDataset, 300)))
    throw new Error('INVALID_PROJECT')
  const { data, error } = await supabase.from('learner_workspace_projects').insert({
    user_id: userId, case_id: caseId, title: String(title).trim(), code: body.code ?? '',
    active_dataset: body.activeDataset || null, stages: defaultStages(),
  }).select('*').single()
  if (error) throw error
  return map(data as Row)
}
export async function updateAccountProject(supabase: Client, userId: string, id: string, patch: ProjectPatch, expectedVersion: number) {
  if (!validId(id)) throw new Error('PROJECT_NOT_FOUND')
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) throw new Error('VERSION_REQUIRED')
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('INVALID_PROJECT')
  const old = await getAccountProject(supabase, userId, id)
  if (!old) throw new Error('PROJECT_NOT_FOUND')
  if (old.version !== expectedVersion) throw new Error('VERSION_CONFLICT')
  const changes: Record<string, unknown> = { version: old.version + 1, updated_at: new Date().toISOString() }
  if ('title' in patch) {
    if (!validText(patch.title, 200) || !patch.title?.trim()) throw new Error('INVALID_PROJECT')
    changes.title = patch.title.trim()
  }
  if ('code' in patch) {
    if (!validText(patch.code, 100000)) throw new Error('INVALID_PROJECT')
    changes.code = patch.code
  }
  if ('activeDataset' in patch) {
    if (patch.activeDataset !== undefined && !validText(patch.activeDataset, 300)) throw new Error('INVALID_PROJECT')
    changes.active_dataset = patch.activeDataset || null
  }
  if ('stage' in patch) {
    const stage = patch.stage
    if (!stage || !/^0[1-6]$/.test(stage.stageId) || (stage.status !== undefined && !['locked','ready','in_progress','completed'].includes(stage.status))
      || (stage.completedTasks !== undefined && (!Array.isArray(stage.completedTasks) || stage.completedTasks.length > 30 || stage.completedTasks.some(t => !validText(t, 100))))
      || (stage.interpretation !== undefined && !validText(stage.interpretation, 10000))) throw new Error('INVALID_PROJECT')
    changes.stages = old.stages.map(s => s.stageId === stage.stageId ? { ...s, ...stage, updatedAt: new Date().toISOString() } : s)
  }
  if (Object.keys(changes).length === 2) throw new Error('INVALID_PROJECT')
  const { data, error } = await supabase.from('learner_workspace_projects').update(changes)
    .eq('id', id).eq('user_id', userId).eq('version', expectedVersion).select('*').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('VERSION_CONFLICT')
  return map(data as Row)
}
