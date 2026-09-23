'use server'
import {revalidatePath} from 'next/cache'
import {createClient} from '../../lib/supabase/server'

const clean=(v:unknown)=>String(v??'').trim()
async function txContext(roles:string[]){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Authentication required.')
 const{data:legacy}=await supabase.from('ceo_memberships').select('organisation_id,role').eq('user_id',user.id).eq('active',true)
 const allowed=(legacy??[]).find((m:any)=>roles.includes(m.role));if(!allowed)throw new Error('Your executive role does not permit this action.')
 const{data:link,error}=await supabase.from('organization_legacy_links').select('organization_id').eq('legacy_ceo_organisation_id',allowed.organisation_id).single()
 if(error||!link)throw new Error('Canonical organization link is not configured.')
 return{supabase,user,organizationId:link.organization_id}
}
type SourceRef={document_id?:string;page?:number;section?:string;quote?:string}
type AiExtraction={brief_30_seconds:string;brief_2_minutes:string;decisions:{text:string;source:SourceRef}[];actions:{text:string;owner?:string;due?:string;source:SourceRef}[];risks:{text:string;source:SourceRef}[];unresolved_matters:{text:string;source:SourceRef}[]}
function numberedSource(text:string){return text.split(/\r?\n/).map((s,i)=>`[L${i+1}] ${s}`).join('\n')}
function looksLikeMinutes(text:string){
 const sample=text.slice(0,12000)
 const meeting=/\b(meeting|minutes|agenda|attendees|present|apologies|chairperson|chairman|chair)\b/i.test(sample)
 const proceedings=/\b(resolved|agreed|approved|decided|action items?|matters arising|adjourned|next meeting|will prepare|will submit)\b/i.test(sample)
 return meeting&&proceedings
}
async function extractWithAI(text:string,title:string):Promise<{data:AiExtraction|null,provider:string,model:string,input:number,output:number,error?:string}>{
 const key=process.env.OPENAI_API_KEY;if(!key)return{data:null,provider:'datalytiqs',model:'deterministic-v1',input:text.length,output:0,error:'OPENAI_API_KEY not configured'}
 const model=process.env.DATALYTIQS_MINUTES_MODEL||'gpt-5-mini';const source=numberedSource(text).slice(0,120000)
 const schema={type:'object',additionalProperties:false,properties:{brief_30_seconds:{type:'string'},brief_2_minutes:{type:'string'},decisions:{type:'array',items:{type:'object',additionalProperties:false,properties:{text:{type:'string'},source:{type:'object',additionalProperties:false,properties:{section:{type:'string'},quote:{type:'string'}},required:['section','quote']}},required:['text','source']}},actions:{type:'array',items:{type:'object',additionalProperties:false,properties:{text:{type:'string'},owner:{type:'string'},due:{type:'string'},source:{type:'object',additionalProperties:false,properties:{section:{type:'string'},quote:{type:'string'}},required:['section','quote']}},required:['text','owner','due','source']}},risks:{type:'array',items:{type:'object',additionalProperties:false,properties:{text:{type:'string'},source:{type:'object',additionalProperties:false,properties:{section:{type:'string'},quote:{type:'string'}},required:['section','quote']}},required:['text','source']}},unresolved_matters:{type:'array',items:{type:'object',additionalProperties:false,properties:{text:{type:'string'},source:{type:'object',additionalProperties:false,properties:{section:{type:'string'},quote:{type:'string'}},required:['section','quote']}},required:['text','source']} }},required:['brief_30_seconds','brief_2_minutes','decisions','actions','risks','unresolved_matters']}
 try{const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:[{role:'system',content:'Extract executive intelligence only from the supplied meeting record. Never invent a decision, owner, deadline, risk or source. Source.section must be a supplied [Lx] line marker or concise range such as [L12-L14]. Source.quote must be a short exact supporting excerpt. If unsupported, omit it.'},{role:'user',content:`Document: ${title}\n\n${source}`}],text:{format:{type:'json_schema',name:'minutes_intelligence',strict:true,schema}}})});const body=await res.json();if(!res.ok)throw new Error(body?.error?.message||`AI HTTP ${res.status}`);const raw=body.output_text||body.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==='output_text')?.text;if(!raw)throw new Error('AI returned no structured output.');return{data:JSON.parse(raw),provider:'openai',model,input:Number(body.usage?.input_tokens||0),output:Number(body.usage?.output_tokens||0)}}catch(e:any){return{data:null,provider:'openai',model,input:text.length,output:0,error:String(e?.message||e)}}
}
function parseMinutes(text:string){
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
 const sentences=text.replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).filter(s=>s.length>20)
 const decisions=sentences.filter(s=>/\b(resolved|agreed|approved|decided|adopted|confirmed)\b/i.test(s)).slice(0,12)
 const actions=sentences.filter(s=>/\b(action|shall|will|to be|responsible|deadline|follow[- ]?up|submit|prepare|provide|complete)\b/i.test(s)).filter(s=>!decisions.includes(s)).slice(0,16)
 const critical=sentences.filter(s=>/\b(urgent|overdue|risk|delay|deadline|concern|exception|pending)\b/i.test(s)).slice(0,6)
 const short=sentences.slice(0,2).join(' ').slice(0,350)
 const medium=sentences.slice(0,5).join(' ').slice(0,1000)
 return{lines:lines.length,sentences:sentences.length,decisions,actions,critical,brief30:short,brief2:medium}
}
export async function processMinutes(_previous:{ok:boolean;message:string},formData:FormData):Promise<{ok:boolean;message:string}>{
 let storagePath:string|null=null;let supabase:any=null
 try{
  const ctx=await txContext(['ceo','executive']);supabase=ctx.supabase;const{user,organizationId}=ctx
  const title=clean(formData.get('title'));const file=formData.get('file') as File|null;let text=clean(formData.get('minutes_text'));let mimeType:string|null=null;let fileSize:number|null=null;let bytes:Buffer|null=null
  if(title.length<3)return{ok:false,message:'Enter a meeting or document title of at least 3 characters.'}
  if(file&&file.size){
   if(file.size>10*1024*1024)return{ok:false,message:'Minutes file must not exceed 10 MB.'}
   const allowed=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];if(!allowed.includes(file.type))return{ok:false,message:'Upload PDF, DOCX or TXT minutes only.'}
   mimeType=file.type;fileSize=file.size;bytes=Buffer.from(await file.arrayBuffer())
   try{if(file.type==='text/plain')text=bytes.toString('utf8');else if(file.type.includes('wordprocessingml')){const mammoth=(await import('mammoth')).default;const out=await mammoth.extractRawText({buffer:bytes});text=out.value}else{const pdf=(await import('pdf-parse')).default;const out=await pdf(bytes);text=out.text}}catch{return{ok:false,message:'The file could not be read. Use a text-based PDF/DOCX/TXT or paste the minutes text.'}}
  }
  if(text.trim().length<100)return{ok:false,message:'Provide at least 100 characters of extractable minutes text. Scanned/image-only PDFs are not supported yet; paste the text instead.'}
  if(!looksLikeMinutes(text))return{ok:false,message:'This document does not appear to contain meeting proceedings. Check the source before submitting minutes.'}
  if(file&&file.size&&bytes){const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');storagePath=`${organizationId}/${crypto.randomUUID()}/${safe}`;const{error:ue}=await supabase.storage.from('ceo-documents').upload(storagePath,bytes,{contentType:file.type,upsert:false});if(ue)return{ok:false,message:'The document could not be stored securely. No organizational record was created.'}}
  const fallback=parseMinutes(text);const ai=await extractWithAI(text,title);const parsed=ai.data?{...fallback,brief30:ai.data.brief_30_seconds.slice(0,350),brief2:ai.data.brief_2_minutes.slice(0,1000),decisions:ai.data.decisions.map(x=>x.text),actions:ai.data.actions.map(x=>x.text),critical:ai.data.risks.map(x=>x.text)}:fallback
  const{data:doc,error:de}=await supabase.from('ceo_documents').insert({organization_id:organizationId,uploaded_by:user.id,title,document_type:'minutes',storage_path:storagePath,mime_type:mimeType,file_size_bytes:fileSize,source_text:text,processing_status:'ready',metadata:{ingestion:storagePath?'file':'text',parser:'deterministic-v1'}}).select('id').single();if(de)throw de
  const{data:meeting,error:me}=await supabase.from('ceo_meetings').insert({organization_id:organizationId,title,status:'completed',created_by:user.id}).select('id').single();if(me)throw me
  const{error:mde}=await supabase.from('ceo_meeting_documents').insert({organization_id:organizationId,meeting_id:meeting.id,document_id:doc.id,purpose:'minutes'});if(mde)throw mde
  const{data:job,error:je}=await supabase.from('ceo_ai_jobs').insert({organization_id:organizationId,requested_by:user.id,job_type:'minutes_intelligence',source_document_id:doc.id,source_meeting_id:meeting.id,status:'succeeded',provider:ai.provider,model:ai.model,input_units:ai.input,output_units:ai.output,result:{brief_30_seconds:parsed.brief30,brief_2_minutes:parsed.brief2,decision_count:parsed.decisions.length,action_count:parsed.actions.length,attention:parsed.critical,risks:ai.data?.risks||[],unresolved_matters:ai.data?.unresolved_matters||[],fallback_used:!ai.data,ai_error:ai.error||null},source_references:[{document_id:doc.id,title},...(ai.data?[...ai.data.decisions,...ai.data.actions,...ai.data.risks,...ai.data.unresolved_matters].map(x=>({document_id:doc.id,...x.source})):[])]}).select('id').single();if(je)throw je
  const rows=[...parsed.decisions.map((s,i)=>({organization_id:organizationId,meeting_id:meeting.id,source_document_id:doc.id,ai_job_id:job.id,title:`Proposed decision ${i+1}`,context:'Extracted from submitted minutes; verify against source before approval.',decision_text:s,record_type:'decision',evidence_considered:ai.data?.decisions[i]?.source?[ai.data.decisions[i].source]:[{document_id:doc.id,section:'deterministic source',quote:s.slice(0,240)}],workflow_state:'ai_generated',created_by:user.id})),...parsed.actions.map((s,i)=>({organization_id:organizationId,meeting_id:meeting.id,source_document_id:doc.id,ai_job_id:job.id,title:`Proposed action ${i+1}`,context:'Extracted from submitted minutes; verify owner and deadline before approval.',decision_text:s,record_type:'proposed_action',evidence_considered:ai.data?.actions[i]?.source?[ai.data.actions[i].source]:[{document_id:doc.id,section:'deterministic source',quote:s.slice(0,240)}],workflow_state:'ai_generated',created_by:user.id}))]
  if(rows.length){const{error}=await supabase.from('ceo_decisions').insert(rows);if(error)throw error}
  revalidatePath('/ceo/minutes');return{ok:true,message:`Processed successfully using ${ai.data?'structured AI':'the zero-cost deterministic fallback'}. Review proposed records before confirmation.`}
 }catch(e:any){
  if(storagePath&&supabase)await supabase.storage.from('ceo-documents').remove([storagePath]).catch(()=>null)
  return{ok:false,message:'Processing could not be completed safely. No further action is required; retry after the workspace is refreshed.'}
 }
}
export async function confirmMinutesItem(formData:FormData){
 const{supabase,organizationId}=await txContext(['ceo','executive']);const id=clean(formData.get('item_id'));if(!id)throw new Error('Missing item.')
 const{data:item}=await supabase.from('ceo_decisions').select('source_document_id,workflow_state,record_type').eq('id',id).eq('organization_id',organizationId).single();if(!item||item.workflow_state!=='ai_generated')throw new Error('This proposal is no longer awaiting confirmation.')
 const{data:source}=await supabase.from('ceo_documents').select('processing_status').eq('id',item.source_document_id).eq('organization_id',organizationId).single();if(source?.processing_status!=='ready')throw new Error('The source document is unavailable for confirmation.')
 const assignee=clean(formData.get('assignee_id'))||null,due=clean(formData.get('due_at'))||null
 if(item.record_type==='proposed_action'&&(!assignee||!due))throw new Error('Assign an accountable officer and due date before confirming an action.')
 const{error}=await supabase.rpc('ceo_confirm_minutes_item',{p_item_id:id,p_responsible_user_id:assignee,p_due_at:due});if(error)throw new Error(error.message);revalidatePath('/ceo/minutes')
}
export async function delegateAction(formData:FormData){
 const{supabase}=await txContext(['ceo','executive','manager']);const action=clean(formData.get('action_id')),user=clean(formData.get('user_id')),due=clean(formData.get('due_at'))||null,note=clean(formData.get('note'))||null
 if(!action||!user||!due)throw new Error('Select an action, responsible officer and due date.')
 const{error}=await supabase.rpc('ceo_delegate_action',{p_action_id:action,p_user_id:user,p_due_at:due,p_note:note});if(error)throw new Error(error.message);revalidatePath('/ceo/minutes')
}
export async function submitActionEvidence(formData:FormData){
 const{supabase,user,organizationId}=await txContext(['ceo','executive','manager','analyst','viewer']);const action=clean(formData.get('action_id')),summary=clean(formData.get('summary')),url=clean(formData.get('external_url'))||null
 if(!action||summary.length<10)throw new Error('Provide an action and evidence summary.')
 const{data:a}=await supabase.from('ceo_actions').select('id,assigned_to').eq('id',action).eq('organization_id',organizationId).single();if(!a||a.assigned_to!==user.id)throw new Error('Only the assigned officer may submit evidence.')
 const{error}=await supabase.from('ceo_action_evidence').insert({organization_id:organizationId,action_id:action,submitted_by:user.id,evidence_type:url?'link':'note',summary,external_url:url});if(error)throw new Error(error.message)
 await supabase.from('ceo_actions').update({status:'submitted',submitted_at:new Date().toISOString()}).eq('id',action);await supabase.from('ceo_action_updates').insert({organization_id:organizationId,action_id:action,actor_user_id:user.id,update_type:'evidence_submitted',note:summary,new_status:'submitted'});revalidatePath('/ceo/minutes')
}
export async function reviewEvidence(formData:FormData){
 const{supabase}=await txContext(['ceo','executive','manager']);const evidence=clean(formData.get('evidence_id')),action=clean(formData.get('action_id')),verdict=clean(formData.get('verdict'))
 if(!['accepted','returned'].includes(verdict))throw new Error('Invalid review verdict.')
 const{data:{user}}=await supabase.auth.getUser();const now=new Date().toISOString()
 const{error}=await supabase.from('ceo_action_evidence').update({review_status:verdict,reviewed_by:user!.id,reviewed_at:now}).eq('id',evidence);if(error)throw new Error(error.message)
 await supabase.from('ceo_actions').update({status:verdict==='accepted'?'approved':'returned',reviewed_by:user!.id,reviewed_at:now,completed_at:verdict==='accepted'?now:null}).eq('id',action)
 revalidatePath('/ceo/minutes')
}
