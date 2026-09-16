import Link from "next/link";
import "../public-leadership/public-leadership.css";

const modules = [
  [
    "01",
    "Executive Mandate for Digital Transformation",
    "Define the institutional problem, intended value, leadership mandate and transformation case.",
    "Digital transformation case for change",
    "Challenge a technology proposal that has no defined service, user or performance problem.",
  ],
  [
    "02",
    "Digital Strategy, Operating Models and Priorities",
    "Translate strategy into a sequenced roadmap with accountable ownership and realistic dependencies.",
    "Digital strategy and transformation roadmap",
    "Choose which initiatives should proceed when every department claims urgency.",
  ],
  [
    "03",
    "Data Systems, Architecture and Interoperability",
    "Understand system landscapes, data flows, integration choices, master data and the practical consequences of silos.",
    "Data systems and interoperability map",
    "Diagnose a failure caused by duplicate records and disconnected systems.",
  ],
  [
    "04",
    "Data Governance, Privacy and Ethical Use",
    "Establish ownership, quality controls, classification, lawful data use and decision accountability.",
    "Data governance and privacy operating model",
    "Resolve a request for sensitive data that has operational value but weak safeguards.",
  ],
  [
    "05",
    "Digital Service Design and User Adoption",
    "Design services around users, workflows, accessibility and feedback rather than internal technology preferences.",
    "Service journey and adoption plan",
    "Redesign a digital service that works technically but is not used by frontline staff or citizens.",
  ],
  [
    "06",
    "Cybersecurity, Resilience and Executive Risk",
    "Govern cyber risk, access, third parties, incident readiness, backup and continuity at executive level.",
    "Cyber resilience and assurance dashboard",
    "Lead the first executive response to a suspected data breach or system outage.",
  ],
  [
    "07",
    "Procurement, Delivery and Benefits Realisation",
    "Commission digital systems with clear requirements, milestones, acceptance criteria, vendor controls and measurable benefits.",
    "Digital delivery and benefits-realisation plan",
    "Intervene in a delayed vendor project without losing control of value, scope or accountability.",
  ],
  [
    "08",
    "Transformation Capstone and 100-Day Execution",
    "Integrate governance, data, people, delivery and risk into an executable transformation programme.",
    "Executive transformation dossier and 100-day plan",
    "Defend a transformation investment and implementation plan before an executive committee.",
  ],
];

const standards = [
  [
    "VALUE BEFORE TECHNOLOGY",
    "The programme begins with services, outcomes and users; digital tools are a means, never the strategy itself.",
  ],
  [
    "GOVERNED BY DESIGN",
    "Data, privacy, cybersecurity, procurement and continuity are built into transformation choices from the start.",
  ],
  [
    "EXECUTABLE CHANGE",
    "Every module produces a decision-ready tool with owners, milestones, risks, evidence and adoption actions.",
  ],
];

export const metadata = {
  title:
    "Digital Transformation and Data Systems for Executives | DatalytIQs Academy",
  description:
    "An applied executive course in digital transformation strategy, data systems, governance, cybersecurity and benefits realisation.",
};

export default function DigitalTransformationProgramme() {
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
            DIGITAL TRANSFORMATION &amp; DATA SYSTEMS FOR EXECUTIVES · VERSION
            1.0
          </p>
          <h1>Lead digital change that improves the institution.</h1>
          <p className="pl-lead">
            An eight-module executive programme for leaders accountable for
            digital services, data systems, modernisation and institutional
            performance. It equips participants to choose, govern and deliver
            technology-enabled change with public value, security and adoption
            at its centre.
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
        <aside className="pl-cycle" aria-label="Digital transformation cycle">
          <p>THE TRANSFORMATION CYCLE</p>
          {[
            "Value",
            "Strategy",
            "Systems",
            "Governance",
            "Adoption",
            "Benefits",
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
          <span>executive modules</span>
        </div>
        <div>
          <strong>1</strong>
          <span>live transformation case</span>
        </div>
        <div>
          <strong>8</strong>
          <span>governance tools</span>
        </div>
        <div>
          <strong>100</strong>
          <span>day execution plan</span>
        </div>
      </section>
      <section className="pl-standards" aria-labelledby="standard-heading">
        <div className="pl-heading">
          <p>EXECUTIVE STANDARD</p>
          <h2 id="standard-heading">
            Digital transformation that can be governed, adopted and sustained.
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
          <p>EXECUTIVE PRACTICE PATHWAY</p>
          <h2 id="modules-heading">The digital transformation sequence</h2>
          <span>
            Each module combines executive guidance, a transformation decision
            clinic and workplace application to an active system, service or
            digital investment challenge.
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
                    <strong>Executive briefing:</strong> governing principles,
                    decision frameworks and accountable roles.
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
                    <strong>Workplace application:</strong> create and refine
                    the executive output using real institutional context.
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
          <p>APPLIED EXECUTIVE ASSESSMENT</p>
          <h2 id="assessment-heading">
            Completion rests on a credible transformation plan.
          </h2>
          <span>
            Participants demonstrate strategic clarity, data and risk
            governance, delivery discipline, user adoption and a transparent
            account of expected benefits.
          </span>
        </div>
        <ol>
          <li>
            <b>20%</b>
            <span>
              <strong>Transformation clinics</strong>Executive judgement under
              operational, security and implementation constraints.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Executive tool portfolio</strong>Quality and use of eight
              transformation and governance outputs.
            </span>
          </li>
          <li>
            <b>20%</b>
            <span>
              <strong>Peer and facilitator review</strong>Challenge assumptions,
              risks, adoption approach and benefits claims.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Capstone defence</strong>Defence of an executable
              transformation dossier and 100-day plan.
            </span>
          </li>
        </ol>
      </section>
      <section className="pl-next">
        <p>
          DIGITAL TRANSFORMATION &amp; DATA SYSTEMS FOR EXECUTIVES · VERSION 1.0
        </p>
        <h2>Modern systems. Trusted data. Better services.</h2>
        <span>
          For leaders who must ensure that digital investment delivers enduring
          institutional capability rather than another unused platform.
        </span>
        <Link className="pl-module-link" href="/login">
          Request executive enrolment →
        </Link>
      </section>
      <footer>
        <span>
          Digital Transformation &amp; Data Systems for Executives · Version 1.0
        </span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
