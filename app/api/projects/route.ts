import { NextRequest, NextResponse } from 'next/server'
import { account, createAccountProject, listAccountProjects } from '../../../lib/persistence/account'

const privateHeaders = { 'cache-control': 'private, no-store' }
export async function GET() {
  const identity = await account()
  if (!identity) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401, headers: privateHeaders })
  try { return NextResponse.json(await listAccountProjects(identity.supabase, identity.userId), { headers: privateHeaders }) }
  catch { return NextResponse.json({ error: { code: 'PROJECT_LIST_FAILED' } }, { status: 500, headers: privateHeaders }) }
}
export async function POST(req: NextRequest) {
  const identity = await account()
  if (!identity) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401, headers: privateHeaders })
  try {
    const body = await req.json()
    const project = await createAccountProject(identity.supabase, identity.userId, body)
    return NextResponse.json(project, { status: 201, headers: privateHeaders })
  } catch (error) {
    const invalid = error instanceof Error && error.message === 'INVALID_PROJECT'
    return NextResponse.json({ error: { code: invalid ? 'INVALID_PROJECT' : 'PROJECT_CREATE_FAILED' } }, { status: invalid ? 400 : 500, headers: privateHeaders })
  }
}
