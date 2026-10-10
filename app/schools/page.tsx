import type { Metadata } from 'next'
import { createClient } from '../../lib/supabase/server'
import { GRACE_DAYS, SCHOOL_TIERS } from '../../lib/schools/licensing'
import './schools.css'

export const metadata: Metadata = {
  title: 'Young Data Scientists Club for Schools | DatalytIQs',
  description: 'Supervised school clubs with Python for Kids and data science learning pathways.',
}

const academy = 'https://datalytiqsacademy.com'
const units = [
  ['Data detectives', 'Frame an answerable question about a fictional school library.'],
  ['Collect and check', 'Audit anonymous responses, missing fields and duplicates.'],
  ['Spreadsheet explorers', 'Count, sort and validate a synthetic borrowing log.'],
  ['Describe and visualise', 'Calculate a median and build an honest bar chart.'],
  ['Code the evidence', 'Count categories with Python and compare to a hand tally.'],
  ['Share a finding', 'Write a short, evidence-based library decision brief.'],
]

export default async function SchoolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: memberships } = user
    ? await supabase.from('ya_cohort_memberships').select('cohort_id,member_role,status').eq('user_id', user.id).eq('status', 'active')
    : { data: null }
  const ids = (memberships ?? []).map(m => m.cohort_id)
  const { data: cohorts } = ids.length
    ? await supabase.from('ya_cohorts').select('id,name,programme_id,club_id,status').in('id', ids)
    : { data: [] }
  const { data: programmes } = await supabase.from('learning_programmes').select('id,code,title').eq('status', 'published')
  const codeById = new Map((programmes ?? []).map(p => [p.id, p.code]))
  const roleByCohort = new Map((memberships ?? []).map(m => [m.cohort_id, m.member_role]))
  // The database policies limit assignments to cohort members and submissions to
  // the owning learner or an assigned instructor. Never fetch with a service key.
  const { data: assignments } = ids.length
    ? await supabase.from('ya_challenge_assignments').select('id,cohort_id,due_at,status').in('cohort_id', ids)
    : { data: [] }
  const assignmentIds = (assignments ?? []).map(a => a.id)
  const { data: submissions } = assignmentIds.length
    ? await supabase.from('ya_challenge_submissions').select('id,assignment_id,status').in('assignment_id', assignmentIds)
    : { data: [] }
  const assignmentsByCohort = (cohortId: string) => (assignments ?? []).filter(a => a.cohort_id === cohortId)
  const submissionsByCohort = (cohortId: string) => {
    const cohortAssignments = new Set(assignmentsByCohort(cohortId).map(a => a.id))
    return (submissions ?? []).filter(s => cohortAssignments.has(s.assignment_id))
  }

  return <main className="school-page">
    <header className="school-nav"><a className="school-brand" href="/"><span>D</span><strong>DatalytIQs <small>Analytics Lab</small></strong></a><nav aria-label="School club navigation"><a href="#pathways">Pathways</a><a href="#curriculum">Curriculum</a><a href="#licences">School licences</a><a href="#club">My club</a><a href={`${academy}/contact/`}>School enquiry</a></nav></header>
    <section className="school-hero"><div><p className="school-eyebrow">YOUNG DATA SCIENTISTS CLUB · SCHOOLS</p><h1>Ask questions.<br/>Build skills.<br/><em>Show your evidence.</em></h1><p>Supervised pathways for primary and secondary school clubs. Start with Python for Kids, explore data science, or plan for both as independent learning tracks.</p><div className="school-actions"><a className="school-primary" href={`${academy}/contact/`}>Plan a school club ↗</a><a href="#pathways">Explore the pathways ↓</a></div></div><aside aria-label="Club learning journey"><span>01 · LEARN</span><b>Academy lessons</b><span>02 · PRACTISE</span><b>Analytics Lab challenges</b><span>03 · REFLECT</span><b>Instructor-guided reflection</b></aside></section>
    <section id="pathways" className="school-section"><p className="school-eyebrow">TWO WAYS TO LEARN</p><h2>Choose either pathway or both.</h2><div className="school-cards"><article><span>01 · PROGRAMMING</span><h3>Python for Kids</h3><p>Run short programs, fix bugs and create useful projects. Modules 1–3 are free; later modules require the appropriate individual or school access grant.</p><a href="/python-for-kids">Explore the free modules →</a></article><article><span>02 · DATA SCIENCE</span><h3>Young Data Scientists</h3><p>Investigate a question, collect safe data, use spreadsheets, interpret statistics, build charts and present a defensible finding.</p><a href="#curriculum">See the six-unit progression →</a></article></div></section>
    <section id="curriculum" className="school-section school-tint"><p className="school-eyebrow">PROJECT-LED LEARNING</p><h2>A real question, fictional data.</h2><p className="school-intro">A synthetic library borrowing case runs through each unit, ending in a short recommendation to the fictional school librarian. No learner records are needed for practice.</p><ol className="school-units">{units.map(([title,detail]) => <li key={title}><h3>{title}</h3><p>{detail}</p></li>)}</ol><a className="school-primary" href="/schools/library-lab">Try the library data challenge →</a></section>
    <section id="licences" className="school-section"><p className="school-eyebrow">ANNUAL SCHOOL LICENCES</p><h2>Choose a club capacity.</h2><p className="school-intro">Every plan supports a supervised school club with Python for Kids and Young Data Scientists pathway selection. Python for Kids Modules 1–3 remain free.</p><div className="school-plans">{SCHOOL_TIERS.map(tier => <article key={tier.sku}><h3>{tier.name}</h3><p className="school-plan-capacity">Up to {tier.seats} learners</p><p className="school-plan-price">KES {tier.annualPriceKes.toLocaleString('en-KE')} <span>/ year</span></p><a href={`${academy}/contact/`}>Enquire about {tier.name} →</a></article>)}</div><p className="school-note">Renewal is invoiced manually. Existing learners have a {GRACE_DAYS}-day grace period after the paid year ends; new enrolments pause during grace. Club activation follows verified payment and school onboarding.</p></section>
    <section id="club" className="school-section"><p className="school-eyebrow">PRIVATE CLUB ACCESS</p><h2>{user ? 'Your school workspace' : 'Your school club starts here'}</h2>{!user ? <p>Sign in to see cohorts assigned to your account. A school administrator arranges club membership and supervised learner access.</p> : cohorts?.length ? <div className="school-cards">{cohorts.map(c => { const cohortAssignments = assignmentsByCohort(c.id); const cohortSubmissions = submissionsByCohort(c.id); const role = roleByCohort.get(c.id); return <article key={c.id}><span>{role?.replaceAll('_',' ') ?? 'MEMBER'} · {c.status}</span><h3>{c.name}</h3><p>Pathway: {codeById.get(c.programme_id) === 'PY-KIDS' ? 'Python for Kids' : codeById.get(c.programme_id) ?? 'Data science'}</p><p>{cohortAssignments.length} visible assignment{cohortAssignments.length === 1 ? '' : 's'} · {cohortSubmissions.length} {role === 'instructor' ? 'visible submission' : 'own submission'}{cohortSubmissions.length === 1 ? '' : 's'}</p>{cohortAssignments.some(a => a.due_at && new Date(a.due_at).getTime() > Date.now()) && <p>Upcoming assignment deadline: {new Date(cohortAssignments.filter(a => a.due_at && new Date(a.due_at).getTime() > Date.now()).sort((a,b) => Date.parse(a.due_at) - Date.parse(b.due_at))[0].due_at).toLocaleDateString('en-KE')}</p>}<a href={codeById.get(c.programme_id) === 'PY-KIDS' ? '/python-for-kids' : '/schools/library-lab'}>Open pathway →</a></article> })}</div> : <p>No active school cohort is linked to this account. Your school coordinator can arrange access after institutional onboarding.</p>}{!user && <a className="school-primary" href="/login?next=/schools">Sign in to my club</a>}<p className="school-note">School projects and personal details are private. Community spaces require separate school moderation and permission setup.</p></section>
    <footer className="school-footer"><strong>DatalytIQs Academy</strong><p>Schools can discuss learner capacity, instructors and institutional licensing with the team. Do not include learner records in the first enquiry.</p><a href={`${academy}/contact/`}>Discuss a school club ↗</a></footer>
  </main>
}
