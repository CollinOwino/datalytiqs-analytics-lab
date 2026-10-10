import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '../../../../../../lib/supabase/admin'
import { createClient } from '../../../../../../lib/supabase/server'
import '../../../../exam-hub.css'
import TimedMock from '../../../../components/TimedMock'

const normalise=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

export async function generateMetadata({params}:{params:Promise<{body:string;qualification:string;paper:string}>}):Promise<Metadata>{
  const {paper}=await params
  return {title:`${paper.toUpperCase()} Exam Preparation | DatalytIQs`,description:'Structured professional examination preparation, practice and readiness tracking from DatalytIQs.'}
}

export default async function ProfessionalPaperPage({params}:{params:Promise<{body:string;qualification:string;paper:string}>}){
  const {body,qualification,paper}=await params
  const admin=createAdminClient()
  const {data:programme}=await admin.from('exam_programmes')
    .select('id,code,title,description,status,metadata,exam_bodies!inner(code,name,website_url)')
    .ilike('code',paper).maybeSingle()
  if(!programme) notFound()
  const examBody=Array.isArray(programme.exam_bodies)?programme.exam_bodies[0]:programme.exam_bodies as any
  const meta=(programme.metadata||{}) as Record<string,any>
  if(normalise(examBody?.code||'')!==body||normalise(String(meta.qualification||''))!==qualification) notFound()
  const {data:syllabus}=await admin.from('exam_syllabus_versions').select('id,version_label,effective_from,source_url,status').eq('programme_id',programme.id).order('effective_from',{ascending:false}).limit(1).maybeSingle()
  const {data:topics}=syllabus?await admin.from('exam_topics').select('id,code,title,description,sequence_no').eq('syllabus_version_id',syllabus.id).eq('active',true).order('sequence_no'):{data:[]}
  const {data:lessons}=await admin.from('exam_theory_lessons').select('id,topic_id,code,title,objectives,content_md,worked_example,exam_focus,sequence_no').eq('programme_id',programme.id).eq('active',true).order('sequence_no')
  const lessonsByTopic=new Map<string,any[]>(); (lessons||[]).forEach((x:any)=>lessonsByTopic.set(x.topic_id,[...(lessonsByTopic.get(x.topic_id)||[]),x]))
  const {data:topicChecks}=await admin.from('exam_assessments').select('id,title,metadata').eq('programme_id',programme.id).eq('assessment_type','topic').eq('status','published')
  const {data:mock}=await admin.from('exam_assessments').select('id,title,time_limit_minutes,pass_mark').eq('programme_id',programme.id).eq('assessment_type','mock').eq('status','published').order('created_at',{ascending:false}).limit(1).maybeSingle()
  let mockQuestions:any[]=[]
  if(mock){const {data:maps}=await admin.from('exam_assessment_questions').select('sequence_no,exam_questions!inner(id,stem,options)').eq('assessment_id',mock.id).order('sequence_no'); mockQuestions=(maps||[]).map((m:any)=>Array.isArray(m.exam_questions)?m.exam_questions[0]:m.exam_questions)}
  const {data:activities}=await admin.from('exam_practical_activities').select('id,topic_id,code,title,activity_type,instructions,dataset_key,expected_outputs,execution_mode,sequence_no').eq('programme_id',programme.id).eq('active',true).order('sequence_no')
  const activityIds=(activities||[]).map((a:any)=>a.id)
  const {data:assignments}=activityIds.length?await admin.from('exam_practical_assignments').select('id,activity_id,title,brief,deliverables,marking_rubric,max_score,pass_score,estimated_minutes,submission_guidance,contributes_to_readiness').in('activity_id',activityIds).eq('active',true):{data:[]}
  const assignmentsByActivity=new Map<string,any>()
  ;(assignments||[]).forEach((x:any)=>assignmentsByActivity.set(x.activity_id,x))
  const {data:competencies}=await admin.from('exam_competencies').select('id,code,title,description,domain').eq('programme_id',programme.id).eq('active',true).order('code')
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  let enrollment:any=null, submissions:any[]=[], evidence:any[]=[], recommendations:any[]=[], quizAttempts:any[]=[], mockAttempts:any[]=[]
  if(user){
    const {data:e}=await supabase.from('exam_enrollments').select('id,status').eq('programme_id',programme.id).eq('user_id',user.id).eq('status','active').maybeSingle()
    enrollment=e
    if(e){
      const [s,evidenceRows,recs,quizRows,mockRows]=await Promise.all([
        supabase.from('exam_topic_practical_submissions').select('id,topic_id,status,score,determination,reviewed_at').eq('enrollment_id',e.id),
        supabase.from('exam_competency_evidence').select('competency_id,score,recorded_at').eq('enrollment_id',e.id),
        supabase.from('exam_recommendations').select('id,topic_id,competency_id,reason,priority,status').eq('enrollment_id',e.id).eq('status','open').order('priority'),
        supabase.from('exam_quiz_attempts').select('topic_id,percentage,passed,submitted_at').eq('enrollment_id',e.id),
        supabase.from('exam_mock_attempts').select('percentage,passed,domain_scores,submitted_at,status').eq('enrollment_id',e.id).eq('status','submitted').order('submitted_at',{ascending:false})
      ])
      submissions=s.data||[]; evidence=evidenceRows.data||[]; recommendations=recs.data||[]; quizAttempts=quizRows.data||[]; mockAttempts=mockRows.data||[]
    }
  }
  const reviewed=submissions.filter(x=>x.reviewed_at&&x.score!==null)
  const practicalAverage=reviewed.length?Math.round(reviewed.reduce((sum,x)=>sum+Number(x.score||0),0)/reviewed.length):null
  const evidenceByCompetency=new Map<string,number[]>()
  evidence.forEach((row:any)=>evidenceByCompetency.set(row.competency_id,[...(evidenceByCompetency.get(row.competency_id)||[]),Number(row.score)]))
  const competencyScores=(competencies||[]).map((x:any)=>({ ...x, score:evidenceByCompetency.has(x.id)?Math.round((evidenceByCompetency.get(x.id)||[]).reduce((a,b)=>a+b,0)/(evidenceByCompetency.get(x.id)||[]).length):null }))
  const evidenced=competencyScores.filter((x:any)=>x.score!==null)
  const competencyAverage=evidenced.length?Math.round(evidenced.reduce((s:number,x:any)=>s+x.score,0)/evidenced.length):null
  const quizPassedTopics=new Set(quizAttempts.filter((x:any)=>x.passed).map((x:any)=>x.topic_id))
  const quizCoverage=(topics?.length||0)?Math.round(quizPassedTopics.size/(topics?.length||1)*100):0
  const latestMock=mockAttempts[0]||null
  const readinessParts=[competencyAverage,practicalAverage,latestMock?.percentage??null,quizAttempts.length?quizCoverage:null].filter((x:any)=>x!==null)
  const readiness=readinessParts.length?Math.round(readinessParts.reduce((a:number,b:any)=>a+Number(b),0)/readinessParts.length):null
  const activitiesByTopic=new Map<string,any[]>()
  ;(activities||[]).forEach((a:any)=>activitiesByTopic.set(a.topic_id,[...(activitiesByTopic.get(a.topic_id)||[]),a]))
  const verified=meta.verification_status==='verified'
  const implementation=String(meta.implementation_status||'PLANNED').replaceAll('_',' ')
  const officialStructure=verified?String(meta.exam_structure||'See official source'):'Official examination structure verification pending.'

  return <main className="exam-hub">
    <header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>Professional Exam Hub</small></a><nav><a href="/exam-hub">Catalogue</a><a href="#syllabus">Syllabus</a><a href="#study-path">Study Path</a><a href="/">Analytics Lab</a></nav></header>
    <section className="topic-hero"><div><a href="/exam-hub">← Professional catalogue</a><span className="exam-kicker">{examBody?.code} · {meta.qualification||'PROFESSIONAL EXAM'}</span><h1>{programme.code} — {programme.title}</h1><p>{programme.description||'Structured professional examination preparation pathway.'}</p></div><aside><span>IMPLEMENTATION STATUS</span><b>{implementation}</b><small>{verified?'Official paper identity verified':'Verification in progress'}</small></aside></section>

    <section className="exam-status">
      <article><span>PAPER</span><b>{programme.code}</b><small>{programme.title}</small></article>
      <article><span>LEVEL</span><b>{meta.level||'Pending'}</b><small>Official verification status: {verified?'verified':'pending'}</small></article>
      <article><span>ASSESSMENT</span><b>{meta.assessment_mode||'Pending'}</b><small>{officialStructure}</small></article>
      <article><span>TOOLS</span><b>{Array.isArray(meta.tools)&&meta.tools.length?meta.tools.join(' · '):'Pending'}</b><small>Only verified requirements are labelled official.</small></article>
    </section>

    <section className="exam-section" id="syllabus"><div className="exam-section-head"><div><span className="exam-kicker">SYLLABUS</span><h2>{syllabus?.version_label||'Pending official verification'}</h2></div><p>{syllabus?.status==='published'?'Published preparation syllabus mapping.':'Official syllabus detail has not yet been activated in DatalytIQs.'}</p></div>
      {topics?.length?<div className="topic-list">{topics.map((t:any)=><article className="topic-card" key={t.id}><div className="topic-number">{String(t.sequence_no).padStart(2,'0')}</div><div className="topic-content"><h3>{t.code} · {t.title}</h3><p>{t.description}</p></div></article>)}</div>:<div className="exam-notice">Official examination structure verification pending. No syllabus topics have been fabricated.</div>}
    </section>

    <section className="exam-section" id="theory"><div className="exam-section-head"><div><span className="exam-kicker">SUBSTANTIVE THEORY & QUIZZES</span><h2>Learn the domain, then verify it</h2></div><p>Original DatalytIQs instruction mapped to the verified syllabus domains.</p></div>
      <div className="topic-list">{(topics||[]).map((t:any)=><article className="topic-card" key={t.id}><div className="topic-number">{String(t.sequence_no).padStart(2,'0')}</div><div className="topic-content"><h3>{t.code} · {t.title}</h3>{(lessonsByTopic.get(t.id)||[]).map((l:any)=><div key={l.id}><b>{l.title}</b><p>{l.content_md}</p><p><strong>Worked application:</strong> {l.worked_example}</p><small>Exam focus: {l.exam_focus}</small></div>)}<p><strong>Theory check:</strong> {(topicChecks||[]).some((a:any)=>a.metadata?.topic_id===t.id)?'4-item domain quiz · 70% threshold · 3 attempts':'pending'}</p></div></article>)}</div>
    </section>

    <section className="assessment-band" id="study-path"><div className="exam-section-head inverse"><div><span className="exam-kicker">PREPARATION PATH</span><h2>Learn → Practise → Demonstrate → Review</h2></div><p>Tutor LMS carries the theory layer. Analytics Lab carries practical activity, evidence and readiness. Python/R execution remains fail-closed until an isolated runner is available.</p></div><div className="assessment-grid">
      <article><span>THEORY</span><h3>Academy Course</h3><p>{meta.academy_course_id?'Linked to the Academy preparation course.':'Course mapping pending; no duplicate course has been created.'}</p></article>
      <article><span>PRACTICE</span><h3>Exam Workspace</h3><p>{activities?.length?`${activities.length} practical activities mapped to the paper.`:'Practice architecture reserved; substantive activities are still in development.'}</p></article>
      <article><span>READINESS</span><h3>{readiness===null?'Evidence pending':`${readiness}% evidence readiness`}</h3><p>{readiness===null?'Readiness appears only after reviewed practical evidence and competency evidence exist.':`${reviewed.length} reviewed practical submission(s); ${evidenced.length}/${competencyScores.length} competencies evidenced.`}</p></article>
    </div></section>

    <section className="exam-section" id="practical-activities"><div className="exam-section-head"><div><span className="exam-kicker">ANALYTICS LAB PRACTICALS</span><h2>Evidence-generating activities</h2></div><p>Each activity is DatalytIQs-developed preparation work mapped to the syllabus source. It is not an official KASNEB examination question.</p></div>
      {topics?.length?<div className="topic-list">{topics.map((t:any)=><article className="topic-card" key={t.id}><div className="topic-number">{String(t.sequence_no).padStart(2,'0')}</div><div className="topic-content"><h3>{t.code} · {t.title}</h3>{(activitiesByTopic.get(t.id)||[]).length?(activitiesByTopic.get(t.id)||[]).map((a:any)=><div key={a.id}><b>{a.code} · {a.title}</b><p>{a.instructions}</p><p><strong>Evidence:</strong> {(a.expected_outputs||[]).join(' · ')}</p><small>Mode: {a.execution_mode.replaceAll('_',' ')}{a.dataset_key?` · dataset ${a.dataset_key}`:''}</small>{assignmentsByActivity.get(a.id)?<div className="exam-notice"><strong>{assignmentsByActivity.get(a.id).title}</strong><p>{assignmentsByActivity.get(a.id).brief}</p><p><strong>Deliverables:</strong> {(assignmentsByActivity.get(a.id).deliverables||[]).join(' · ')}</p><p><strong>Marking:</strong> {(assignmentsByActivity.get(a.id).marking_rubric||[]).map((r:any)=>`${r.criterion} ${r.weight}%`).join(' · ')}</p><small>{assignmentsByActivity.get(a.id).estimated_minutes} minutes · Pass threshold {assignmentsByActivity.get(a.id).pass_score}% · contributes to readiness</small></div>:null}</div>):<p>Theory-linked topic; no separate practical evidence activity is required in this release.</p>}</div></article>)}</div>:<div className="exam-notice">Practical mapping is still in draft.</div>}
    </section>

    {mock&&mockQuestions.length?<section className="exam-section" id="timed-mock"><div className="exam-section-head"><div><span className="exam-kicker">TIMED MOCK</span><h2>Exam-style question bank → result</h2></div><p>{mockQuestions.length} original DatalytIQs items. The timer and scoring run through authenticated server endpoints.</p></div>{user?<TimedMock assessmentId={mock.id} title={mock.title} timeLimit={mock.time_limit_minutes} questions={mockQuestions}/>:<div className="exam-notice">Sign in and activate this paper to start the timed mock.</div>}</section>:null}

    <section className="exam-section" id="readiness"><div className="exam-section-head"><div><span className="exam-kicker">EVIDENCE & READINESS</span><h2>{user?'Your practical evidence profile':'Sign in to build an evidence profile'}</h2></div><p>Readiness is evidence-derived, not a completion badge. Reviewed practical scores and competency evidence feed this dashboard.</p></div>
      <div className="competency-grid">{competencyScores.map((x:any)=><article key={x.id}><span>{x.code}</span><h3>{x.title}</h3><p>{x.description}</p><b>{x.score===null?'No reviewed evidence yet':`${x.score}% evidence score`}</b></article>)}</div>
      {user&&enrollment?<><div className="exam-notice">Theory quiz coverage: {quizAttempts.length?quizCoverage+'%':'pending'} · Latest timed mock: {latestMock?latestMock.percentage+'%':'pending'} · Reviewed practicals: {reviewed.length} · Practical average: {practicalAverage===null?'pending':`${practicalAverage}%`} · Overall evidence readiness: {readiness===null?'pending':`${readiness}%`}</div>{recommendations.length?<div className="topic-list">{recommendations.map((r:any)=><article className="topic-card" key={r.id}><div className="topic-number">R</div><div className="topic-content"><h3>Targeted remediation · priority {r.priority}</h3><p>{r.reason}</p></div></article>)}</div>:<div className="exam-notice">No open remediation recommendation is currently recorded.</div>}</>:<div className="exam-notice">An active paper enrolment is required before learner evidence is recorded.</div>}
    </section>

    <section className="unlock-panel"><div><span className="exam-kicker">STATUS CONTROL</span><h2>{implementation}</h2><p>Catalogue inclusion is not a claim of official endorsement or production readiness. DatalytIQs is an independent professional learning and examination-preparation platform.</p></div>{programme.code==='CA35P'?<a className="exam-button primary" href="/exam-hub/ca35p">Open full CA35P workspace</a>:<a className="exam-button primary" href="/exam-hub">Back to catalogue</a>}</section>
  </main>
}
