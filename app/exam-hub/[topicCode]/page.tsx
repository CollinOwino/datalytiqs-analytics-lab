import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createClient } from '../../../lib/supabase/server'
import { setSubtopicProgress, startCa35p, submitTopicOnePractical, submitTopicOneQuiz } from '../actions'
import { topicOneDownloads, topicOneLessons, topicOneQuiz } from './topic-one-content'
import '../exam-hub.css'
import '../topic-workspace.css'
import '../topic-one.css'
import '../topic-progress.css'

const briefs: Record<string, { question: string; workflow: string[]; output: string }> = {
  '1.0': { question: 'How can an analyst build a faster, auditable and decision-ready Excel workbook?', workflow: ['Structure and label the workbook', 'Apply suitable formulas and analytical tables', 'Validate calculations and document assumptions'], output: 'Controlled Excel analytical workbook' },
  '2.0': { question: 'How should an analytics engagement move from a business problem to defensible evidence?', workflow: ['Frame the decision problem using CRISP', 'Map the data lifecycle and requirements', 'Select suitable tools and visualisations'], output: 'Analytics engagement design brief' },
  '3.0': { question: 'What do the financial data reveal, and how sensitive is the decision to key assumptions?', workflow: ['Prepare and analyse statements', 'Build forecast and investment models', 'Run sensitivity and scenario analysis'], output: 'Financial analytics decision pack' },
  '4.0': { question: 'How can specialised analytics strengthen management accounting, audit, tax and public-finance decisions?', workflow: ['Select the specialised decision context', 'Apply appropriate analytical tests', 'Communicate exceptions, risks and action'], output: 'Specialised analytics case file' },
  '5.0': { question: 'Which ethical, security and operational constraints could invalidate an analytical conclusion?', workflow: ['Identify adoption and ethics risks', 'Assess data-protection and security controls', 'Document tool limitations and mitigations'], output: 'Responsible analytics assurance note' },
}

export async function generateMetadata({ params }: { params: Promise<{ topicCode: string }> }): Promise<Metadata> {
  const { topicCode } = await params
  if (topicCode === '1.0') return {
    title: 'CA35P Topic 1: Introduction to Excel | DatalytIQs Academy',
    description: 'Master controlled Excel workbooks, analytical tables, advanced formulas and auditable financial models for KASNEB CA35P Business Data Analytics.',
    alternates: { canonical: '/exam-hub/1.0' },
    openGraph: { title: 'CA35P Topic 1: Introduction to Excel', description: 'Lessons, worked examples, practice files, exercises and assessed evidence for CA35P Topic 1.' },
  }
  return { title: `CA35P Topic ${topicCode} | DatalytIQs Academy`, alternates: { canonical: `/exam-hub/${topicCode}` } }
}

type ProgressRow = { subtopic_id: string; status: string; completed_at: string | null }
type QuizAttempt = { attempt_no: number; score: number; max_score: number; percentage: number; passed: boolean; feedback: string; submitted_at: string }
type PracticalSubmission = { status: string; score: number | null; reviewer_feedback: string | null; submitted_at: string }

export default async function ExamTopicPage({ params, searchParams }: { params: Promise<{ topicCode: string }>; searchParams: Promise<{ state?: string }> }) {
  const [{ topicCode }, query] = await Promise.all([params, searchParams])
  if (!/^[1-5]\.0$/.test(topicCode)) notFound()
  const admin = createAdminClient()
  const { data: topic } = await admin.from('exam_topics').select('id,code,title,description,sequence_no,learning_outcomes,exam_subtopics(id,code,title,description,sequence_no,learning_outcomes)').eq('code', topicCode).eq('active', true).single()
  if (!topic) notFound()

  const subtopics = [...(topic.exam_subtopics || [])].sort((a: any, b: any) => a.sequence_no - b.sequence_no)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let enrollment: { id: string; status: string } | null = null
  let grants: Array<{ access_level: string; topic_id: string | null; expires_at: string | null }> = []
  let subProgress: ProgressRow[] = []
  let quizAttempts: QuizAttempt[] = []
  let practicalSubmissions: PracticalSubmission[] = []
  if (user) {
    const { data: programme } = await supabase.from('exam_programmes').select('id').eq('code', 'CA35P').single()
    if (programme) {
      const [{ data: enrollmentData }, { data: grantData }] = await Promise.all([
        supabase.from('exam_enrollments').select('id,status').eq('programme_id', programme.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('exam_access_grants').select('access_level,topic_id,expires_at').eq('programme_id', programme.id).eq('user_id', user.id).is('revoked_at', null),
      ])
      enrollment = enrollmentData
      grants = grantData || []
      if (enrollment) {
        const progressPromise = supabase.from('exam_subtopic_progress').select('subtopic_id,status,completed_at').eq('enrollment_id', enrollment.id)
        const quizPromise = topicCode === '1.0' ? supabase.from('exam_quiz_attempts').select('attempt_no,score,max_score,percentage,passed,feedback,submitted_at').eq('enrollment_id', enrollment.id).eq('topic_id', topic.id).order('submitted_at', { ascending: false }).limit(5) : Promise.resolve({ data: [] })
        const practicalPromise = topicCode === '1.0' ? supabase.from('exam_topic_practical_submissions').select('status,score,reviewer_feedback,submitted_at').eq('enrollment_id', enrollment.id).eq('topic_id', topic.id).order('submitted_at', { ascending: false }).limit(3) : Promise.resolve({ data: [] })
        const [{ data: progressData }, { data: quizData }, { data: practicalData }] = await Promise.all([progressPromise, quizPromise, practicalPromise])
        subProgress = progressData || []
        quizAttempts = (quizData || []) as QuizAttempt[]
        practicalSubmissions = (practicalData || []) as PracticalSubmission[]
      }
    }
  }

  const activeGrant = grants.some((grant) => (grant.access_level === 'full' || grant.topic_id === topic.id) && (!grant.expires_at || new Date(grant.expires_at) > new Date()))
  const accessible = topic.sequence_no <= 3 || activeGrant
  const progressMap = new Map(subProgress.map((row) => [row.subtopic_id, row]))
  const completed = subProgress.filter((row) => row.status === 'completed').length
  const brief = briefs[topicCode]
  const latestQuiz = quizAttempts[0]
  const latestPractical = practicalSubmissions[0]
  const messages: Record<string, string> = {
    'progress-saved': 'Subtopic progress saved.',
    'quiz-submitted': 'Quiz scored and saved to your assessment record.',
    'quiz-incomplete': 'Answer all five questions before submitting the quiz.',
    'practical-submitted': 'Practical evidence submitted for review.',
    'practical-invalid': 'Provide an 80–3,000 character summary and, if included, a valid HTTPS evidence link.',
    'action-error': 'The requested update could not be completed.',
  }
  const message = query.state ? messages[query.state] : ''
  const isError = ['action-error', 'quiz-incomplete', 'practical-invalid'].includes(query.state || '')
  const loginUrl = `/login?next=${encodeURIComponent(`/exam-hub/${topicCode}`)}`
  const unlockUrl = `https://datalytiqsacademy.com/contact/?subject=${encodeURIComponent('Unlock CA35P Exam Competency Hub')}`

  return <main className="exam-hub topic-workspace">
    <header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>CA35P Topic Workspace</small></a><nav aria-label="Topic navigation"><a href="/exam-hub">Dashboard</a><a href="#learning-sequence">Lessons</a>{topicCode === '1.0' ? <><a href="#topic-quiz">Quiz</a><a href="#practical-submission">Practical</a></> : <a href="#practical-brief">Practical brief</a>}</nav>{user ? <span className="account-chip">Signed in</span> : <a className="nav-cta" href={loginUrl}>Sign in</a>}</header>
    <section className="topic-hero"><div><a href="/exam-hub">← CA35P dashboard</a><span className="exam-kicker">TOPIC {String(topic.sequence_no).padStart(2, '0')} · {topic.sequence_no <= 3 ? 'FREE ACCESS' : 'PREMIUM'}</span><h1>{topic.title}</h1><p>{topic.description}</p></div><aside><span>TOPIC PROGRESS</span><b>{Math.round(completed / Math.max(subtopics.length, 1) * 100)}%</b><small>{completed}/{subtopics.length} subtopics completed</small></aside></section>
    {message ? <div className={`exam-notice ${isError ? 'error' : ''}`} role="status">{message}</div> : null}
    {!accessible ? <section className="locked-workspace"><span className="exam-kicker">SUBSCRIPTION REQUIRED</span><h2>This topic is included in full CA35P access.</h2><p>You can review its outline on the dashboard. Guided activities and progress recording unlock after a verified grant is applied.</p><a className="exam-button primary" href={unlockUrl}>Request full access</a></section> : <>
      {topicCode === '1.0' ? <TopicOneLearning subtopics={subtopics} progressMap={progressMap} user={user} enrollment={enrollment} loginUrl={loginUrl} /> : <GenericLearning subtopics={subtopics} progressMap={progressMap} user={user} enrollment={enrollment} topicCode={topicCode} loginUrl={loginUrl} />}
      {topicCode === '1.0' ? <>
        <section className="assessment-panel" id="topic-quiz"><div className="exam-section-head"><div><span className="exam-kicker">AUTO-SCORED ASSESSMENT</span><h2>Topic 1 knowledge check</h2></div><p>Five questions · pass mark 80% · unlimited attempts. Your latest score is retained with the attempt history.</p></div>
          {latestQuiz ? <div className={`score-card ${latestQuiz.passed ? 'passed' : ''}`}><span>LATEST ATTEMPT {latestQuiz.attempt_no}</span><b>{latestQuiz.score}/{latestQuiz.max_score} · {Math.round(latestQuiz.percentage)}%</b><p>{latestQuiz.feedback}</p><small>{latestQuiz.passed ? 'COMPETENT' : 'RETRY RECOMMENDED'} · {new Date(latestQuiz.submitted_at).toLocaleDateString('en-KE')}</small></div> : null}
          {!user ? <a className="exam-button primary" href={loginUrl}>Sign in to take the quiz</a> : !enrollment ? <form action={startCa35p}><button className="exam-button primary" type="submit">Start free access</button></form> : <form className="quiz-form" action={submitTopicOneQuiz}>{topicOneQuiz.map((item, index) => <fieldset key={item.code}><legend><span>{index + 1}</span>{item.question}</legend>{item.options.map(([value, label]) => <label key={value}><input type="radio" name={item.code} value={value} required /> <span>{label}</span></label>)}</fieldset>)}<button className="exam-button primary" type="submit">Submit and score quiz</button></form>}
          {quizAttempts.length > 1 ? <div className="attempt-history"><h3>Recent attempts</h3>{quizAttempts.map((attempt) => <span key={attempt.attempt_no}>Attempt {attempt.attempt_no}: <b>{Math.round(attempt.percentage)}%</b> {attempt.passed ? '· Competent' : '· Review and retry'}</span>)}</div> : null}
        </section>
        <section className="practical-submission" id="practical-submission"><div><span className="exam-kicker">ASSESSED PRACTICAL</span><h2>Submit your controlled Excel decision workbook</h2><p>Use the sales dataset or model template. Explain your workbook structure, controls, principal finding and management recommendation.</p><div className="rubric"><h3>20-mark rubric</h3><span>Workbook structure and controls <b>5</b></span><span>Formula accuracy and reconciliation <b>5</b></span><span>Analysis and interpretation <b>5</b></span><span>Decision recommendation and presentation <b>5</b></span></div></div><div>
          {latestPractical ? <div className="submission-status"><span>LATEST SUBMISSION</span><b>{latestPractical.status.replace('_', ' ')}</b><small>{new Date(latestPractical.submitted_at).toLocaleDateString('en-KE')}</small>{latestPractical.score !== null ? <strong>{latestPractical.score}/20</strong> : null}<p>{latestPractical.reviewer_feedback || 'Reviewer feedback will appear here after assessment.'}</p></div> : null}
          {!user ? <a className="exam-button primary" href={loginUrl}>Sign in to submit evidence</a> : !enrollment ? <form action={startCa35p}><button className="exam-button primary" type="submit">Start free access</button></form> : <form className="submission-form" action={submitTopicOnePractical}><label htmlFor="summary">Analytical summary <small>80–3,000 characters</small></label><textarea id="summary" name="summary" minLength={80} maxLength={3000} rows={7} required placeholder="Describe your controls, calculations, findings and recommendation…" /><label htmlFor="evidence_link">Evidence link <small>Optional HTTPS share link</small></label><input id="evidence_link" name="evidence_link" type="url" inputMode="url" placeholder="https://…" /><button className="exam-button primary" type="submit">Submit practical evidence</button></form>}
        </div></section>
      </> : <section className="practical-panel" id="practical-brief"><div><span className="exam-kicker">PRACTICAL EVIDENCE BRIEF</span><h2>{brief.question}</h2><ol>{brief.workflow.map((step) => <li key={step}>{step}</li>)}</ol></div><aside><span>EXPECTED OUTPUT</span><b>{brief.output}</b><small>Retain the workbook or evidence file for assessment and portfolio review.</small></aside></section>}
    </>}
    <footer><span>DatalytIQs Academy · CA35P</span><a href="/exam-hub">Exam Hub</a><a href="/">Analytics Lab</a></footer>
  </main>
}

function TopicOneLearning({ subtopics, progressMap, user, enrollment, loginUrl }: { subtopics: any[]; progressMap: Map<string, ProgressRow>; user: any; enrollment: any; loginUrl: string }) {
  const subtopicByCode = new Map(subtopics.map((subtopic) => [subtopic.code, subtopic]))
  return <section className="exam-section substantive-lessons" id="learning-sequence"><div className="exam-section-head"><div><span className="exam-kicker">GUIDED LEARNING · APPROX. 160 MINUTES</span><h2>Learn, practise and produce evidence</h2></div><p>Each lesson combines examinable concepts, a worked example, an applied exercise and an answer guide.</p></div>
    <div className="download-panel"><div><span className="exam-kicker">PRACTICE FILES</span><h3>Download the controlled source files</h3><p>Open the CSV files in Excel, then save your working version as an XLSX workbook.</p></div>{topicOneDownloads.map((download) => <a key={download.href} href={download.href} download><b>{download.title}</b><small>{download.meta}</small><span>Download ↓</span></a>)}</div>
    <div className="lesson-stack">{topicOneLessons.map((lesson) => { const subtopic = subtopicByCode.get(lesson.code); const progress = subtopic ? progressMap.get(subtopic.id) : undefined; return <article className="lesson-card" key={lesson.code}><header><span>{lesson.code}</span><div><h3>{lesson.title}</h3><small>{lesson.duration}</small></div><b className={`topic-badge ${progress?.status || 'available'}`}>{progress?.status?.replace('_', ' ') || 'not started'}</b></header><div className="lesson-objectives"><h4>By the end, you should be able to:</h4><ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div><div className="concept-grid">{lesson.concepts.map(([title, description]) => <div key={title}><h4>{title}</h4><p>{description}</p></div>)}</div><div className="worked-example"><span>WORKED EXAMPLE</span><h4>{lesson.workedExample.scenario}</h4><ol>{lesson.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><code>{lesson.workedExample.formula}</code><p><b>Interpretation:</b> {lesson.workedExample.interpretation}</p></div><details><summary>Applied exercise</summary><p>{lesson.exercise}</p><details className="answer-guide"><summary>Reveal answer guide</summary><p>{lesson.answerGuide}</p></details></details><div className="lesson-completion">{!user ? <a href={loginUrl}>Sign in to record progress</a> : !enrollment ? <form action={startCa35p}><button type="submit">Start free access</button></form> : subtopic ? <form action={setSubtopicProgress}><input type="hidden" name="subtopic_id" value={subtopic.id} /><input type="hidden" name="topic_code" value="1.0" /><input type="hidden" name="status" value={progress?.status === 'in_progress' ? 'completed' : 'in_progress'} /><button type="submit">{progress?.status === 'completed' ? 'Completed ✓' : progress?.status === 'in_progress' ? 'Mark lesson complete' : 'Begin lesson'}</button></form> : null}</div></article> })}</div>
  </section>
}

function GenericLearning({ subtopics, progressMap, user, enrollment, topicCode, loginUrl }: { subtopics: any[]; progressMap: Map<string, ProgressRow>; user: any; enrollment: any; topicCode: string; loginUrl: string }) {
  return <section className="exam-section" id="learning-sequence"><div className="exam-section-head"><div><span className="exam-kicker">GUIDED LEARNING</span><h2>Complete the subtopic sequence</h2></div><p>Each evidence gate contributes to the topic and programme progress shown on your dashboard.</p></div><div className="subtopic-list">{subtopics.map((subtopic) => { const progress = progressMap.get(subtopic.id); return <article key={subtopic.id}><div><span>{subtopic.code}</span><h3>{subtopic.title}</h3><p>{subtopic.description}</p>{subtopic.learning_outcomes?.length > 0 ? <ul>{subtopic.learning_outcomes.map((outcome: string) => <li key={outcome}>{outcome}</li>)}</ul> : null}</div><div className="subtopic-control"><b className={`topic-badge ${progress?.status || 'available'}`}>{progress?.status?.replace('_', ' ') || 'not started'}</b>{!user ? <a href={loginUrl}>Sign in to record</a> : !enrollment ? <form action={startCa35p}><button type="submit">Start free access</button></form> : <form action={setSubtopicProgress}><input type="hidden" name="subtopic_id" value={subtopic.id} /><input type="hidden" name="topic_code" value={topicCode} /><input type="hidden" name="status" value={progress?.status === 'in_progress' ? 'completed' : 'in_progress'} /><button type="submit">{progress?.status === 'completed' ? 'Completed ✓' : progress?.status === 'in_progress' ? 'Mark complete' : 'Begin subtopic'}</button></form>}</div></article> })}</div></section>
}
