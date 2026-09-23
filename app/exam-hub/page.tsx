import type { Metadata } from 'next'
import { createAdminClient } from '../../lib/supabase/admin'
import { createClient } from '../../lib/supabase/server'
import { setTargetExamDate, startCa35p } from './actions'
import './exam-hub.css'
import './topic-workspace.css'

export const metadata: Metadata = {
  title: 'CA35P Exam Competency Hub | DatalytIQs Academy',
  description: 'Structured KASNEB CA35P syllabus coverage, practical assessments and competency progress tracking.',
}

type Topic = {
  id: string
  code: string
  title: string
  description: string | null
  sequence_no: number
  learning_outcomes: string[]
  exam_subtopics: Array<{ id: string; code: string; title: string; description: string | null; sequence_no: number }>
}

export default async function ExamHubPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const query = await searchParams
  const admin = createAdminClient()
  const { data: programme, error: programmeError } = await admin
    .from('exam_programmes')
    .select('id,code,title,description,free_topic_limit,status,metadata,exam_bodies!inner(code,name)')
    .eq('code', 'CA35P').eq('status', 'published').single()
  if (programmeError || !programme) throw new Error('The published CA35P programme could not be loaded.')

  const { data: syllabus } = await admin.from('exam_syllabus_versions')
    .select('id,version_label,effective_from,status').eq('programme_id', programme.id).eq('status', 'published')
    .order('effective_from', { ascending: false }).limit(1).single()
  if (!syllabus) throw new Error('The published CA35P syllabus could not be loaded.')

  const [{ data: topicRows }, { data: competencies }, { data: assessments }] = await Promise.all([
    admin.from('exam_topics').select('id,code,title,description,sequence_no,learning_outcomes,exam_subtopics(id,code,title,description,sequence_no)').eq('syllabus_version_id', syllabus.id).eq('active', true).order('sequence_no'),
    admin.from('exam_competencies').select('id,code,title,description,domain').eq('programme_id', programme.id).eq('active', true).order('code'),
    admin.from('exam_assessments').select('id,title,assessment_type,time_limit_minutes,pass_mark,max_attempts,status,metadata').eq('programme_id', programme.id).eq('status', 'published'),
  ])
  const topics = (topicRows || []).map((topic: any) => ({ ...topic, exam_subtopics: [...(topic.exam_subtopics || [])].sort((a: any, b: any) => a.sequence_no - b.sequence_no) })) as Topic[]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let enrollment: any = null
  let progress: any[] = []
  let subtopicProgress: any[] = []
  let grants: any[] = []
  let isReviewer = false
  if (user) {
    const [{ data: enrollmentRow }, { data: grantRows }, { data: staffRows }] = await Promise.all([
      supabase.from('exam_enrollments').select('id,status,target_exam_date,enrolled_at').eq('programme_id', programme.id).eq('user_id', user.id).maybeSingle(),
      supabase.from('exam_access_grants').select('id,access_level,topic_id,expires_at').eq('programme_id', programme.id).eq('user_id', user.id).is('revoked_at', null),
      supabase.from('exam_programme_staff').select('role').eq('programme_id', programme.id).eq('user_id', user.id).eq('active', true).in('role', ['reviewer', 'instructor', 'administrator']).limit(1),
    ])
    enrollment = enrollmentRow
    grants = grantRows || []
    isReviewer = Boolean(staffRows?.length)
    if (enrollment) {
      const [{data:topicData},{data:subtopicData}]=await Promise.all([
        supabase.from('exam_topic_progress').select('topic_id,status,completed_at').eq('enrollment_id',enrollment.id),
        supabase.from('exam_subtopic_progress').select('subtopic_id,status,completed_at').eq('enrollment_id',enrollment.id),
      ])
      progress=topicData||[];subtopicProgress=subtopicData||[]
    }
  }

  const hasFullAccess = grants.some(grant => grant.access_level === 'full' && (!grant.expires_at || new Date(grant.expires_at) > new Date()))
  const progressByTopic = new Map(progress.map(row => [row.topic_id, row]))
  const completed = progress.filter(row => row.status === 'completed').length
  const totalSubtopics=topics.reduce((sum,topic)=>sum+topic.exam_subtopics.length,0)
  const completedSubtopics=subtopicProgress.filter(row=>row.status==='completed').length
  const progressPercent=totalSubtopics?Math.round(completedSubtopics/totalSubtopics*100):0
  const nextTopic=topics.find(topic=>{const row=progressByTopic.get(topic.id);const free=topic.sequence_no<=programme.free_topic_limit;const grant=grants.some(g=>(g.access_level==='full'||(g.access_level==='topic'&&g.topic_id===topic.id))&&(!g.expires_at||new Date(g.expires_at)>new Date()));return (free||grant)&&row?.status!=='completed'})
  const targetDays=enrollment?.target_exam_date?Math.max(0,Math.ceil((new Date(enrollment.target_exam_date+'T00:00:00').getTime()-Date.now())/86400000)):null
  const bodyName = Array.isArray(programme.exam_bodies) ? programme.exam_bodies[0]?.name : (programme.exam_bodies as any)?.name
  const unlockUrl = `https://datalytiqsacademy.com/contact/?subject=${encodeURIComponent('Unlock CA35P Exam Competency Hub')}`

  return <main className="exam-hub">
    <a className="skip-link" href="#syllabus">Skip to CA35P syllabus</a>
    <header className="exam-header">
      <a className="exam-brand" href="/"><span>D</span><b>DatalytIQs</b><small>Exam Competency Hub</small></a>
      <nav aria-label="Exam Hub navigation"><a href="#overview">Overview</a><a href="#syllabus">Syllabus</a><a href="#assessments">Assessments</a><a href="#competencies">Competencies</a>{isReviewer && <a href="/exam-hub/review">Review queue</a>}<a href="/">Analytics Lab</a></nav>
      {user ? <span className="account-chip">Signed in</span> : <a className="nav-cta" href="/login?next=/exam-hub">Sign in</a>}
    </header>

    <section className="exam-hero" id="overview">
      <div><span className="exam-kicker">KASNEB · CPA PRACTICAL PAPER</span><h1><em>CA35P</em> Business Data Analytics</h1><p>Move systematically through the syllabus, practise computer-based analytical work, monitor competency development and prepare for an examiner-style mock assessment.</p><div className="exam-actions">{enrollment ? <a className="exam-button primary" href="#syllabus">Continue learning</a> : user ? <form action={startCa35p}><button className="exam-button primary" type="submit">Start free access</button></form> : <a className="exam-button primary" href="/login?next=/exam-hub">Create learner account</a>}<a className="exam-button outline" href="#syllabus">View syllabus</a></div></div>
      <aside aria-label="Programme facts"><div><b>5</b><span>syllabus topics</span></div><div><b>15</b><span>subtopics</span></div><div><b>3</b><span>topics free</span></div><div><b>100</b><span>mock marks</span></div></aside>
    </section>

    <section className="exam-status" aria-label="Learner status">
      <article><span>PROGRAMME</span><b>{programme.code}</b><small>{bodyName}</small></article>
      <article><span>ACCESS</span><b>{hasFullAccess ? 'Full' : 'Free tier'}</b><small>{hasFullAccess ? 'All syllabus topics available' : 'Topics 1–3 available'}</small></article>
      <article><span>PROGRESS</span><b>{progressPercent}%</b><small>{completedSubtopics}/{totalSubtopics} subtopics · {completed}/{topics.length} topics</small></article>
      <article><span>SYLLABUS</span><b>{syllabus.version_label}</b><small>Published programme version</small></article>
    </section>

    {user&&enrollment&&<section className="learner-command" aria-label="Study command centre"><div><span className="exam-kicker">YOUR NEXT BEST ACTION</span><h2>{nextTopic?`Continue ${nextTopic.code} · ${nextTopic.title}`:'Syllabus coverage complete'}</h2><p>{nextTopic?'Resume the next accessible topic, complete its evidence gates and then attempt the topic assessment.':'Review your evidence profile and prepare for the full mock assessment.'}</p>{nextTopic?<a className="exam-button primary" href={`/exam-hub/${nextTopic.code}`}>Resume learning</a>:<a className="exam-button primary" href="#assessments">Open assessment centre</a>}</div><aside><span>OVERALL COVERAGE</span><b>{progressPercent}%</b><small>{completedSubtopics}/{totalSubtopics} subtopics complete</small>{targetDays!==null?<><span>EXAM COUNTDOWN</span><b>{targetDays}</b><small>days to target examination date</small></>:null}</aside></section>}

    {user&&enrollment&&query.state&&['enrolled','progress-saved','study-plan-saved'].includes(query.state)&&<div className="exam-notice" role="status">{{enrolled:'Your free CA35P learning plan is active.','progress-saved':'Topic progress saved.','study-plan-saved':'Target exam date saved.'}[query.state]}</div>}
    {query.state==='action-error'&&<div className="exam-notice error" role="alert">The requested update could not be completed.</div>}
    {user&&enrollment&&<section className="study-plan-bar" aria-labelledby="study-plan-title"><div><span className="exam-kicker">PERSONAL STUDY PLAN</span><h2 id="study-plan-title">Set your target examination date</h2><p>{enrollment.target_exam_date?`Current target: ${new Date(`${enrollment.target_exam_date}T00:00:00`).toLocaleDateString('en-KE',{dateStyle:'long'})}`:'Add a target date to pace the remaining syllabus and practical work.'}</p></div><form action={setTargetExamDate}><label htmlFor="target-exam-date">Target date</label><input id="target-exam-date" name="target_exam_date" type="date" min={new Date(Date.now()+86400000).toISOString().slice(0,10)} defaultValue={enrollment.target_exam_date||''} required/><button type="submit">Save study target</button></form></section>}

    <section className="exam-section" id="syllabus" aria-labelledby="syllabus-title">
      <div className="exam-section-head"><div><span className="exam-kicker">STRUCTURED COVERAGE</span><h2 id="syllabus-title">Syllabus and learner progress</h2></div><p>The first three topics are included in free membership. Premium topics remain visible for planning but require an active entitlement.</p></div>
      <div className="topic-list">{topics.map(topic => {
        const free = topic.sequence_no <= programme.free_topic_limit
        const topicGrant = grants.some(grant => grant.access_level === 'topic' && grant.topic_id === topic.id && (!grant.expires_at || new Date(grant.expires_at) > new Date()))
        const accessible = free || hasFullAccess || topicGrant
        const topicProgress = progressByTopic.get(topic.id)
        return <article className={`topic-card ${accessible ? '' : 'locked'}`} key={topic.id}>
          <div className="topic-number">{String(topic.sequence_no).padStart(2, '0')}</div>
          <div className="topic-content"><div className="topic-title"><div><span>{topic.code} · {free ? 'FREE ACCESS' : 'PREMIUM'}</span><h3>{topic.title}</h3></div><b className={`topic-badge ${topicProgress?.status || (accessible ? 'available' : 'locked')}`}>{topicProgress?.status?.replace('_', ' ') || (accessible ? 'available' : 'locked')}</b></div><p>{topic.description}</p>
            <details><summary>{topic.exam_subtopics.length} subtopics and learning outcomes</summary><ol>{topic.exam_subtopics.map(subtopic => <li key={subtopic.id}><b>{subtopic.code} {subtopic.title}</b><span>{subtopic.description}</span></li>)}</ol>{topic.learning_outcomes?.length > 0 && <div className="outcomes"><b>Learning outcomes</b><ul>{topic.learning_outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></div>}</details>
            <div className="topic-action">{!accessible ? <><span>Subscription required for this topic.</span><a href={unlockUrl}>Unlock programme →</a></> : <><span>{topicProgress?.status==='completed'?'All subtopics completed.':'Open the guided workspace and record each evidence gate.'}</span><a href={`/exam-hub/${topic.code}`}>{topicProgress?.status==='completed'?'Review topic':'Open topic workspace'} →</a></>}</div>
          </div>
        </article>
      })}</div>
    </section>

    <section className="assessment-band" id="assessments" aria-labelledby="assessment-title"><div className="exam-section-head inverse"><div><span className="exam-kicker">ASSESSMENT CENTRE</span><h2 id="assessment-title">Prepare under practical-paper conditions</h2></div><p>Original practice cases and practical assignments support the topic assessments. The full mock is a planning blueprint until an attempt flow is available.</p></div><div className="assessment-grid"><article><span>TOPIC PRACTICE</span><h3>Case question bank</h3><p>Work through 20 original self-check cases across the five topics, then take each five-question scored quiz.</p><b>20 cases · 25 scored items</b></article><article><span>PRACTICAL WORK</span><h3>Spreadsheet competency tasks</h3><p>Prepare models, analyses, visualisations and decision outputs against the five assignment checklists.</p><b>Assessor reviewed</b></article>{(assessments || []).map((assessment: any) => <article key={assessment.id}><span>FULL MOCK BLUEPRINT</span><h3>{assessment.title}</h3><p>{assessment.time_limit_minutes} minutes · {assessment.metadata?.total_marks || 100} marks · pass mark {assessment.pass_mark}%. Online attempts are not yet available.</p><b>Planning reference</b></article>)}</div></section>

    <section className="exam-section" id="competencies" aria-labelledby="competencies-title"><div className="exam-section-head"><div><span className="exam-kicker">PERFORMANCE PROFILE</span><h2 id="competencies-title">Six assessable competencies</h2></div><p>Your evidence profile will consolidate topic practice, practical submissions and mock-assessment performance.</p></div><div className="competency-grid">{(competencies || []).map((competency: any) => <article key={competency.id}><span>{competency.code}</span><h3>{competency.title}</h3><p>{competency.description}</p></article>)}</div></section>

    <section className="unlock-panel"><div><span className="exam-kicker">FULL PROGRAMME ACCESS</span><h2>Complete the entire CA35P preparation pathway</h2><p>Unlock specialised analytics, emerging issues, all practical activities and the complete assessment pathway.</p></div><a className="exam-button primary" href={unlockUrl}>Request full access</a></section>
    <footer><span>DatalytIQs Academy · Exam Competency Hub</span><a href="https://datalytiqsacademy.com/">Academy</a><a href="https://community.datalytiqsacademy.com/">Community</a><a href="/">Analytics Lab</a></footer>
  </main>
}
