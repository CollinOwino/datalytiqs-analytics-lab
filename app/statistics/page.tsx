import Link from "next/link";
import "../public-leadership/public-leadership.css";

const modules = [
  [
    "01",
    "Statistical Thinking for Decisions",
    "Frame decisions, populations, variables, uncertainty and evidence before choosing a method.",
    "Statistical decision brief",
    "Identify the claims a management team can and cannot make from an observed performance difference.",
  ],
  [
    "02",
    "Data Quality, Measurement and Statistical Ethics",
    "Assess how data were generated, measured, classified and governed before treating numbers as evidence.",
    "Measurement and data-quality audit",
    "Determine whether a KPI changed because performance changed or because measurement changed.",
  ],
  [
    "03",
    "Study Design, Sampling and Surveys",
    "Design samples, questionnaires and fieldwork processes that support credible estimation and fair representation.",
    "Sampling and survey protocol",
    "Build a feasible sample under cost, access and representation constraints.",
  ],
  [
    "04",
    "Exploratory Data Analysis and Visual Discovery",
    "Use distributions, summaries and visual exploration to understand patterns, anomalies and data limitations.",
    "Exploratory analysis report",
    "Find the hidden story in a summary table before formal inference begins.",
  ],
  [
    "05",
    "Probability, Risk and Uncertainty",
    "Use probability, conditional reasoning and simulation to make uncertainty visible in practical decisions.",
    "Risk and uncertainty model",
    "Explain a low-probability, high-impact operational risk without misleading stakeholders.",
  ],
  [
    "06",
    "Estimation, Confidence Intervals and Evidence",
    "Estimate quantities of interest, quantify precision and communicate uncertainty without treating a p-value as a verdict.",
    "Estimation and uncertainty brief",
    "Choose an action when the estimate is useful but imprecise.",
  ],
  [
    "07",
    "Hypothesis Tests, Effect Sizes and Practical Significance",
    "Evaluate differences and relationships using meaningful effect sizes, assumptions and decision context.",
    "Comparative analysis and decision note",
    "Distinguish statistical significance from an effect large enough to justify intervention.",
  ],
  [
    "08",
    "Regression, Causal Reasoning and Forecasting",
    "Model relationships, diagnose assumptions, address confounding and make carefully qualified forecasts.",
    "Regression and forecasting report",
    "Defend a forecast while explaining why correlation is not a causal finding.",
  ],
  [
    "09",
    "Experiments, Quasi-Experiments and Modern Evaluation",
    "Design and interpret trials, before-and-after analysis and quasi-experimental approaches for real programmes and services.",
    "Evaluation design and analysis plan",
    "Test a new intervention where randomisation is constrained by operational reality.",
  ],
  [
    "10",
    "Reproducible Statistics with Python or R",
    "Create transparent, repeatable analysis workflows with versioned data, code, documentation and quality checks.",
    "Reproducible statistical notebook",
    "Audit an analysis that cannot be recreated from its published tables.",
  ],
  [
    "11",
    "Bayesian and AI-Era Statistical Judgement",
    "Use prior information, model validation and uncertainty-aware reasoning when working with AI-assisted analysis and predictive tools.",
    "AI and Bayesian evidence assurance note",
    "Challenge a confident AI-generated conclusion that lacks data provenance or uncertainty analysis.",
  ],
  [
    "12",
    "Statistics Capstone and Professional Portfolio",
    "Integrate design, data, analysis, interpretation and communication into a defensible evidence product.",
    "Statistical portfolio and capstone defence",
    "Present a complete evidence case to a technical and non-technical review panel.",
  ],
];

const standards = [
  [
    "QUESTION THE DATA",
    "Modern statistics begins by interrogating how evidence was produced, not by opening a software menu.",
  ],
  [
    "MAKE UNCERTAINTY USEFUL",
    "Confidence, risk and limitations are communicated as decision inputs—not buried in technical footnotes.",
  ],
  [
    "REPRODUCIBLE AND RESPONSIBLE",
    "Every result must be traceable, ethically obtained and robust enough to be challenged or updated.",
  ],
];

export const metadata = {
  title: "Modern Applied Statistics | DatalytIQs Academy",
  description:
    "A twelve-module practical statistics course covering data quality, sampling, inference, regression, experiments, reproducibility and AI-era statistical judgement.",
};

export default function StatisticsProgramme() {
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
            MODERN APPLIED STATISTICS · PROFESSIONAL PATHWAY · VERSION 1.0
          </p>
          <h1>Use evidence with precision, judgement and integrity.</h1>
          <p className="pl-lead">
            A comprehensive practical course for professionals who need to
            design studies, analyse data, quantify uncertainty and defend
            evidence in modern decision environments. It combines classical
            statistical foundations with reproducibility, causal reasoning and
            AI-era statistical judgement.
          </p>
          <div className="pl-actions">
            <a className="pl-primary" href="#programme-modules">
              Explore the pathway
            </a>
            <a className="pl-secondary" href="#assessment">
              Review professional outputs
            </a>
          </div>
        </div>
        <aside className="pl-cycle" aria-label="Statistics evidence cycle">
          <p>THE STATISTICAL EVIDENCE CYCLE</p>
          {[
            "Question",
            "Design",
            "Measure",
            "Analyse",
            "Uncertainty",
            "Decision",
          ].map((step, index) => (
            <div key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{step}</span>
            </div>
          ))}
        </aside>
      </section>
      <section className="pl-facts" aria-label="Programme summary">
        <div>
          <strong>12</strong>
          <span>competency modules</span>
        </div>
        <div>
          <strong>36</strong>
          <span>guided practice sessions</span>
        </div>
        <div>
          <strong>12</strong>
          <span>professional outputs</span>
        </div>
        <div>
          <strong>1</strong>
          <span>defensible evidence portfolio</span>
        </div>
      </section>
      <section className="pl-standards" aria-labelledby="standard-heading">
        <div className="pl-heading">
          <p>STATISTICAL STANDARD</p>
          <h2 id="standard-heading">
            Rigorous enough for technical review. Clear enough for a real
            decision.
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
          <h2 id="modules-heading">The complete applied statistics sequence</h2>
          <span>
            Every module includes realistic data, decision clinics and a
            professional evidence product. The final portfolio demonstrates the
            ability to reason statistically, not merely compute a result.
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
                    <strong>Applied workshop:</strong> work through a realistic
                    statistical problem and make assumptions explicit.
                  </span>
                </li>
                <li>
                  <b>02</b>
                  <span>
                    <strong>Evidence clinic:</strong> {clinic}
                  </span>
                </li>
                <li>
                  <b>03</b>
                  <span>
                    <strong>Professional output:</strong> document methods,
                    results, uncertainty, limits and a decision-relevant
                    interpretation.
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
            Assessment rewards transparent statistical judgement.
          </h2>
          <span>
            Learners are evaluated on research and measurement design,
            analytical correctness, reproducibility, interpretation, ethical
            practice and communication—not formula recall alone.
          </span>
        </div>
        <ol>
          <li>
            <b>20%</b>
            <span>
              <strong>Applied statistical clinics</strong>Method selection,
              assumptions and risk-aware judgement.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Professional evidence outputs</strong>Quality, clarity and
              traceability of twelve statistical artefacts.
            </span>
          </li>
          <li>
            <b>20%</b>
            <span>
              <strong>Peer technical review</strong>Critique of methods, charts,
              claims and reproducibility.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Capstone defence</strong>Defence of a complete,
              decision-ready statistical evidence portfolio.
            </span>
          </li>
        </ol>
      </section>
      <section className="pl-next">
        <p>MODERN APPLIED STATISTICS · VERSION 1.0</p>
        <h2>Numbers are only useful when their uncertainty is understood.</h2>
        <span>
          Built for analysts, researchers, public officers, consultants and
          leaders who need evidence that can withstand scrutiny and improve
          decisions.
        </span>
        <Link className="pl-module-link" href="/login">
          Request enrolment →
        </Link>
      </section>
      <footer>
        <span>Modern Applied Statistics · Version 1.0</span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
