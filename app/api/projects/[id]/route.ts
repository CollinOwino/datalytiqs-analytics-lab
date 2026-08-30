import{NextRequest,NextResponse}from'next/server'
import{getPersistenceStore}from'../../../../lib/persistence/store'
const learner=(r:NextRequest)=>r.headers.get('x-learner-id')||'demo-learner'
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){const{id}=await params;const p=await getPersistenceStore().getProject(learner(req),id);return p?NextResponse.json(p):NextResponse.json({error:{code:'PROJECT_NOT_FOUND',message:'Project not found.'}},{status:404})}
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const{id}=await params,body=await req.json();const p=await getPersistenceStore().updateProject(learner(req),id,body.patch||body,body.expectedVersion);return NextResponse.json(p)}catch(e){const m=e instanceof Error?e.message:'Unable to save project.';return NextResponse.json({error:{code:m==='VERSION_CONFLICT'?'VERSION_CONFLICT':'PROJECT_UPDATE_FAILED',message:m}},{status:m==='VERSION_CONFLICT'?409:500})}}
