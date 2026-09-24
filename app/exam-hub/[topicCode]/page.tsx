import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createClient } from '../../../lib/supabase/server'
import { reviewTopicPractical, setSubtopicProgress, startCa35p, submitTopicPractical, submitTopicQuiz } from '../actions'
import { topicContent } from './topic-content'
import { assignmentChecklist, practiceBank } from './practice-bank'
import { calculationChecks, datasetMissions } from './dataset-missions'
import { CalculationPractice } from './calculation-practice'
import { MobileExamNav } from '../mobile-nav'
import '../exam-hub.css'
import '../topic-workspace.css'
import '../topic-one.css'
import '../topic-progress.css'

export async function generateMetadata({ params }: { params: Promise<{ topicCode: string }> }): Promise<Metadata> {
  const { topicCode } = await params
  const content = topicContent[topicCode]
  if (!content) return { title: 'CA35P Topic | DatalytIQs Academy' }
  return { title: content.seoTitle, description: content.seoDescription, alternates: { canonical: `/exam-hub/${topicCode}` }, openGraph: { title: content.seoTitle, description: content.seoDescription } }
}

type ProgressRow = { subtopic_id: string; status: string; completed_at: string | null }
type QuizAttempt = { attempt_no: number; score: number; max_score: number; percentage: number; passed: boolean; feedback: string; submitted_at: string }
type PracticalSubmission = { id:string; status: string; score: number | null; reviewer_feedback: string | null; submitted_at: string; rubric_scores?: Record<string,number>|null; determination?:string|null }

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
  let grants: Array<{ access_level: string; topic_id: string | null; starts_at: string; expires_at: string | null }> = []
  let subProgress: ProgressRow[] = []
  let quizAttempts: QuizAttempt[] = []
  let practicalSubmissions: PracticalSubmission[] = []
  let isReviewer = false
  if (user) {
    const { data: programme } = await supabase.from('exam_programmes').select('id').eq('code', 'CA35P').single()
    if (programme) {
      const { data: staff } = await supabase.from('exam_programme_staff').select('role').eq('programme_id', programme.id).eq('user_id', user.id).eq('active', true).in('role', ['reviewer', 'instructor', 'administrator']).limit(1)
      isReviewer = Boolean(staff?.length)
      const [{ data: enrollmentData }, { data: grantData }] = await Promise.all([
        supabase.from('exam_enrollments').select('id,status').eq('programme_id', programme.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('exam_access_grants').select('access_level,topic_id,starts_at,expires_at').eq('programme_id', programme.id).eq('user_id', user.id).is('revoked_at', null),
      ])
      enrollment = enrollmentData?.status === 'active' ? enrollmentData : null
      grants = grantData || []
      if (enrollment) {
        const progressPromise = supabase.from('exam_subtopic_progress').select('subtopic_id,status,completed_at').eq('enrollment_id', enrollment.id)
        const quizPromise = supabase.from('exam_quiz_attempts').select('attempt_no,score,max_score,percentage,passed,feedback,submitted_at').eq('enrollment_id', enrollment.id).eq('topic_id', topic.id).order('submitted_at', { ascending: false }).limit(5)
        const practicalPromise = supabase.from('exam_topic_practical_submissions').select('id,status,score,reviewer_feedback,submitted_at,rubric_scores,determination').eq('enrollment_id', enrollment.id).eq('topic_id', topic.id).order('submitted_at', { ascending: false }).limit(3)
        const [{ data: progressData }, { data: quizData }, { data: practicalData }] = await Promise.all([progressPromise, quizPromise, practicalPromise])
        subProgress = progressData || []
        quizAttempts = (quizData || []) as QuizAttempt[]
        practicalSubmissions = (practicalData || []) as PracticalSubmission[]
      }
    }
  }

  const activeGrant = grants.some((grant) => (grant.access_level === 'full' || grant.topic_id === topic.id) && new Date(grant.starts_at) <= new Date() && (!grant.expires_at || new Date(grant.expires_at) > new Date()))
  const accessible = topic.sequence_no <= 3 || activeGrant
  const progressMap = new Map(subProgress.map((row) => [row.subtopic_id, row]))
  const completed = subtopics.filter((row:any) => subProgress.some(progress => progress.subtopic_id === row.id && progress.status === 'completed')).length
  const content = topicContent[topicCode]
  if (!content) notFound()
  const latestQuiz = quizAttempts[0]
  const latestPractical = practicalSubmissions[0]
  const messages: Record<string, string> = {
    'progress-saved': 'Subtopic progress saved.',
    'mission-incomplete': 'Complete the dataset mission and confirm your self-check before recording this lesson.',
    'quiz-submitted': 'Quiz scored and saved to your assessment record.',
    'quiz-incomplete': 'Answer all five scored questions before submitting the quiz.',
    'practical-submitted': 'Practical evidence submitted for review.',
    'practical-invalid': 'Provide an 80–3,000 character summary and, if included, a valid HTTPS evidence link.',
    'action-error': 'The requested update could not be completed.',
    'review-saved':'Assessor review saved. Competency and topic gates were recalculated.',
    'review-invalid':'Complete all rubric scores and provide meaningful reviewer feedback.',
    'review-error':'The assessor review could not be saved. Confirm that your account has an active reviewer role.',
  }
  const message = query.state ? messages[query.state] : ''
  const isError = ['action-error', 'mission-incomplete', 'quiz-incomplete', 'practical-invalid','review-invalid','review-error'].includes(query.state || '')
  const loginUrl = `/login?next=${encodeURIComponent(`/exam-hub/${topicCode}`)}`
  const unlockUrl = `https://datalytiqsacademy.com/contact/?subject=${encodeURIComponent('Unlock CA35P Exam Competency Hub')}`

  return <main className="exam-hub topic-workspace">
    <header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>CA35P Topic Workspace</small></a><nav aria-label="Topic navigation"><a href="/exam-hub">Dashboard</a><a href="#learning-sequence">Lessons</a><a href="#practice-bank-title">Practice</a><a href="#topic-quiz">Quiz</a><a href="#practical-submission">Practical</a></nav><MobileExamNav topicCode={topicCode} isReviewer={isReviewer} signedIn={Boolean(user)}/>{user ? <span className="account-chip">Signed in</span> : <a className="nav-cta" href={loginUrl}>Sign in</a>}</header>
    <section className="topic-hero"><div><a href="/exam-hub">← CA35P dashboard</a><span className="exam-kicker">TOPIC {String(topic.sequence_no).padStart(2, '0')} · {topic.sequence_no <= 3 ? 'FREE ACCESS' : 'PREMIUM'}</span><h1>{topic.title}</h1><p>{topic.description}</p></div><aside><span>TOPIC PROGRESS</span><b>{Math.round(completed / Math.max(subtopics.length, 1) * 100)}%</b><small>{completed}/{subtopics.length} subtopics completed</small></aside></section>
    {message ? <div className={`exam-notice ${isError ? 'error' : ''}`} role={isError ? 'alert' : 'status'}>{message}</div> : null}
    {!accessible ? <section className="locked-workspace"><span className="exam-kicker">SUBSCRIPTION REQUIRED</span><h2>This topic is included in full CA35P access.</h2><p>You can review its outline on the dashboard. Guided activities and progress recording unlock after a verified grant is applied.</p><a className="exam-button primary" href={unlockUrl}>Request full access</a></section> : <>
      <TopicLearning subtopics={subtopics} progressMap={progressMap} user={user} enrollment={enrollment} loginUrl={loginUrl} topicCode={topicCode} content={content} />
      <>
        <section className="practice-bank" aria-labelledby="practice-bank-title"><div className="exam-section-head"><div><span className="exam-kicker">CASE QUESTION BANK</span><h2 id="practice-bank-title">Apply the method before the quiz</h2></div><p>{practiceBank[topicCode].length} original case questions with answer guides. Self-check practice does not change your assessment record.</p></div><ol>{practiceBank[topicCode].map((item, index) => <li key={index}><p>{item.prompt}</p><details><summary>Show worked answer</summary><p>{item.answer}</p></details></li>)}</ol></section>
        <CalculationPractice checks={calculationChecks[topicCode]} />
        <section className="assessment-panel" id="topic-quiz"><div className="exam-section-head"><div><span className="exam-kicker">AUTO-SCORED ASSESSMENT</span><h2>Topic {topic.sequence_no} knowledge check</h2></div><p>Five scored questions · pass mark 80% · unlimited attempts. Your latest score is retained with the attempt history.</p></div>
          {latestQuiz ? <div className={`score-card ${latestQuiz.passed ? 'passed' : ''}`}><span>LATEST ATTEMPT {latestQuiz.attempt_no}</span><b>{latestQuiz.score}/{latestQuiz.max_score} · {Math.round(latestQuiz.percentage)}%</b><p>{latestQuiz.feedback}</p><small>{latestQuiz.passed ? 'COMPETENT' : 'RETRY RECOMMENDED'} · {new Date(latestQuiz.submitted_at).toLocaleDateString('en-KE')}</small></div> : null}
          {!user ? <a className="exam-button primary" href={loginUrl}>Sign in to take the quiz</a> : !enrollment ? <form action={startCa35p}><button className="exam-button primary" type="submit">Start free access</button></form> : <form className="quiz-form" action={submitTopicQuiz}><input type="hidden" name="topic_code" value={topicCode} />{content.quiz.map((item, index) => <fieldset key={item.code}><legend><span>{index + 1}</span>{item.question}</legend>{item.options.map(([value, label]) => <label key={value}><input type="radio" name={item.code} value={value} required /> <span>{label}</span></label>)}</fieldset>)}<button className="exam-button primary" type="submit">Submit and score quiz</button></form>}
          {quizAttempts.length > 1 ? <div className="attempt-history"><h3>Recent attempts</h3>{quizAttempts.map((attempt) => <span key={attempt.attempt_no}>Attempt {attempt.attempt_no}: <b>{Math.round(attempt.percentage)}%</b> {attempt.passed ? '· Competent' : '· Review and retry'}</span>)}</div> : null}
        </section>
        <section className="practical-submission" id="practical-submission"><div><span className="exam-kicker">ASSESSED PRACTICAL</span><h2>{content.practicalTitle}</h2><p>{content.practicalDescription}</p><h3>Assignment deliverables</h3><ul className="assignment-checklist">{assignmentChecklist[topicCode].map(item => <li key={item}>{item}</li>)}</ul><p>Use the downloadable practice data. Check source totals, state assumptions, label figures and remove personal data before sharing evidence.</p><div className="rubric"><h3>20-mark rubric</h3>{content.rubric.map(([criterion, marks]) => <span key={criterion}>{criterion} <b>{marks}</b></span>)}</div></div><div>
          {latestPractical ? <><div className="submission-status"><span>LATEST SUBMISSION</span><b>{latestPractical.status.replace('_', ' ')}</b><small>{new Date(latestPractical.submitted_at).toLocaleDateString('en-KE')}</small>{latestPractical.score !== null ? <strong>{latestPractical.score}/20</strong> : null}<p>{latestPractical.reviewer_feedback || 'Reviewer feedback will appear here after assessment.'}</p></div>{isReviewer && (latestPractical.status==='submitted'||latestPractical.status==='under_review'||latestPractical.status==='revision_required')?<details className="assessor-review"><summary>Assessor review</summary><form action={reviewTopicPractical}><input type="hidden" name="submission_id" value={latestPractical.id}/><input type="hidden" name="topic_code" value={topicCode}/><p>Score each rubric criterion from 0–5. A practical score of 14/20 or higher is competent; topic completion additionally requires all subtopics complete and a passed quiz.</p>{[['structure','Structure, controls and data integrity'],['method','Analytical method and accuracy'],['interpretation','Interpretation of evidence'],['recommendation','Decision recommendation and presentation']].map(([name,label])=><label key={name}>{label}<input name={name} type="number" min="0" max="5" step="1" required/></label>)}<label>Reviewer feedback<textarea name="reviewer_feedback" minLength={20} rows={5} required/></label><button className="exam-button primary" type="submit">Save assessment decision</button></form></details>:null}</> : null}
          {!user ? <a className="exam-button primary" href={loginUrl}>Sign in to submit evidence</a> : !enrollment ? <form action={startCa35p}><button className="exam-button primary" type="submit">Start free access</button></form> : <form className="submission-form" action={submitTopicPractical}><input type="hidden" name="topic_code" value={topicCode} /><label htmlFor="summary">Analytical summary <small>80–3,000 characters</small></label><textarea id="summary" name="summary" minLength={80} maxLength={3000} rows={7} required placeholder="Describe your controls, calculations, findings and recommendation…" /><label htmlFor="evidence_link">Evidence link <small>Optional HTTPS share link</small></label><input id="evidence_link" name="evidence_link" type="url" inputMode="url" placeholder="https://…" /><button className="exam-button primary" type="submit">Submit practical evidence</button></form>}
        </div></section>
      </>
    </>}
    <footer><span>DatalytIQs Academy · CA35P</span><a href="/exam-hub">Exam Hub</a><a href="/">Analytics Lab</a></footer>
  </main>
}

function TopicLearning({ subtopics, progressMap, user, enrollment, loginUrl, topicCode, content }: { subtopics: any[]; progressMap: Map<string, ProgressRow>; user: any; enrollment: any; loginUrl: string; topicCode: string; content: (typeof topicContent)[string] }) {
  const subtopicByCode = new Map(subtopics.map((subtopic) => [subtopic.code, subtopic]))
  return <section className="exam-section substantive-lessons" id="learning-sequence"><div className="exam-section-head"><div><span className="exam-kicker">GUIDED LEARNING · APPROX. {content.minutes} MINUTES</span><h2>Learn, practise and produce evidence</h2></div><p>Each lesson combines examinable concepts, a worked example, an applied exercise and an answer guide.</p></div>
    <div className="download-panel"><div><span className="exam-kicker">PRACTICE FILES</span><h3>Download the controlled source files</h3><p>Open the CSV files in Excel, then save your working version as an XLSX workbook.</p></div>{content.downloads.map((download) => <a key={download.href} href={download.href} download><b>{download.title}</b><small>{download.meta}</small><span>Download ↓</span></a>)}</div>
    <div className="lesson-stack">{content.lessons.map((lesson) => { const subtopic = subtopicByCode.get(lesson.code); const progress = subtopic ? progressMap.get(subtopic.id) : undefined; const mission=datasetMissions[lesson.code]; return <article className="lesson-card" key={lesson.code}><header><span>{lesson.code}</span><div><h3>{lesson.title}</h3><small>{lesson.duration}</small></div><b className={`topic-badge ${progress?.status || 'available'}`}>{progress?.status?.replace('_', ' ') || 'not started'}</b></header><div className="lesson-objectives"><h4>By the end, you should be able to:</h4><ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div><div className="concept-grid">{lesson.concepts.map(([title, description]) => <div key={title}><h4>{title}</h4><p>{description}</p></div>)}</div><div className="worked-example"><span>WORKED EXAMPLE</span><h4>{lesson.workedExample.scenario}</h4><ol>{lesson.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><code>{lesson.workedExample.formula}</code><p><b>Interpretation:</b> {lesson.workedExample.interpretation}</p></div><div className="dataset-mission"><span>DATASET MISSION · {mission?.source}</span><p>{mission?.task}</p><details className="answer-guide"><summary>Reveal source-based answer guide</summary><p>{mission?.guide}</p></details><details><summary>Further practice</summary><p>{lesson.exercise}</p><p>{lesson.answerGuide}</p></details></div><div className="lesson-completion">{!user ? <a href={loginUrl}>Sign in to record progress</a> : !enrollment ? <form action={startCa35p}><button type="submit">Start free access</button></form> : progress?.status === 'completed' ? <span className="completion-confirmation" role="status">Completed ✓</span> : subtopic ? <form action={setSubtopicProgress}><input type="hidden" name="subtopic_id" value={subtopic.id} /><input type="hidden" name="topic_code" value={topicCode} /><input type="hidden" name="status" value={progress?.status === 'in_progress' ? 'completed' : 'in_progress'} />{progress?.status === 'in_progress'&&<label className="mission-attestation"><input type="checkbox" name="mission_checked" value="yes" required/> I completed the dataset mission and checked my result against the guide.</label>}<button type="submit">{progress?.status === 'in_progress' ? 'Record lesson completion' : 'Begin lesson'}</button></form> : null}</div></article> })}</div>
  </section>
}
