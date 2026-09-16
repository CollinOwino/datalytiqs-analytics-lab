import Link from "next/link";
import "../public-leadership/public-leadership.css";

const modules = [
  [
    "01",
    "Business Intelligence Foundations and Decision Architecture",
    "Connect strategy, decisions, users and data to a usable intelligence operating model.",
    "Decision and intelligence requirements map",
    "Distinguish reporting requests from the decisions that actually need support.",
  ],
  [
    "02",
    "KPI Design, Metric Governance and Performance Logic",
    "Define reliable indicators, targets, owners and calculation rules that are understood consistently.",
    "KPI dictionary and performance framework",
    "Repair a dashboard whose headline indicators cannot be reconciled.",
  ],
  [
    "03",
    "Data Sources, Quality and Analytical Readiness",
    "Assess operational, financial, programme and external data for completeness, consistency, timeliness and fitness for purpose.",
    "Data quality scorecard and remediation plan",
    "Decide whether a management report is strong enough to drive action.",
  ],
  [
    "04",
    "Data Modelling for Business Intelligence",
    "Structure data into governed, analysable models that support repeatable reporting and drill-down analysis.",
    "Dimensional model and data lineage map",
    "Model a fragmented service-delivery dataset for executive reporting.",
  ],
  [
    "05",
    "SQL and Data Transformation for Analysts",
    "Extract, join, validate and prepare decision-ready datasets using transparent, reproducible logic.",
    "Reproducible SQL transformation pack",
    "Investigate why two trusted reports produce different totals.",
  ],
  [
    "06",
    "Dashboard Design and Data Visualisation",
    "Design accessible dashboards that make performance patterns, exceptions and trade-offs clear without creating visual noise.",
    "Interactive dashboard specification",
    "Redesign an attractive dashboard that does not support a decision.",
  ],
  [
    "07",
    "Descriptive Analysis, Trends and Performance Interpretation",
    "Move from counts and charts to defensible explanations of what changed, where it changed and what requires action.",
    "Performance interpretation brief",
    "Explain a material performance decline without confusing correlation, coincidence and cause.",
  ],
  [
    "08",
    "Forecasting, Scenarios and Decision Support",
    "Use assumptions, sensitivity analysis and simple forecasts to prepare leaders for plausible operating conditions.",
    "Scenario model and decision note",
    "Advise on resource choices under three different demand and funding scenarios.",
  ],
  [
    "09",
    "BI Governance, Security and Adoption",
    "Establish ownership, access control, quality assurance, release management and routines that make intelligence trusted and used.",
    "BI governance and adoption playbook",
    "Respond to a sensitive-data access concern while maintaining critical reporting access.",
  ],
  [
    "10",
    "Business Intelligence Capstone and Executive Story",
    "Integrate data, analysis, visualisation and recommendation into an executive intelligence product that can drive action.",
    "Executive intelligence portfolio and capstone briefing",
    "Defend an evidence-backed recommendation to a simulated leadership team.",
  ],
];

const standards = [
  [
    "DECISION CENTRED",
    "Every dashboard, model and analysis begins with a decision, owner and use case.",
  ],
  [
    "TRUSTWORTHY BY DESIGN",
    "Metrics, transformations and visualisations remain traceable, governed and open to challenge.",
  ],
  [
    "USED, NOT JUST BUILT",
    "Each output is tested with the people expected to act on it and refined for real operating conditions.",
  ],
];

export const metadata = {
  title: "Business Intelligence Professional Pathway | DatalytIQs Academy",
  description:
    "A ten-module applied Business Intelligence course from decision architecture and KPIs to governed dashboards and executive decision support.",
};

export default function BusinessIntelligenceProgramme() {
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
            BUSINESS INTELLIGENCE PROFESSIONAL PATHWAY · VERSION 1.0
          </p>
          <h1>Turn organisational data into decisions that hold up.</h1>
          <p className="pl-lead">
            A comprehensive, practice-led pathway for analysts, managers and
            decision-makers who need to build trusted performance
            intelligence—from KPI definitions and data models to dashboards,
            scenarios and executive action.
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
        <aside
          className="pl-cycle"
          aria-label="Business intelligence operating cycle"
        >
          <p>THE BI OPERATING CYCLE</p>
          {["Decision", "Metrics", "Data", "Model", "Insight", "Action"].map(
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
          <span>executive BI portfolio</span>
        </div>
      </section>

      <section className="pl-standards" aria-labelledby="standard-heading">
        <div className="pl-heading">
          <p>BI LEARNING STANDARD</p>
          <h2 id="standard-heading">
            More than dashboards. A disciplined intelligence capability.
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
          <h2 id="modules-heading">
            The complete business intelligence sequence
          </h2>
          <span>
            Each module combines practical instruction, a decision clinic and a
            workplace-standard output. The capstone assembles them into a
            coherent executive intelligence product.
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
                    <strong>Learn and practise:</strong> apply concepts to a
                    realistic organisational data and decision context.
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
                    <strong>Produce evidence:</strong> create, document and
                    refine the professional output for review.
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
            Completion means building intelligence that earns trust.
          </h2>
          <span>
            Assessment tests both technical quality and decision usefulness:
            sound measures, traceable data, clear communication, governance
            safeguards and a recommendation that leaders can act upon.
          </span>
        </div>
        <ol>
          <li>
            <b>25%</b>
            <span>
              <strong>Applied practice</strong>Completion of module clinics and
              methodological checks.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Professional outputs</strong>Quality, traceability and
              usability of the ten BI artefacts.
            </span>
          </li>
          <li>
            <b>15%</b>
            <span>
              <strong>Peer review</strong>Constructive challenge of logic,
              visualisation and interpretation.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Executive capstone</strong>Presentation and defence of a
              complete BI product and recommendation.
            </span>
          </li>
        </ol>
      </section>

      <section className="pl-next">
        <p>BUSINESS INTELLIGENCE PROFESSIONAL PATHWAY · VERSION 1.0</p>
        <h2>Trusted data. Clear insight. Accountable action.</h2>
        <span>
          Built for analysts and leaders who want reporting systems that explain
          performance, expose risk and improve the quality of decisions.
        </span>
        <Link className="pl-module-link" href="/login">
          Request enrolment →
        </Link>
      </section>
      <footer>
        <span>Business Intelligence Professional Pathway · Version 1.0</span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
