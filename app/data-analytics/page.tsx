import Link from "next/link";
import "../public-leadership/public-leadership.css";

const modules = [
  [
    "01",
    "Analytical Thinking and Decision Questions",
    "Turn an operational concern into a focused analytical question, scope and decision brief.",
    "Analytical problem-framing brief",
    "Separate a broad management complaint from a question that data can answer.",
  ],
  [
    "02",
    "Data Literacy, Structures and Spreadsheet Discipline",
    "Read data structures, data types and business rules while working safely in spreadsheets.",
    "Data inventory and field guide",
    "Identify the risks hidden inside an inherited spreadsheet report.",
  ],
  [
    "03",
    "Data Cleaning, Validation and Quality Assurance",
    "Prepare reliable analysis-ready data by managing missingness, duplicates, inconsistencies and implausible values.",
    "Data-cleaning and quality log",
    "Decide which data defects can be corrected and which require escalation.",
  ],
  [
    "04",
    "Excel Analysis for Operational Decisions",
    "Use formulas, lookups, tables, pivot tables and validation checks to answer routine management questions.",
    "Operational analysis workbook",
    "Build a repeatable monthly performance analysis without hand-editing totals.",
  ],
  [
    "05",
    "SQL for Data Extraction and Reconciliation",
    "Query, join and reconcile structured data while documenting the logic behind every result.",
    "SQL query and reconciliation pack",
    "Trace the cause of mismatched totals across two operational systems.",
  ],
  [
    "06",
    "Descriptive Statistics and Performance Patterns",
    "Summarise distributions, variation, trends and comparisons without overstating what the figures show.",
    "Statistical performance summary",
    "Explain a change in average performance when the underlying distribution tells a different story.",
  ],
  [
    "07",
    "Data Visualisation and Dashboard Reporting",
    "Use tables, charts and dashboard components that reveal material patterns and exceptions clearly.",
    "Decision dashboard and design rationale",
    "Replace decorative charts with a concise performance dashboard leaders can act upon.",
  ],
  [
    "08",
    "Interpretation, Root Causes and Recommendations",
    "Connect findings to operational context, investigate plausible drivers and recommend proportionate action.",
    "Insight and recommendation brief",
    "Move from a finding to an action without confusing association with proof of cause.",
  ],
  [
    "09",
    "Reporting Automation and Reproducible Workflows",
    "Create controlled repeatable workflows using spreadsheet, SQL and documented analytical steps.",
    "Reproducible reporting workflow",
    "Reduce a manual report process while keeping checks, ownership and auditability intact.",
  ],
  [
    "10",
    "Data Analytics Capstone and Portfolio",
    "Deliver a complete evidence product from question through data preparation, analysis, visualisation and recommendation.",
    "Professional analytics portfolio and capstone presentation",
    "Defend an analytical recommendation under management challenge.",
  ],
];

const standards = [
  [
    "PRACTICAL FROM DAY ONE",
    "Every module is anchored in the spreadsheets, systems and decisions encountered in real organisations.",
  ],
  [
    "METHOD BEFORE TOOL",
    "Tools accelerate analysis; clear questions, sound data and transparent logic make it credible.",
  ],
  [
    "EVIDENCE INTO ACTION",
    "Learners practise explaining implications, uncertainty and next actions—not merely producing tables.",
  ],
];

export const metadata = {
  title: "Data Analytics Professional Pathway | DatalytIQs Academy",
  description:
    "A ten-module practical data analytics course using Excel, SQL, statistics, dashboards and decision-ready reporting.",
};

export default function DataAnalyticsProgramme() {
  return (
    <main className="pl-page" id="main-content">
      <a className="pl-skip" href="#programme-modules">
        Skip to programme modules
      </a>
      <header className="pl-header">
        <Link
          href="/"
          className="pl-brand"
          aria-label="DatalytIQs Academy home"
        >
          <span aria-hidden="true">D</span>
          <strong>
            DatalytIQs <small>Academy</small>
          </strong>
        </Link>
        <nav aria-label="Programme navigation">
          <a href="#programme-modules">Pathway</a>
          <a href="#assessment">Assessment</a>
          <Link href="/login">Learner sign-in</Link>
        </nav>
      </header>

      <section className="pl-hero">
        <div>
          <p className="pl-kicker">
            DATA ANALYTICS PROFESSIONAL PATHWAY · VERSION 1.0
          </p>
          <h1>Find the signal. Explain it clearly. Improve the decision.</h1>
          <p className="pl-lead">
            A practical pathway for analysts, officers and managers who need to
            convert operational data into reliable insight. Learn disciplined
            data work with Excel, SQL, statistics, dashboards and evidence-led
            recommendations.
          </p>
          <div className="pl-actions">
            <a className="pl-primary" href="#programme-modules">
              Explore the pathway
            </a>
            <a className="pl-secondary" href="#assessment">
              Review competency outputs
            </a>
          </div>
        </div>
        <aside className="pl-cycle" aria-label="Data analytics cycle">
          <p>THE ANALYTICS CYCLE</p>
          {["Question", "Data", "Prepare", "Analyse", "Explain", "Act"].map(
            (step, index) => (
              <div key={step}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{step}</span>
              </div>
            ),
          )}
        </aside>
      </section>

      <section className="pl-facts" aria-label="Programme summary">
        <div>
          <strong>10</strong>
          <span>competency modules</span>
        </div>
        <div>
          <strong>30</strong>
          <span>guided practice sessions</span>
        </div>
        <div>
          <strong>10</strong>
          <span>professional outputs</span>
        </div>
        <div>
          <strong>1</strong>
          <span>analytics portfolio</span>
        </div>
      </section>

      <section className="pl-standards" aria-labelledby="standard-heading">
        <div className="pl-heading">
          <p>LEARNING STANDARD</p>
          <h2 id="standard-heading">
            A complete analytical workflow, not isolated software lessons.
          </h2>
        </div>
        <div className="pl-standard-grid">
          {standards.map(([title, text], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="programme-modules"
        className="pl-weeks"
        aria-labelledby="modules-heading"
      >
        <div className="pl-heading">
          <p>FOUNDATIONS → CAPSTONE</p>
          <h2 id="modules-heading">The data analytics learning sequence</h2>
          <span>
            Each module develops a reusable workplace capability, reinforced
            through guided practice, decision clinics and a reviewed
            professional output.
          </span>
        </div>
        <div className="pl-week-list">
          {modules.map(([number, title, focus, output, clinic]) => (
            <article className="pl-week" key={number}>
              <header>
                <b>{number}</b>
                <div>
                  <p>MODULE {number}</p>
                  <h3>{title}</h3>
                  <span>{focus}</span>
                </div>
                <strong>
                  PROFESSIONAL OUTPUT<em>{output}</em>
                </strong>
              </header>
              <ol>
                <li>
                  <b>01</b>
                  <span>
                    <strong>Guided practice:</strong> apply an analytical method
                    to a realistic organisational dataset.
                  </span>
                </li>
                <li>
                  <b>02</b>
                  <span>
                    <strong>Decision clinic:</strong> {clinic}
                  </span>
                </li>
                <li>
                  <b>03</b>
                  <span>
                    <strong>Workplace output:</strong> create and document an
                    evidence product ready for peer or supervisor review.
                  </span>
                </li>
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section
        id="assessment"
        className="pl-assessment"
        aria-labelledby="assessment-heading"
      >
        <div>
          <p>COMPETENCY ASSESSMENT</p>
          <h2 id="assessment-heading">
            Assessment is based on analysis that can be checked and used.
          </h2>
          <span>
            Learners demonstrate clear questions, quality-controlled data,
            reproducible logic, sound interpretation and recommendations that
            respect evidence limits.
          </span>
        </div>
        <ol>
          <li>
            <b>25%</b>
            <span>
              <strong>Applied exercises</strong>Module practice and
              methodological checks.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Professional outputs</strong>Quality, transparency and
              usability of ten analytics artefacts.
            </span>
          </li>
          <li>
            <b>15%</b>
            <span>
              <strong>Peer review</strong>Challenge and refine analytical logic,
              visuals and recommendations.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Capstone defence</strong>Present and defend a complete
              decision-ready analysis.
            </span>
          </li>
        </ol>
      </section>

      <section className="pl-next">
        <p>DATA ANALYTICS PROFESSIONAL PATHWAY · VERSION 1.0</p>
        <h2>Reliable data work for decisions that matter.</h2>
        <span>
          Designed for analysts and decision-makers who need practical
          analytical confidence before advancing into specialised data science
          or business intelligence work.
        </span>
        <Link className="pl-module-link" href="/login">
          Request enrolment →
        </Link>
      </section>
      <footer>
        <span>Data Analytics Professional Pathway · Version 1.0</span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
