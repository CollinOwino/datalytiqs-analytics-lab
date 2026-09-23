import { NextRequest, NextResponse } from 'next/server'
import { account, getAccountProject, updateAccountProject } from '../../../../lib/persistence/account'

const privateHeaders = { 'cache-control': 'private, no-store' }
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: NextRequest, { params }: Context) {
  const identity = await account()
  if (!identity) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401, headers: privateHeaders })
  try {
    const { id } = await params
    const project = await getAccountProject(identity.supabase, identity.userId, id)
    return project ? NextResponse.json(project, { headers: privateHeaders })
      : NextResponse.json({ error: { code: 'PROJECT_NOT_FOUND' } }, { status: 404, headers: privateHeaders })
  } catch { return NextResponse.json({ error: { code: 'PROJECT_READ_FAILED' } }, { status: 500, headers: privateHeaders }) }
}
export async function PATCH(req: NextRequest, { params }: Context) {
  const identity = await account()
  if (!identity) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401, headers: privateHeaders })
  try {
    const { id } = await params, body = await req.json()
    const project = await updateAccountProject(identity.supabase, identity.userId, id, body.patch ?? body, body.expectedVersion)
    return NextResponse.json(project, { headers: privateHeaders })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    const status = code === 'PROJECT_NOT_FOUND' ? 404 : code === 'VERSION_CONFLICT' ? 409
      : ['VERSION_REQUIRED', 'INVALID_PROJECT'].includes(code) ? 400 : 500
    return NextResponse.json({ error: { code: status === 500 ? 'PROJECT_UPDATE_FAILED' : code } }, { status, headers: privateHeaders })
  }
}
