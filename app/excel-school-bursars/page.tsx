import Link from "next/link";
import "../public-leadership/public-leadership.css";

const modules = [
  [
    "01",
    "Excel Foundations for the School Bursar",
    "Set up secure, well-structured workbooks, controlled data-entry sheets, formulas and printable reports for a Kenyan school office.",
    "School finance workbook foundation",
    "Recover a hand-edited workbook with inconsistent dates, totals and sheet names.",
  ],
  [
    "02",
    "School Fees, Arrears and Receipting Analysis",
    "Track fee balances, payment plans, arrears, waivers and collection performance without replacing official receipts or records.",
    "Fees and arrears control workbook",
    "Prepare a defensible arrears list that distinguishes unpaid balances from data-entry errors.",
  ],
  [
    "03",
    "Capitation, Grants and Restricted Funds",
    "Monitor expected and received public funds, donor support and restricted allocations using separate, traceable controls.",
    "Capitation and restricted-funds tracker",
    "Reconcile an announced disbursement against the amount actually credited and allocated.",
  ],
  [
    "04",
    "Cashbooks, Vouchers and Bank Reconciliation",
    "Use Excel to support cashbook control, payment-voucher tracking, bank reconciliation and exception follow-up.",
    "Cashbook and bank-reconciliation pack",
    "Investigate a reconciliation difference without posting unsupported adjustments.",
  ],
  [
    "05",
    "Budgeting, Vote Books and Commitment Control",
    "Build term and annual budgets, monitor vote balances, commitments, variances and cash-flow risk.",
    "Budget, vote-book and variance workbook",
    "Advise management when approved activities exceed available cash or vote provision.",
  ],
  [
    "06",
    "Procurement, Suppliers and Payment Controls",
    "Maintain supplier, quotation, order, delivery and payment registers that support transparent procurement and verification.",
    "Procurement and supplier-control register",
    "Identify gaps in a payment trail before a supplier invoice is processed.",
  ],
  [
    "07",
    "Payroll Support, Staff Claims and Statutory Records",
    "Create controlled schedules for payroll support, casual labour, staff claims and statutory obligations while protecting confidential data.",
    "Payroll-support and claims-control schedule",
    "Review an overtime or casual-worker claim for duplicates, approvals and supporting evidence.",
  ],
  [
    "08",
    "Stores, Assets and School Inventory",
    "Track stock movement, assets, custodians, verification dates, reorder risks and variances between records and physical counts.",
    "Stores and asset-register workbook",
    "Reconcile a physical stock count with records and document unexplained variances.",
  ],
  [
    "09",
    "Management Reports, Dashboards and Board Packs",
    "Produce concise financial dashboards for the principal and Board of Management, showing revenue, expenditure, arrears, risks and actions.",
    "Bursar management dashboard and board pack",
    "Explain why a school may look financially healthy while facing a near-term cash-flow problem.",
  ],
  [
    "10",
    "Audit Readiness, Data Protection and Bursar Capstone",
    "Organise electronic audit evidence, maintain document trails, protect financial information and present a complete school-finance control system.",
    "Audit-ready bursar workbook portfolio",
    "Defend the integrity, limitations and control safeguards of a school financial report.",
  ],
];

const standards = [
  [
    "CONTROL BEFORE CONVENIENCE",
    "Excel supports authorised school records and controls; it never substitutes receipts, approvals, vouchers, bank statements or statutory processes.",
  ],
  [
    "AUDIT TRAIL BY DESIGN",
    "Every practical workbook is built with source references, preparer checks, review fields and transparent calculations.",
  ],
  [
    "REPORT FOR ACTION",
    "The principal and Board of Management receive concise, reconciled information on cash, commitments, arrears, risks and next decisions.",
  ],
];

export const metadata = {
  title: "Comprehensive Excel for School Bursars Kenya | DatalytIQs Academy",
  description:
    "A practical Kenya-focused Excel course for school bursars covering fees, capitation, cashbooks, budgets, procurement, payroll support, assets, audit readiness and Board reporting.",
};

export default function SchoolBursarsExcelProgramme() {
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
          <a href="#programme-modules">Course modules</a>
          <a href="#assessment">Assessment</a>
          <Link href="/login">Learner sign-in</Link>
        </nav>
      </header>
      <section className="pl-hero">
        <div>
          <p className="pl-kicker">
            COMPREHENSIVE EXCEL FOR SCHOOL BURSARS · KENYA · VERSION 1.0
          </p>
          <h1>
            Stronger school finance control, one reliable workbook at a time.
          </h1>
          <p className="pl-lead">
            A practical Kenya-focused Excel programme for school bursars,
            accounts staff, principals and finance committee members. Build
            secure working tools for fee records, capitation, cashbooks,
            budgets, procurement, payroll support, stores, audit evidence and
            Board reporting.
          </p>
          <div className="pl-actions">
            <a className="pl-primary" href="#programme-modules">
              Explore the course
            </a>
            <a className="pl-secondary" href="#assessment">
              Review practical outputs
            </a>
          </div>
        </div>
        <aside className="pl-cycle" aria-label="School finance control cycle">
          <p>THE SCHOOL FINANCE CYCLE</p>
          {[
            "Receive",
            "Record",
            "Authorise",
            "Reconcile",
            "Report",
            "Account",
          ].map((step, index) => (
            <div key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{step}</span>
            </div>
          ))}
        </aside>
      </section>
      <section className="pl-facts" aria-label="Course summary">
        <div>
          <strong>10</strong>
          <span>practical modules</span>
        </div>
        <div>
          <strong>30</strong>
          <span>guided workbook sessions</span>
        </div>
        <div>
          <strong>10</strong>
          <span>finance-control tools</span>
        </div>
        <div>
          <strong>1</strong>
          <span>audit-ready portfolio</span>
        </div>
      </section>
      <section className="pl-standards" aria-labelledby="standard-heading">
        <div className="pl-heading">
          <p>WORKBOOK STANDARD</p>
          <h2 id="standard-heading">
            Built for school control, accountability and usable reporting.
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
          <p>DAILY CONTROL → BOARD REPORTING</p>
          <h2 id="modules-heading">The complete bursar Excel sequence</h2>
          <span>
            Each module uses realistic school-finance scenarios and produces a
            workbook or report that can be adapted to the institution&apos;s
            approved processes, records and policies.
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
                  PRACTICAL OUTPUT<em>{output}</em>
                </strong>
              </header>
              <ol>
                <li>
                  <b>01</b>
                  <span>
                    <strong>Guided workbook build:</strong> construct validated
                    tables, protected formulas, controls and report views.
                  </span>
                </li>
                <li>
                  <b>02</b>
                  <span>
                    <strong>Finance-control clinic:</strong> {clinic}
                  </span>
                </li>
                <li>
                  <b>03</b>
                  <span>
                    <strong>Workplace application:</strong> adapt the tool to
                    approved school processes and document the review trail.
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
          <p>PRACTICAL ASSESSMENT</p>
          <h2 id="assessment-heading">
            Completion demonstrates control, not only formula knowledge.
          </h2>
          <span>
            Participants must produce checked, traceable workbooks and explain
            the controls, source documents, approvals, limitations and actions
            required when figures do not reconcile.
          </span>
        </div>
        <ol>
          <li>
            <b>25%</b>
            <span>
              <strong>Workbook practice</strong>Formula accuracy, structure,
              validation and control discipline.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Finance-control portfolio</strong>Ten usable school
              finance tools, each with a clear purpose and review trail.
            </span>
          </li>
          <li>
            <b>15%</b>
            <span>
              <strong>Peer review</strong>Test another participant&apos;s
              workbook for data-quality, control and reporting risks.
            </span>
          </li>
          <li>
            <b>30%</b>
            <span>
              <strong>Capstone defence</strong>Present an audit-ready school
              finance-control pack to a simulated management or Board review.
            </span>
          </li>
        </ol>
      </section>
      <section className="pl-next">
        <p>COMPREHENSIVE EXCEL FOR SCHOOL BURSARS · KENYA · VERSION 1.0</p>
        <h2>Better records. Stronger controls. Clearer school decisions.</h2>
        <span>
          Designed to complement—not replace—official Ministry, Board, banking,
          procurement, audit and statutory requirements applicable to each
          school.
        </span>
        <Link className="pl-module-link" href="/login">
          Request enrolment →
        </Link>
      </section>
      <footer>
        <span>Comprehensive Excel for School Bursars Kenya · Version 1.0</span>
        <Link href="/">DatalytIQs Academy</Link>
      </footer>
    </main>
  );
}
