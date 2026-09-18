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
function parseMinutes(text:string){
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
 const sentences=text.replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).filter(s=>s.length>20)
 const decisions=sentences.filter(s=>/\b(resolved|agreed|approved|decided|adopted|confirmed)\b/i.test(s)).slice(0,12)
 const actions=sentences.filter(s=>/\b(action|shall|will|to be|responsible|deadline|follow[- ]?up|submit|prepare|provide|complete)\b/i.test(s)).filter(s=>!decisions.includes(s)).slice(0,16)
 const critical=sentences.filter(s=>/\b(urgent|overdue|risk|delay|deadline|concern|exception|pending)\b/i.test(s)).slice(0,6)
 const short=sentences.slice(0,3).join(' ').slice(0,900)
 const medium=sentences.slice(0,10).join(' ').slice(0,3000)
 return{lines:lines.length,sentences:sentences.length,decisions,actions,critical,brief30:short,brief2:medium}
}
export async function processMinutes(formData:FormData){
 const{supabase,user,organizationId}=await txContext(['ceo','executive'])
 const title=clean(formData.get('title'));const file=formData.get('file') as File|null;let text=clean(formData.get('minutes_text'));let storagePath:string|null=null;let mimeType:string|null=null;let fileSize:number|null=null
 if(file&&file.size){if(file.size>10*1024*1024)throw new Error('Minutes file must not exceed 10 MB.');mimeType=file.type||null;fileSize=file.size;const allowed=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];if(!allowed.includes(file.type))throw new Error('Upload PDF, DOCX or TXT minutes only.');const bytes=Buffer.from(await file.arrayBuffer());const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');storagePath=`${organizationId}/${crypto.randomUUID()}/${safe}`;const{error:ue}=await supabase.storage.from('ceo-documents').upload(storagePath,bytes,{contentType:file.type,upsert:false});if(ue)throw new Error(ue.message);if(file.type==='text/plain')text=bytes.toString('utf8');else if(file.type.includes('wordprocessingml')){const mammoth=(await import('mammoth')).default;const out=await mammoth.extractRawText({buffer:bytes});text=out.value}else{const pdf=(await import('pdf-parse')).default;const out=await pdf(bytes);text=out.text}}
 if(title.length<3||text.length<100)throw new Error('Provide a title and minutes containing at least 100 characters of extractable text.')
 const parsed=parseMinutes(text)
 const{data:doc,error:de}=await supabase.from('ceo_documents').insert({organization_id:organizationId,uploaded_by:user.id,title,document_type:'minutes',storage_path:storagePath,mime_type:mimeType,file_size:fileSize,source_text:text,processing_status:'ready',metadata:{ingestion:storagePath?'file':'text',parser:'deterministic-v1'}}).select('id').single();if(de)throw new Error(de.message)
 const{data:meeting,error:me}=await supabase.from('ceo_meetings').insert({organization_id:organizationId,title,status:'completed',created_by:user.id}).select('id').single();if(me)throw new Error(me.message)
 await supabase.from('ceo_meeting_documents').insert({organization_id:organizationId,meeting_id:meeting.id,document_id:doc.id,purpose:'minutes'})
 const{data:job,error:je}=await supabase.from('ceo_ai_jobs').insert({organization_id:organizationId,requested_by:user.id,job_type:'minutes_intelligence',source_document_id:doc.id,source_meeting_id:meeting.id,status:'succeeded',provider:'datalytiqs',model:'deterministic-v1',input_units:text.length,output_units:parsed.brief30.length+parsed.brief2.length,result:{brief_30_seconds:parsed.brief30,brief_2_minutes:parsed.brief2,decision_count:parsed.decisions.length,action_count:parsed.actions.length,attention:parsed.critical},source_references:[{document_id:doc.id,title}]}).select('id').single();if(je)throw new Error(je.message)
 const rows=[...parsed.decisions.map((s,i)=>({organization_id:organizationId,meeting_id:meeting.id,source_document_id:doc.id,ai_job_id:job.id,title:`Proposed decision ${i+1}`,context:'Extracted from submitted minutes; verify against source before approval.',decision_text:s,record_type:'decision',workflow_state:'ai_generated',created_by:user.id})),...parsed.actions.map((s,i)=>({organization_id:organizationId,meeting_id:meeting.id,source_document_id:doc.id,ai_job_id:job.id,title:`Proposed action ${i+1}`,context:'Extracted from submitted minutes; verify owner and deadline before approval.',decision_text:s,record_type:'proposed_action',workflow_state:'ai_generated',created_by:user.id}))]
 if(rows.length){const{error}=await supabase.from('ceo_decisions').insert(rows);if(error)throw new Error(error.message)}
 revalidatePath('/ceo/minutes')
}
export async function confirmMinutesItem(formData:FormData){
 const{supabase}=await txContext(['ceo','executive']);const id=clean(formData.get('item_id'));if(!id)throw new Error('Missing item.')
 const assignee=clean(formData.get('assignee_id'))||null,due=clean(formData.get('due_at'))||null
 const{error}=await supabase.rpc('ceo_confirm_minutes_item',{p_item_id:id,p_responsible_user_id:assignee,p_due_at:due});if(error)throw new Error(error.message);revalidatePath('/ceo/minutes')
}
export async function delegateAction(formData:FormData){
 const{supabase}=await txContext(['ceo','executive','manager']);const action=clean(formData.get('action_id')),user=clean(formData.get('user_id')),due=clean(formData.get('due_at'))||null,note=clean(formData.get('note'))||null
 if(!action||!user)throw new Error('Select an action and responsible officer.')
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
