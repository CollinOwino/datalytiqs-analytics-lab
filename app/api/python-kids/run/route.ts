import { NextResponse } from 'next/server'
import { runFoundationCode } from '../../../python-for-kids/runner'

export async function POST(request: Request) {
  let body: { lessonCode?: string; code?: string }
  try { body=await request.json() } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
  if (typeof body.lessonCode!=='string' || typeof body.code!=='string') return NextResponse.json({error:'Lesson and code are required.'},{status:400})
  return NextResponse.json(runFoundationCode(body.lessonCode,body.code),{headers:{'Cache-Control':'no-store'}})
}
