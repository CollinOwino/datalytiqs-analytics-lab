import Link from "next/link";
import "../public-leadership/public-leadership.css";

const modules = [
  [
    "01",
    "Executive Role, Mandate and Strategic Direction",
    "Align institutional purpose, legal mandate and stakeholder expectations with a coherent strategic direction.",
    "Executive mandate and strategic alignment map",
    "Resolve a conflict between statutory duties, stakeholder pressure and limited resources.",
  ],
  [
    "02",
    "Strategic Analysis and Priority Setting",
    "Diagnose the operating environment and select the few priorities that deserve executive attention.",
    "Strategic situation and priority brief",
    "Reduce a crowded annual plan to a defensible set of enterprise priorities.",
  ],
  [
    "03",
    "Financial Stewardship and Resource Allocation",
    "Connect budgets, procurement, workforce and assets to results while maintaining value for money and audit readiness.",
    "Resource-allocation challenge paper",
    "Reallocate constrained resources without compromising critical services or controls.",
  ],
  [
    "04",
    "Performance Leadership and Delivery Management",
    "Translate strategy into accountable outcomes, delivery routines and early corrective action.",
    "Executive performance dashboard",
    "Lead a review where reported activity is high but outcomes remain weak.",
  ],
  [
    "05",
    "People, Culture and Organisational Capability",
    "Build an ethical, inclusive and performance-oriented workplace through delegation, coaching and accountability.",
    "Capability and culture intervention plan",
    "Address persistent underperformance while preserving procedural fairness and trust.",
  ],
  [
    "06",
    "Governance, Risk and Institutional Integrity",
    "Integrate governance obligations, enterprise risk, internal control and ethics into executive decisions.",
    "Executive risk and assurance map",
    "Respond to a serious procurement or integrity signal before it becomes a crisis.",
  ],
  [
    "07",
    "Stakeholder Leadership and Strategic Communication",
    "Manage competing interests, communicate difficult decisions and protect institutional credibility.",
    "Stakeholder and communication brief",
    "Brief a board, committee, media panel or citizen forum on a contested decision.",
  ],
  [
    "08",
    "Transformation, Innovation and Executive Legacy",
    "Lead sustainable change, govern digital initiatives and institutionalise learning beyond individual tenure.",
    "100-day performance-improvement plan",
    "Defend a transformation proposal before an executive review panel.",
  ],
];

const competencies = [
  [
    "STRATEGIC JUDGEMENT",
    "Make defensible choices under uncertainty, constraint and competing institutional demands.",
  ],
  [
    "ENTERPRISE STEWARDSHIP",
    "Align finance, people, risk, systems and partnerships with measurable value.",
  ],
  [
    "EXECUTION DISCIPLINE",
    "Turn direction into ownership, milestones, evidence, corrective action and sustained results.",
  ],
];

export const metadata = {
  title: "Senior Management Programme | DatalytIQs Academy",
  description:
    "An eight-week applied executive programme for senior managers leading strategy, resources, people, risk and institutional performance.",
};

export default function SeniorManagementProgramme() {
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
          <a href="#programme-modules">Modules</a>
          <a href="#assessment">Assessment</a>
          <Link href="/login">Executive sign-in</Link>
        </nav>
      </header>

      <section className="pl-hero">
        <div>
          <p className="pl-kicker">
            SENIOR MANAGEMENT PROGRAMME · EXECUTIVE PRACTICE PATHWAY
          </p>
          <h1>Lead the institution, not merely the meeting.</h1>
          <p className="pl-lead">
            An applied eight-week programme for directors, deputy directors,
            heads of department and senior executives responsible for strategy,
            resources, people, governance and measurable institutional
            performance.
          </p>
          <div className="pl-actions">
            <a className="pl-primary" href="#programme-modules">
              Explore the programme
            </a>
            <a className="pl-secondary" href="#assessment">
              Review executive outputs
            </a>
          </div>
        </div>
        <aside
          className="pl-cycle"
          aria-label="Senior management operating system"
        >
          <p>THE EXECUTIVE OPERATING SYSTEM</p>
          {[
            "Direction",
            "Priorities",
            "Resources",
            "People",
            "Risk",
            "Results",
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
          <strong>8</strong>
          <span>applied modules</span>
        </div>
        <div>
          <strong>1</strong>
          <span>institutional challenge</span>
        </div>
        <div>
          <strong>8</strong>
          <span>executive tools</span>
        </div>
        <div>
          <strong>100</strong>
          <span>day action horizon</span>
        </div>
      </section>

      <section className="pl-standards" aria-labelledby="competency-heading">
        <div className="pl-heading">
          <p>EXECUTIVE STANDARD</p>
          <h2 id="competency-heading">
            Capability demonstrated through institutional work.
          </h2>
        </div>
        <div className="pl-standard-grid">
          {competencies.map(([title, text], index) => (
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
          <p>EIGHT-WEEK SEQUENCE</p>
          <h2 id="modules-heading">
            From strategic direction to sustained performance
          </h2>
          <span>
            Each module combines an executive briefing, a realistic decision
            clinic and workplace application to one live institutional
            challenge.
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
                  EXECUTIVE OUTPUT<em>{output}</em>
                </strong>
              </header>
              <ol>
                <li>
                  <b>01</b>
                  <span>
                    <strong>Executive briefing:</strong> essential concepts,
                    obligations and decision frameworks.
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
                    <strong>Workplace application:</strong> produce, test and
                    refine the executive output using institutional evidence.
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
          <p>EXECUTIVE ASSESSMENT</p>
          <h2 id="assessment-heading">
            Assessment follows the work of senior management.
          </h2>
          <span>
            Participants build an integrated performance-improvement portfolio,
            defend their judgement and demonstrate that proposed action is
            lawful, affordable, ethical and executable.
          </span>
        </div>
        <ol>
          <li>
            <b>20%</b>
            <span>
              <strong>Decision clinics</strong>Judgement, evidence use and
              handling of competing interests.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Executive tool portfolio</strong>Quality and workplace
              usability of the eight module outputs.
            </span>
          </li>
          <li>
            <b>20%</b>
            <span>
              <strong>Peer and facilitator review</strong>Leadership
              communication, challenge and revision.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Capstone defence</strong>Presentation and defence of the
              100-day institutional plan.
            </span>
          </li>
        </ol>
      </section>

      <section className="pl-next">
        <p>SENIOR MANAGEMENT PROGRAMME · VERSION 1.0</p>
        <h2>
          Strategic judgement. Institutional stewardship. Disciplined execution.
        </h2>
        <span>
          Designed for senior officers who must integrate policy, budgets,
          people, risk and performance—and remain accountable for the result.
        </span>
        <Link className="pl-module-link" href="/login">
          Request executive enrolment →
        </Link>
      </section>
      <footer>
        <span>Senior Management Programme · Version 1.0</span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
