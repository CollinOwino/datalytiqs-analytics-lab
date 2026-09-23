import { NextRequest, NextResponse } from 'next/server'
import { getExecutionProvider } from '../../../../lib/execution/provider'
import { account } from '../../../../lib/persistence/account'

type Context = { params: Promise<{ id: string }> }
const privateHeaders = { 'cache-control': 'private, no-store' }
async function ownedExecution(id: string) {
  const identity = await account()
  if (!identity) return { status: 401 as const }
  if (!/^[a-zA-Z0-9_-]{1,150}$/.test(id)) return { status: 404 as const }
  const { data, error } = await identity.supabase.from('learner_execution_jobs')
    .select('execution_id').eq('execution_id', id).eq('user_id', identity.userId).maybeSingle()
  if (error) return { status: 500 as const }
  return data ? { status: 200 as const } : { status: 404 as const }
}
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params, ownership = await ownedExecution(id)
  if (ownership.status !== 200) return NextResponse.json({ error: { code: ownership.status === 401 ? 'UNAUTHENTICATED' : ownership.status === 404 ? 'EXECUTION_NOT_FOUND' : 'EXECUTION_READ_FAILED' } }, { status: ownership.status, headers: privateHeaders })
  try { return NextResponse.json(await getExecutionProvider().getResult(id), { headers: privateHeaders }) }
  catch { return NextResponse.json({ error: { code: 'EXECUTION_READ_FAILED' } }, { status: 500, headers: privateHeaders }) }
}
export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params, ownership = await ownedExecution(id)
  if (ownership.status !== 200) return NextResponse.json({ error: { code: ownership.status === 401 ? 'UNAUTHENTICATED' : ownership.status === 404 ? 'EXECUTION_NOT_FOUND' : 'EXECUTION_CANCEL_FAILED' } }, { status: ownership.status, headers: privateHeaders })
  try { await getExecutionProvider().cancel(id); return new NextResponse(null, { status: 204, headers: privateHeaders }) }
  catch { return NextResponse.json({ error: { code: 'EXECUTION_CANCEL_FAILED' } }, { status: 500, headers: privateHeaders }) }
}
