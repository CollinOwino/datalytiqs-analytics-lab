import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { dtqAccess, DTQ_COURSE } from '../../../lib/practicals/dtq101'
import { DTQSubmissionForm } from '../dtq-101/submission-form'

type Practical = {
  code: string
  title: string
  focus: string
  task: string
  evidence: string
}

const practicals: Record<string, Practical> = {
  'merl-101': { code: 'MERL-101', title: 'MERL Foundations', focus: 'Evidence functions, results logic and decision use.', task: 'Classify a live organisational evidence request and prepare a decision-ready indicator note.', evidence: 'Evidence-function matrix and indicator note.' },
  'ds-101': { code: 'DS-101', title: 'Data Science — Beginner to Advanced', focus: 'Reproducible analysis, modelling and responsible use.', task: 'Frame a question, document a reproducible analysis and explain model limits to a decision-maker.', evidence: 'Notebook, validation summary and decision brief.' },
  'bi-101': { code: 'BI-101', title: 'Business Intelligence', focus: 'KPI governance, dashboards and executive intelligence.', task: 'Build a KPI dictionary and dashboard wireframe for a management decision.', evidence: 'KPI dictionary, dashboard wireframe and insight note.' },
  'da-101': { code: 'DA-101', title: 'Data Analytics', focus: 'Cleaning, exploration, interpretation and communication.', task: 'Clean a supplied dataset and produce an evidence-led management insight.', evidence: 'Cleaning record, reproducible analysis and insight brief.' },
  'dte-101': { code: 'DT-101', title: 'Digital Transformation & Data Systems for Executives', focus: 'Digital strategy, data governance and delivery risk.', task: 'Assess a service transformation scenario and define accountable implementation controls.', evidence: 'Transformation roadmap, governance map and executive decision note.' },
  'stats-101': { code: 'STAT-101', title: 'Practical Statistics for Evidence-Based Decisions', focus: 'Study design, uncertainty and responsible interpretation.', task: 'Analyse a small decision dataset and state what the evidence does—and does not—support.', evidence: 'Analysis plan, annotated output and interpretation note.' },
  'excel-bursars-101': { code: 'EXCEL-101', title: 'Comprehensive Excel for School Bursars — Kenya', focus: 'School finance controls, reconciliation and reporting.', task: 'Prepare a protected finance-control workbook and reconcile a sample cashbook.', evidence: 'Workbook, reconciliation and finance-committee report.' },
  'public-leadership-101': { code: 'LDR-101', title: 'Leadership and Policymaking for Public Officers', focus: 'Policy choices, implementation and accountable delivery.', task: 'Prepare an evidence-backed policy-options paper with ownership and implementation controls.', evidence: 'Policy-options paper, stakeholder map and delivery scorecard.' },
  'senior-management-101': { code: 'SM-101', title: 'Senior Management', focus: 'Strategic direction, risk and executive performance.', task: 'Turn a management scenario into a strategic-direction statement and risk response.', evidence: 'Strategic-direction statement, executive dashboard and risk brief.' },
  'dtq-101': { code: 'DTQ-101', title: 'Questionnaire Design', focus: 'Decision-led questions, flow and validation.', task: 'Design and pilot a questionnaire for a defined decision problem.', evidence: 'Questionnaire, codebook and pilot-revision note.' },
  'dtq-102': { code: 'DTQ-102', title: 'KoboToolbox Data Collection', focus: 'Digital forms, validation and field readiness.', task: 'Configure a mobile form, submit test records and inspect the export.', evidence: 'Deployed form, test records, export and quality-check note.' },
  'dtq-103': { code: 'DTQ-103', title: 'Sampling & Sample Size Determination', focus: 'Population, sampling frame and defensible allocation.', task: 'Calculate a sample size and prepare a transparent selection protocol.', evidence: 'Calculation workbook, allocation matrix and sampling protocol.' },
  'dtq-104': { code: 'DTQ-104', title: 'Field Data Quality Assurance', focus: 'Monitoring, verification and correction controls.', task: 'Create a field QA plan and investigate a simulated quality exception.', evidence: 'QA plan, monitoring log and corrective-action report.' },
  'dtq-105': { code: 'DTQ-105', title: 'Data Cleaning in Excel', focus: 'Audit trails, standardisation and exception handling.', task: 'Clean a raw dataset without erasing the source record.', evidence: 'Cleaned workbook, cleaning log and exception summary.' },
  'dtq-106': { code: 'DTQ-106', title: 'Survey Data Analysis in Excel', focus: 'Tabulation, comparisons and defensible summaries.', task: 'Analyse a survey dataset using a pre-specified tabulation plan.', evidence: 'Analysis workbook, tabulation plan and findings brief.' },
  'dtq-107': { code: 'DTQ-107', title: 'Data Visualization & Dashboarding', focus: 'Decision-focused chart selection and dashboard design.', task: 'Build a dashboard that makes an operational exception visible and actionable.', evidence: 'Dashboard, KPI dictionary and interpretation note.' },
  'dtq-108': { code: 'DTQ-108', title: 'Statistical Interpretation', focus: 'Uncertainty, comparisons and statistical claims.', task: 'Rewrite a set of overstated findings into accurate decision language.', evidence: 'Statistical interpretation memo.' },
  'dtq-109': { code: 'DTQ-109', title: 'Data-Driven Report Writing', focus: 'Traceable findings, limits and recommendations.', task: 'Prepare a decision-ready report from supplied analytical outputs.', evidence: 'Report and evidence-traceability matrix.' },
  'dtq-110': { code: 'DTQ-110', title: 'From Evidence to Management Decisions', focus: 'Options, trade-offs and accountable action.', task: 'Convert findings into options, a decision record and follow-up indicators.', evidence: 'Decision brief, option appraisal and action tracker.' },
}

export function generateStaticParams() {
  return Object.keys(practicals).map((courseCode) => ({ courseCode }))
}

export function generateMetadata({ params }: { params: Promise<{ courseCode: string }> }) {
  return params.then(({ courseCode }) => {
    const course = practicals[courseCode]
    return { title: course ? `${course.code} Practical Checkpoint | DatalytIQs Analytics Lab` : 'Practical Checkpoint | DatalytIQs Analytics Lab' }
  })
}

export default async function PracticalCheckpointPage({ params }: { params: Promise<{ courseCode: string }> }) {
  const { courseCode } = await params
  const course = practicals[courseCode]
  if (!course) notFound()
  let dtqSection: ReactNode = null
  if (courseCode === 'dtq-101') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      dtqSection = <section style={{ marginTop: 28, padding: 24, background: 'white' }}>
        <h2>Submission requires learner sign-in</h2>
        <a href="/login?next=%2Fpracticals%2Fdtq-101">Sign in to submit your work</a>
      </section>
    } else {
      const { entitled, reviewer } = await dtqAccess(user.id)
      if (!entitled) {
        dtqSection = <section style={{ marginTop: 28, padding: 24, background: 'white' }}>
          <h2>Enrolment required</h2><p>DTQ-101 evidence submission is available only after verified course enrolment.</p>
          <a href="https://datalytiqsacademy.com/courses/">Check your Academy enrolment</a>
          {reviewer && <p><a href="/practicals/dtq-101/review">Instructor review queue →</a></p>}
        </section>
      } else {
        const admin = createAdminClient()
        const { data: submission, error } = await admin.from('practical_submissions')
          .select('status,summary,score,reviewer_feedback,questionnaire_path,codebook_path,pilot_note_path,rubric_scores')
          .eq('user_id', user.id).eq('course_code', DTQ_COURSE).maybeSingle()
        if (error) throw error
        const initial = submission ? {
          ...submission,
          rubric_scores: submission.rubric_scores as Record<string, number> | null,
        } : null
        dtqSection = <>{reviewer && <p><a href="/practicals/dtq-101/review">Instructor review queue →</a></p>}
          <DTQSubmissionForm initial={initial} /></>
      }
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f6f8fb', color: '#0b2c4d', fontFamily: 'Arial, sans-serif' }}>
      <a href="#checkpoint" style={{ position: 'absolute', left: '-9999px' }}>Skip to practical checkpoint</a>
      <header style={{ background: '#081f33', color: 'white', padding: '20px clamp(20px, 6vw, 88px)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 700 }}>DatalytIQs Analytics Lab</Link>
        <a href="https://datalytiqsacademy.com/courses/" style={{ color: '#f4a261' }}>Return to Academy theory</a>
      </header>
      <section id="checkpoint" style={{ maxWidth: 920, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ color: '#1565c0', fontWeight: 700, letterSpacing: 1.2 }}>{course.code} · PRACTICAL CHECKPOINT</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '12px 0 16px' }}>{course.title}</h1>
        <p style={{ fontSize: '1.15rem', maxWidth: 700, lineHeight: 1.65 }}>{course.focus} This page defines the assessed practical work; theory and protected knowledge checks remain in the Academy.</p>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 36 }}>
          <article style={{ background: 'white', border: '1px solid #dbe4ec', borderTop: '4px solid #f4a261', borderRadius: 8, padding: 24 }}><h2 style={{ fontSize: '1.05rem' }}>Practical task</h2><p style={{ lineHeight: 1.6 }}>{course.task}</p></article>
          <article style={{ background: 'white', border: '1px solid #dbe4ec', borderTop: '4px solid #1565c0', borderRadius: 8, padding: 24 }}><h2 style={{ fontSize: '1.05rem' }}>Evidence standard</h2><p style={{ lineHeight: 1.6 }}>{course.evidence}</p></article>
        </section>
        <section style={{ background: '#0b2c4d', color: 'white', borderRadius: 8, padding: 28, marginTop: 24 }}>
          <h2 style={{ marginTop: 0 }}>Assessment flow</h2>
          <ol style={{ lineHeight: 1.8, paddingLeft: 22 }}><li>Complete the related Academy theory and protected quiz.</li><li>Perform this practical task using approved or workplace-safe materials.</li><li>Record the work and submit the specified evidence when enrolment is active.</li></ol>
          <p style={{ marginBottom: 0, color: '#dce8f2' }}>Practical recording is protected behind learner sign-in. No duplicate assignment is created here.</p>
        </section>
        {dtqSection}
      </section>
    </main>
  )
}
