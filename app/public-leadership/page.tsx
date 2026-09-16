import Link from "next/link";
import "./public-leadership.css";

const weeks = [
  {
    number: "01",
    title: "Lead from the Public Mandate",
    focus:
      "Translate constitutional, statutory and institutional duties into a clear leadership mandate.",
    practice: "Mandate-to-results map",
    activities: [
      "Map the service-delivery mandate and non-negotiable legal duties.",
      "Identify the citizens, teams, oversight bodies and partners affected by a priority decision.",
      "Write a one-page leadership intent statement for a live public problem.",
    ],
  },
  {
    number: "02",
    title: "Diagnose the Real Policy Problem",
    focus:
      "Separate symptoms, assumptions and political noise from an evidence-ready problem definition.",
    practice: "Policy problem diagnostic",
    activities: [
      "Use a problem tree and stakeholder map on a current institutional challenge.",
      "Test the available administrative data, complaints and field evidence.",
      "Frame a decision question that can be answered within the authority and resources available.",
    ],
  },
  {
    number: "03",
    title: "Design Options That Can Be Implemented",
    focus:
      "Develop proportionate policy and management options, including costs, delivery risks and equity effects.",
    practice: "Options appraisal matrix",
    activities: [
      "Generate at least three viable action options, including a do-minimum baseline.",
      "Score feasibility, cost, legality, equity, time and implementation capacity.",
      "Prepare a two-page recommendation for a senior decision-maker.",
    ],
  },
  {
    number: "04",
    title: "Mobilise People, Resources and Trust",
    focus:
      "Lead across departments and interests without losing accountability, integrity or delivery discipline.",
    practice: "Implementation compact",
    activities: [
      "Build a stakeholder engagement and communication plan.",
      "Clarify decision rights, responsibilities, escalation routes and meeting rhythm.",
      "Practise a difficult briefing: resistance, limited budget or conflicting political expectations.",
    ],
  },
  {
    number: "05",
    title: "Use Evidence to Steer Delivery",
    focus:
      "Create a compact performance system that exposes delivery risk early and supports course correction.",
    practice: "Executive delivery dashboard",
    activities: [
      "Set a small set of outcome, output, risk and equity indicators.",
      "Define data sources, owners, reporting cadence and quality checks.",
      "Run a delivery review using a simulated red-amber-green performance pack.",
    ],
  },
  {
    number: "06",
    title: "Make the Decision Stick",
    focus:
      "Convert analysis into an accountable decision, implementation direction and learning commitment.",
    practice: "90-day leadership action plan",
    activities: [
      "Present a policy and implementation brief to a peer review panel.",
      "Defend the evidence, trade-offs, safeguards and expected public value.",
      "Commit to 30-, 60- and 90-day milestones, with a documented learning review.",
    ],
  },
];

const standards = [
  [
    "WORKPLACE FIRST",
    "Every week advances a live workplace challenge chosen by the participant.",
  ],
  [
    "PUBLIC VALUE",
    "Recommendations are tested against legality, equity, affordability and service outcomes.",
  ],
  [
    "DECISION READY",
    "Participants leave with briefs, dashboards and implementation tools they can use immediately.",
  ],
];

export const metadata = {
  title: "Public Leadership and Policy Execution | DatalytIQs Academy",
  description:
    "A practical six-week leadership programme for public officers leading policy, services and institutional change.",
};

export default function PublicLeadershipProgramme() {
  return (
    <main className="pl-page" id="main-content">
      <a className="pl-skip" href="#six-week-programme">
        Skip to six-week programme
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
          <a href="#six-week-programme">Six-week programme</a>
          <a href="#assessment">Assessment</a>
          <Link href="/login">Learner sign-in</Link>
        </nav>
      </header>

      <section className="pl-hero">
        <div>
          <p className="pl-kicker">
            PUBLIC LEADERSHIP AND POLICY EXECUTION · SIX-WEEK PRACTICAL
            PROGRAMME
          </p>
          <h1>Lead decisions that improve public value.</h1>
          <p className="pl-lead">
            A hands-on course for public officers responsible for policy,
            programmes, institutions and frontline services. Participants work
            on a real leadership challenge and leave with the tools to decide,
            deliver, account and learn.
          </p>
          <div className="pl-actions">
            <a className="pl-primary" href="#six-week-programme">
              Explore the six weeks
            </a>
            <a className="pl-secondary" href="#assessment">
              See what you will produce
            </a>
          </div>
        </div>
        <aside
          className="pl-cycle"
          aria-label="Public leadership delivery cycle"
        >
          <p>THE LEADERSHIP CYCLE</p>
          {[
            "Mandate",
            "Problem",
            "Options",
            "Delivery",
            "Evidence",
            "Learning",
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
          <strong>6</strong>
          <span>practical weeks</span>
        </div>
        <div>
          <strong>1</strong>
          <span>live public challenge</span>
        </div>
        <div>
          <strong>6</strong>
          <span>workplace tools</span>
        </div>
        <div>
          <strong>90</strong>
          <span>days of post-course action</span>
        </div>
      </section>

      <section className="pl-standards" aria-labelledby="standard-heading">
        <div className="pl-heading">
          <p>DESIGN STANDARD</p>
          <h2 id="standard-heading">
            Leadership learning that survives the return to the office.
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
        id="six-week-programme"
        className="pl-weeks"
        aria-labelledby="weeks-heading"
      >
        <div className="pl-heading">
          <p>WEEK BY WEEK</p>
          <h2 id="weeks-heading">The practical leadership sequence</h2>
          <span>
            Each week combines a short applied briefing, a facilitated decision
            clinic and fieldwork on the participant&apos;s own institution or
            county context.
          </span>
        </div>
        <div className="pl-week-list">
          {weeks.map((week) => (
            <article className="pl-week" key={week.number}>
              <header>
                <b>{week.number}</b>
                <div>
                  <p>WEEK {week.number}</p>
                  <h3>{week.title}</h3>
                  <span>{week.focus}</span>
                </div>
                <strong>
                  OUTPUT
                  <br />
                  <em>{week.practice}</em>
                </strong>
              </header>
              <ol>
                {week.activities.map((activity, index) => (
                  <li key={activity}>
                    <b>{index + 1}</b>
                    <span>{activity}</span>
                  </li>
                ))}
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
          <p>APPLIED ASSESSMENT</p>
          <h2 id="assessment-heading">
            The course is completed through work that can be used.
          </h2>
          <span>
            There is no final exam detached from practice. Participants
            assemble, test and defend a leadership package addressing a real
            service or policy priority.
          </span>
        </div>
        <ol>
          <li>
            <b>01</b>
            <span>
              <strong>Weekly fieldwork</strong>Six workplace tools completed
              against a live institutional challenge.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Peer decision clinic</strong>Structured feedback on
              evidence, trade-offs, feasibility and public accountability.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Leadership portfolio</strong>Mandate map, diagnostic,
              options appraisal, delivery dashboard and 90-day plan.
            </span>
          </li>
          <li>
            <b>04</b>
            <span>
              <strong>Capstone defence</strong>A concise executive briefing that
              demonstrates a defensible decision and implementation direction.
            </span>
          </li>
        </ol>
      </section>

      <section className="pl-next">
        <p>PUBLIC LEADERSHIP PROGRAMME · VERSION 1.0</p>
        <h2>
          Six weeks. One public challenge. A decision that can be delivered.
        </h2>
        <span>
          Designed for officers in leadership, policy, planning, programme and
          service-delivery roles across national and county institutions.
        </span>
        <Link className="pl-module-link" href="/login">
          Request enrolment →
        </Link>
      </section>
      <footer>
        <span>Public Leadership and Policy Execution · Version 1.0</span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
