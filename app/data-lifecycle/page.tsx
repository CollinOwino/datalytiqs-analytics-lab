import Link from "next/link";
import "../public-leadership/public-leadership.css";

const courses = [
  ["DTQ-101", "Questionnaire Design", "Turn a decision need into clear questions, response options, skip logic and a tested instrument.", "Annotated questionnaire and pilot revision log"],
  ["DTQ-102", "KoboToolbox Data Collection", "Build, validate, deploy and test a mobile form; export records that are ready to inspect.", "Live form, test submissions and exported dataset"],
  ["DTQ-103", "Sampling & Sample Size Determination", "Define the population, frame, method, assumptions and a defensible sample-size calculation.", "Sampling plan and calculation workbook"],
  ["DTQ-104", "Field Data Quality Assurance", "Set field protocols, monitor completeness and resolve errors before they become analysis problems.", "Field QA plan and cleaned issue log"],
  ["DTQ-105", "Data Cleaning in Excel", "Profile, standardise, document and protect a raw dataset without erasing its audit trail.", "Cleaning log and reproducible workbook"],
  ["DTQ-106", "Survey Data Analysis in Excel", "Produce correct summaries, comparisons and pivot-table outputs that answer a defined question.", "Analysis workbook and interpretation note"],
  ["DTQ-107", "Data Visualization & Dashboarding", "Choose charts that clarify patterns, build a usable dashboard and avoid visual misdirection.", "Decision dashboard and chart rationale"],
  ["DTQ-108", "Statistical Interpretation", "Interpret uncertainty, comparisons and associations without turning a result into an overclaim.", "Statistical interpretation brief"],
  ["DTQ-109", "Data-Driven Report Writing", "Build an evidence-led report that distinguishes findings, limits and recommendations.", "Decision-ready report with evidence appendix"],
  ["DTQ-110", "From Evidence to Management Decisions", "Convert findings into options, trade-offs, ownership and a measurable implementation direction.", "Executive decision brief and action tracker"],
];

export const metadata = {
  title: "Data Lifecycle Task Pathway | DatalytIQs Academy",
  description: "Stackable, performance-based courses for the practical data lifecycle.",
};

export default function DataLifecyclePage() {
  return (
    <main className="pl-page" id="main-content">
      <a className="pl-skip" href="#pathway">Skip to the course pathway</a>
      <header className="pl-header">
        <Link href="/" className="pl-brand" aria-label="DatalytIQs Academy home"><span aria-hidden="true">D</span><strong>DatalytIQs <small>Academy</small></strong></Link>
        <nav aria-label="Pathway navigation"><a href="#pathway">Course pathway</a><a href="#credential">Credential model</a><Link href="/login">Learner sign-in</Link></nav>
      </header>
      <section className="pl-hero">
        <div>
          <p className="pl-kicker">DTQ SERIES · PERFORMANCE-BASED DATA PRACTICE</p>
          <h1>Build the work. Submit the evidence. Earn the competence.</h1>
          <p className="pl-lead">A stackable pathway for professionals who need to perform one data task well today—or demonstrate end-to-end competence across the data lifecycle. These are practical courses, not a playlist with a certificate attached.</p>
          <div className="pl-actions"><a className="pl-primary" href="#pathway">Explore the DTQ courses</a><a className="pl-secondary" href="#credential">See the evidence standard</a></div>
        </div>
        <aside className="pl-cycle" aria-label="Data lifecycle"><p>THE DATA LIFECYCLE</p>{["Define", "Collect", "Clean", "Analyse", "Visualise", "Interpret", "Report", "Decide"].map((step, index) => <div key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></div>)}</aside>
      </section>
      <section className="pl-facts" aria-label="Pathway summary"><div><strong>10</strong><span>task-specific courses</span></div><div><strong>8</strong><span>lifecycle stages</span></div><div><strong>1</strong><span>stackable credential</span></div><div><strong>0</strong><span>watch-only completions</span></div></section>
      <section className="pl-standards" aria-labelledby="standard-heading"><div className="pl-heading"><p>DESIGN STANDARD</p><h2 id="standard-heading">Each course leaves an auditable trail of practical work.</h2></div><div className="pl-standard-grid"><article><span>01</span><h3>DO THE TASK</h3><p>Short instruction is followed by a realistic job task using a supplied or workplace dataset.</p></article><article><span>02</span><h3>SHOW THE EVIDENCE</h3><p>Learners submit the relevant file, record, link or decision note—not merely a declaration of completion.</p></article><article><span>03</span><h3>PASS THE GATE</h3><p>Competence requires lesson records, accepted professional evidence and protected assessment results.</p></article></div></section>
      <section id="pathway" className="pl-weeks" aria-labelledby="pathway-heading"><div className="pl-heading"><p>DTQ-101 TO DTQ-110</p><h2 id="pathway-heading">Choose one task—or complete the data lifecycle.</h2><span>Individual courses can be taken when a role demands a specific skill. Completing the series builds a portfolio that shows the sequence from a decision problem to accountable action.</span></div><div className="pl-week-list">{courses.map(([code, title, focus, evidence]) => <article className="pl-week" key={code}><header><b>{code.slice(-3)}</b><div><p>{code}</p><h3>{title}</h3><span>{focus}</span></div><strong>EVIDENCE<br /><em>{evidence}</em></strong></header><ol><li><b>01</b><span>Complete guided practice against a real or provided work scenario.</span></li><li><b>02</b><span>Record the lesson task and submit the required professional evidence.</span></li><li><b>03</b><span>Pass a protected competence check before the completion record is issued.</span></li></ol></article>)}</div></section>
      <section id="credential" className="pl-assessment" aria-labelledby="credential-heading"><div><p>STACKABLE CREDENTIAL</p><h2 id="credential-heading">A credential should show what a professional can do.</h2><span>DTQ course records are designed to attach a completed task, evidence review status, quiz result and the learner&apos;s decision rationale to each competency—not simply a video watch history.</span></div><ol><li><b>01</b><span><strong>Single-course badge</strong>Issued after every required task, evidence and assessment gate passes.</span></li><li><b>02</b><span><strong>Lifecycle portfolio</strong>Collects the ten verified artefacts into a structured professional record.</span></li><li><b>03</b><span><strong>Pathway credential</strong>Issued only when all lifecycle competencies and the final decision case are competent.</span></li><li><b>04</b><span><strong>Reviewer-ready record</strong>Retains evidence links, timestamps and assessment outcomes for verification.</span></li></ol></section>
      <section className="pl-next"><p>DATA TASK QUALIFICATION SERIES · VERSION 1.0</p><h2>Begin with the data task that is blocking the work.</h2><span>The pathway is deliberately one catalogue option on the Academy landing page. The detail lives here, where a learner can choose the right task without turning the main menu into a filing cabinet.</span><Link className="pl-module-link" href="/login">Request DTQ enrolment →</Link></section>
      <footer><span>Data Task Qualification Series · Version 1.0</span><Link href="/">DatalytIQs Academy</Link></footer>
    </main>
  );
}
