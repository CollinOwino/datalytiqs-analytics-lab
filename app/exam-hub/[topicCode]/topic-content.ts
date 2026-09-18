import { topicOneDownloads, topicOneLessons, topicOneQuiz } from './topic-one-content'

export type TopicLesson = {
  code: string
  title: string
  duration: string
  objectives: readonly string[]
  concepts: readonly (readonly [string, string])[]
  workedExample: { scenario: string; steps: readonly string[]; formula: string; interpretation: string }
  exercise: string
  answerGuide: string
}

export type TopicQuizItem = {
  code: string
  question: string
  options: readonly (readonly [string, string])[]
}

export type TopicContent = {
  seoTitle: string
  seoDescription: string
  minutes: number
  lessons: readonly TopicLesson[]
  quiz: readonly TopicQuizItem[]
  downloads: readonly { href: string; title: string; meta: string }[]
  practicalTitle: string
  practicalDescription: string
  rubric: readonly (readonly [string, number])[]
}

const standardRubric = [
  ['Structure, controls and data integrity', 5],
  ['Analytical method and accuracy', 5],
  ['Interpretation of evidence', 5],
  ['Decision recommendation and presentation', 5],
] as const

export const topicContent: Record<string, TopicContent> = {
  '1.0': {
    seoTitle: 'CA35P Topic 1: Introduction to Excel | DatalytIQs Academy',
    seoDescription: 'Master controlled Excel workbooks, analytical tables, advanced formulas and auditable financial models for KASNEB CA35P Business Data Analytics.',
    minutes: 160,
    lessons: topicOneLessons,
    quiz: topicOneQuiz,
    downloads: topicOneDownloads,
    practicalTitle: 'Submit your controlled Excel decision workbook',
    practicalDescription: 'Use the sales dataset or model template. Explain your workbook structure, controls, principal finding and management recommendation.',
    rubric: standardRubric,
  },
  '2.0': {
    seoTitle: 'CA35P Topic 2: Introduction to Data Analytics | DatalytIQs Academy',
    seoDescription: 'Learn CRISP, the data lifecycle, big data, analytics technologies and decision-focused Excel visualisation for CA35P.',
    minutes: 210,
    downloads: [
      { href: '/downloads/ca35p/topic-2/ca35p-topic2-crisp-brief.csv', title: 'CRISP engagement brief', meta: 'CSV · decision, data and lifecycle fields' },
      { href: '/downloads/ca35p/topic-2/ca35p-topic2-visualisation-data.csv', title: 'Visualisation practice data', meta: 'CSV · monthly channel performance' },
    ],
    lessons: [
      { code: '2.1', title: 'CRISP framework and governed data lifecycle', duration: '60 minutes', objectives: ['Translate a management question into CRISP phases and analytical tasks.', 'Distinguish conceptual, logical and physical data models.', 'Specify controls across acquisition, use, retention and disposal.'], concepts: [['CRISP discipline', 'Business understanding anchors the work; data understanding, preparation, modelling, evaluation and deployment must remain traceable to the decision.'], ['Model layers', 'Conceptual models define entities, logical models define relationships and rules, and physical models define implementation.'], ['Lifecycle governance', 'Ownership, lawful purpose, quality, access, retention and disposal controls apply from sourcing to deletion.']], workedExample: { scenario: 'A lender wants to reduce arrears without excluding viable customers.', steps: ['Define the decision and measurable success criterion.', 'Inventory customer, repayment and interaction data.', 'Record quality, privacy and representativeness risks.', 'Specify evaluation and deployment monitoring.'], formula: 'Decision → CRISP phase → evidence → control → accountable owner', interpretation: 'A technically accurate model is not decision-ready unless its purpose, controls and deployment consequences are explicit.' }, exercise: 'Complete the CRISP engagement brief for a school seeking to improve fee collection while protecting vulnerable learners.', answerGuide: 'A strong response defines the decision, identifies payment and learner-context data, addresses missingness and fairness, selects descriptive and predictive outputs, and assigns monitoring controls.' },
      { code: '2.2', title: 'Big data and analytical decision types', duration: '45 minutes', objectives: ['Assess a dataset against the five Vs.', 'Choose descriptive, predictive or prescriptive analysis for a stated decision.'], concepts: [['Five Vs', 'Volume, velocity, variety, veracity and value describe scale and management difficulty rather than quality by themselves.'], ['Descriptive', 'Explains what happened through summaries, patterns and exceptions.'], ['Predictive and prescriptive', 'Prediction estimates likely outcomes; prescription evaluates actions subject to constraints.']], workedExample: { scenario: 'A retailer receives transactions, web events and customer-service messages continuously.', steps: ['Classify volume, velocity and variety.', 'Test veracity using completeness and consistency checks.', 'Describe current abandonment patterns.', 'Predict high-risk sessions and evaluate interventions.'], formula: 'Value = decision benefit − data, model and control cost', interpretation: 'More data is useful only when it improves a defined decision sufficiently to justify its risks and costs.' }, exercise: 'Classify three proposed analyses as descriptive, predictive or prescriptive and justify the input data each needs.', answerGuide: 'Past-sales dashboard is descriptive; default-risk score is predictive; constrained inventory allocation is prescriptive.' },
      { code: '2.3', title: 'Analytics technology and architecture', duration: '45 minutes', objectives: ['Match tools to cleaning, storage, analysis and reporting tasks.', 'Explain when spreadsheet, database, cloud or specialist tooling is proportionate.'], concepts: [['Data preparation', 'Excel or Power Query can support controlled moderate-volume cleaning; scripted pipelines improve repeatability at scale.'], ['Storage', 'Relational databases enforce structure and integrity; object storage supports diverse large files.'], ['Reporting', 'BI platforms distribute governed metrics, while notebooks support exploratory and reproducible analysis.']], workedExample: { scenario: 'An NGO consolidates 30 monthly workbooks from county teams.', steps: ['Standardise a submission schema.', 'Use Power Query for repeatable ingestion.', 'Store validated records in a relational table.', 'Publish governed indicators to a dashboard.'], formula: 'Tool fit = data scale + repeatability + governance + user capability', interpretation: 'The best tool is the least complex option that reliably satisfies scale, auditability and delivery requirements.' }, exercise: 'Design a tool chain for a monthly programme dataset with 50,000 rows, recurring corrections and executive reporting.', answerGuide: 'A defensible design uses controlled templates, automated ingestion/validation, database storage and a governed BI dashboard.' },
      { code: '2.4', title: 'Decision-focused data visualisation in Excel', duration: '60 minutes', objectives: ['Select charts for comparison, trend, composition and relationship.', 'Remove misleading scales, clutter and unsupported precision.', 'Write a decision-led chart title and annotation.'], concepts: [['Chart purpose', 'Bars compare categories, lines show ordered time, scatter plots show relationships and limited-part pie or stacked charts show composition.'], ['Integrity', 'Axes, units, baselines, filters and missing values must be visible and consistent.'], ['Narrative', 'Titles state the finding; annotations explain material changes without overstating causality.']], workedExample: { scenario: 'Monthly conversion falls despite increasing website traffic.', steps: ['Create a line chart for traffic and conversion.', 'Use a secondary axis only if clearly labelled and necessary.', 'Annotate the month the process changed.', 'State association rather than unsupported causation.'], formula: 'Signal-to-noise = decision-relevant ink ÷ total visual ink', interpretation: 'A chart succeeds when a decision-maker can identify the pattern, scale and qualification without verbal rescue.' }, exercise: 'Use the supplied data to produce one comparison chart and one trend chart, then write a two-sentence management interpretation.', answerGuide: 'The answer should use correct chart types, labelled units, consistent periods, restrained formatting and a conclusion tied to the observed values.' },
    ],
    quiz: [
      { code: 'q1', question: 'Which CRISP phase must define the decision and success criterion?', options: [['a','Data preparation'],['b','Business understanding'],['c','Deployment'],['d','Modelling']] },
      { code: 'q2', question: 'Which model describes implementation tables, fields and indexes?', options: [['a','Conceptual'],['b','Logical'],['c','Physical'],['d','Narrative']] },
      { code: 'q3', question: 'Which analysis recommends an action under constraints?', options: [['a','Descriptive'],['b','Diagnostic'],['c','Predictive'],['d','Prescriptive']] },
      { code: 'q4', question: 'Which chart best shows a monthly trend?', options: [['a','Line chart'],['b','Pie chart'],['c','Radar chart'],['d','Single KPI card']] },
      { code: 'q5', question: 'What is the strongest basis for selecting an analytics tool?', options: [['a','Popularity alone'],['b','Highest complexity'],['c','Fit to scale, repeatability, governance and users'],['d','Number of visual effects']] },
    ],
    practicalTitle: 'Submit an analytics engagement and visualisation brief',
    practicalDescription: 'Use the CRISP template and visualisation dataset to define the decision, lifecycle controls, tool chain and two management-ready charts.',
    rubric: standardRubric,
  },
  '3.0': {
    seoTitle: 'CA35P Topic 3: Core Financial Analytics | DatalytIQs Academy',
    seoDescription: 'Practise financial reporting, forecasting, investment appraisal, sensitivity and scenario analytics for CA35P.',
    minutes: 180,
    downloads: [
      { href: '/downloads/ca35p/topic-3/ca35p-topic3-financial-statements.csv', title: 'Financial statements dataset', meta: 'CSV · three-year income and position data' },
      { href: '/downloads/ca35p/topic-3/ca35p-topic3-investment-model.csv', title: 'Investment appraisal template', meta: 'CSV · cash flows and scenario assumptions' },
    ],
    lessons: [
      { code: '3.1', title: 'Financial reporting, ratios and forecasts', duration: '90 minutes', objectives: ['Prepare common-size and trend analysis.', 'Calculate and interpret liquidity, profitability, efficiency and leverage ratios.', 'Build a controlled forecast with explicit assumptions.'], concepts: [['Common-size analysis', 'Express statement lines as percentages of revenue or total assets to compare structure across periods or entities.'], ['Ratio interpretation', 'Ratios become evidence only when benchmarked, trended and connected to operational drivers.'], ['Forecast control', 'Assumptions, formulas, checks and outputs should be separated and reconciled.']], workedExample: { scenario: 'Revenue grows 12% while receivable days rise from 42 to 61.', steps: ['Calculate growth and margin trends.', 'Compute receivable days using average receivables.', 'Forecast cash collection under base and recovery cases.', 'Explain the liquidity implication.'], formula: '=Average_Receivables/Credit_Revenue*365', interpretation: 'Growth is not automatically healthy: deteriorating collection days can weaken cash conversion and increase financing pressure.' }, exercise: 'Analyse the three-year statements, identify two improving and two deteriorating indicators, and prepare a one-year forecast.', answerGuide: 'A complete answer reconciles the statements, shows calculations, distinguishes profitability from liquidity and states assumptions behind the forecast.' },
      { code: '3.2', title: 'Financial management, NPV and scenarios', duration: '90 minutes', objectives: ['Model loan and investment cash flows.', 'Calculate NPV and IRR using correctly timed flows.', 'Test sensitivity and scenario interactions before recommending a decision.'], concepts: [['Time value', 'Cash flows are discounted because timing and risk affect economic value.'], ['Investment appraisal', 'NPV measures value created at the required return; IRR is the discount rate that produces a zero NPV.'], ['Risk analysis', 'Sensitivity changes one driver; scenarios change coherent groups of assumptions.']], workedExample: { scenario: 'A project requires KES 4.5 million and returns KES 1.35 million annually for five years at 12%.', steps: ['Place the initial outflow at time zero.', 'Discount annual inflows at 12%.', 'Calculate NPV and IRR.', 'Test a 10% inflow reduction and a one-year delay.'], formula: '=NPV(12%,Year1:Year5)+Initial_Investment', interpretation: 'A positive base NPV supports acceptance, but the recommendation must disclose whether realistic downside assumptions reverse the result.' }, exercise: 'Use the investment template to calculate NPV, IRR and payback under base, downside and upside scenarios, then recommend an action.', answerGuide: 'The answer must preserve time-zero treatment, use consistent units, identify the binding risk and connect the recommendation to the required return.' },
    ],
    quiz: [
      { code: 'q1', question: 'What denominator is normally used for common-size income-statement analysis?', options: [['a','Revenue'],['b','Total assets'],['c','Closing cash'],['d','Share capital']] },
      { code: 'q2', question: 'Rising receivable days most directly signals what risk?', options: [['a','Faster cash conversion'],['b','Collection and liquidity pressure'],['c','Lower credit exposure'],['d','Automatic profitability growth']] },
      { code: 'q3', question: 'Where should the initial investment appear in an NPV model?', options: [['a','At time zero'],['b','After the final year'],['c','Inside the discount rate'],['d','Only in a chart']] },
      { code: 'q4', question: 'What does a positive NPV indicate?', options: [['a','Guaranteed cash'],['b','Value above the required return under stated assumptions'],['c','Zero risk'],['d','Immediate payback']] },
      { code: 'q5', question: 'How does scenario analysis differ from one-way sensitivity analysis?', options: [['a','It changes coherent groups of assumptions'],['b','It removes assumptions'],['c','It never uses formulas'],['d','It only restates history']] },
    ],
    practicalTitle: 'Submit a financial analytics decision pack',
    practicalDescription: 'Prepare ratio and trend analysis, a controlled forecast, investment appraisal and scenario-based recommendation using the supplied files.',
    rubric: standardRubric,
  },
  '4.0': {
    seoTitle: 'CA35P Topic 4: Specialised Analytics | DatalytIQs Academy',
    seoDescription: 'Apply management accounting, audit, taxation and public-finance analytics in the premium CA35P pathway.',
    minutes: 270,
    downloads: [
      { href: '/downloads/ca35p/topic-4/ca35p-topic4-audit-transactions.csv', title: 'Audit transactions dataset', meta: 'CSV · purchases, receipts and payments' },
      { href: '/downloads/ca35p/topic-4/ca35p-topic4-budget-tax.csv', title: 'Budget and tax practice file', meta: 'CSV · cost, budget and tax drivers' },
    ],
    lessons: [
      { code: '4.1', title: 'Management accounting analytics', duration: '90 minutes', objectives: ['Estimate cost behaviour and contribution.', 'Model break-even, pricing, budgets and variances.', 'Prepare a flexible budget for actual activity.'], concepts: [['Cost behaviour', 'Separate fixed, variable and mixed costs before modelling activity changes.'], ['CVP analysis', 'Contribution and break-even connect volume, price, variable cost and fixed cost.'], ['Budget control', 'Flexible budgets restate allowed cost at actual activity before calculating performance variances.']], workedExample: { scenario: 'Actual output is 8,600 units against a static budget of 8,000 units.', steps: ['Identify fixed and variable budget components.', 'Flex variable costs to 8,600 units.', 'Compare actual cost with the flexible budget.', 'Separate activity and spending effects.'], formula: 'Flexible budget = fixed cost + actual activity × variable rate', interpretation: 'Comparing actual cost directly with a static budget confuses volume effects with operational performance.' }, exercise: 'Prepare a contribution statement, calculate break-even and produce a flexible-budget variance analysis.', answerGuide: 'The answer should reconcile contribution, round break-even units upward and compare actual expenditure with the flexed—not static—budget.' },
      { code: '4.2', title: 'Audit analytics and anomaly testing', duration: '95 minutes', objectives: ['Perform three-way matching and duplicate tests.', 'Identify unusual timing, values and segregation conflicts.', 'Design a defensible sample and evaluate model validity.'], concepts: [['Matching', 'Purchase order, receipt and invoice agreement supports occurrence, quantity and price assertions.'], ['Anomaly detection', 'Duplicates, round amounts, weekend postings and threshold splitting are indicators requiring investigation, not proof of fraud.'], ['Validation', 'Completeness, precision, recall, false positives and drift affect reliance on analytical models.']], workedExample: { scenario: 'An accounts-payable file contains repeated invoice numbers and payments just below approval thresholds.', steps: ['Normalise supplier and invoice identifiers.', 'Flag duplicate supplier-invoice combinations.', 'Compare order, receipt and invoice values.', 'Document exceptions and obtain corroborating evidence.'], formula: '=COUNTIFS(SupplierCol,Supplier,InvoiceCol,Invoice)>1', interpretation: 'Analytics prioritises risk; the auditor still needs evidence, context and professional judgement before concluding.' }, exercise: 'Analyse the audit dataset, quantify duplicate and matching exceptions, and design follow-up procedures for the highest-risk items.', answerGuide: 'A defensible response distinguishes indicators from conclusions, reconciles the population and links each exception class to a specific audit procedure.' },
      { code: '4.3', title: 'Tax and public-finance analytics', duration: '85 minutes', objectives: ['Build transparent tax and wear-and-tear schedules.', 'Analyse budget execution, debt and revenue performance.', 'Present public-finance findings with appropriate context.'], concepts: [['Tax schedules', 'Separate accounting values, tax adjustments, rates, allowances and carried balances.'], ['Budget execution', 'Compare approved, revised, committed and actual amounts using consistent periods and classifications.'], ['Fiscal interpretation', 'Revenue, expenditure, debt and service-delivery measures must be considered together.']], workedExample: { scenario: 'A county records 82% revenue performance and 94% recurrent expenditure absorption.', steps: ['Reconcile approved and revised budgets.', 'Calculate revenue and expenditure performance.', 'Separate recurrent and development execution.', 'Assess implications for cash, arrears and service delivery.'], formula: 'Budget performance % = actual ÷ revised budget × 100', interpretation: 'High expenditure absorption is not necessarily positive when revenue underperforms or development delivery remains weak.' }, exercise: 'Use the practice file to prepare a tax schedule and a public-finance dashboard with three qualified findings.', answerGuide: 'The answer should show transparent tax adjustments, consistent budget denominators and findings that distinguish financial execution from service outcomes.' },
    ],
    quiz: [
      { code: 'q1', question: 'Why is a flexible budget preferable for performance control?', options: [['a','It adjusts allowed variable cost to actual activity'],['b','It hides volume'],['c','It removes fixed costs'],['d','It guarantees favourable variances']] },
      { code: 'q2', question: 'What does a duplicate invoice flag establish?', options: [['a','Fraud conclusively'],['b','An exception requiring investigation'],['c','A valid payment'],['d','A tax liability']] },
      { code: 'q3', question: 'Which three records support three-way matching?', options: [['a','Order, receipt and invoice'],['b','Budget, chart and memo'],['c','Payroll, tax rate and loan'],['d','Forecast, policy and email']] },
      { code: 'q4', question: 'What denominator should budget-performance analysis normally use?', options: [['a','Revised budget for the same period'],['b','Any prior figure'],['c','Closing cash only'],['d','Number of employees']] },
      { code: 'q5', question: 'Why must tax models separate assumptions and adjustments?', options: [['a','To improve transparency and auditability'],['b','To avoid reconciliation'],['c','To remove source documents'],['d','To conceal rates']] },
    ],
    practicalTitle: 'Submit a specialised analytics case file',
    practicalDescription: 'Complete management-accounting, audit-exception and tax/public-finance analyses, then present findings and proportionate actions.',
    rubric: standardRubric,
  },
  '5.0': {
    seoTitle: 'CA35P Topic 5: Emerging Issues in Data Analytics | DatalytIQs Academy',
    seoDescription: 'Evaluate analytics adoption, ethics, data protection, security and tool limitations for responsible CA35P practice.',
    minutes: 165,
    downloads: [
      { href: '/downloads/ca35p/topic-5/ca35p-topic5-risk-register.csv', title: 'Analytics risk register', meta: 'CSV · ethics, security and adoption controls' },
      { href: '/downloads/ca35p/topic-5/ca35p-topic5-tool-assessment.csv', title: 'Tool limitation assessment', meta: 'CSV · capacity and control criteria' },
    ],
    lessons: [
      { code: '5.1', title: 'Adoption challenges and analytical scepticism', duration: '50 minutes', objectives: ['Diagnose organisational barriers to analytics adoption.', 'Distinguish healthy challenge from resistance unsupported by evidence.'], concepts: [['Capability', 'Skills, data literacy, ownership and support determine whether analytical outputs are understood and used.'], ['Trust', 'Transparent methods, stable definitions and reproducible results build confidence.'], ['Change', 'Workflow redesign, incentives and leadership behaviour matter as much as technology.']], workedExample: { scenario: 'Managers continue using manual reports after a dashboard launch.', steps: ['Interview users about decisions and pain points.', 'Compare metric definitions and refresh timing.', 'Identify capability and workflow gaps.', 'Pilot a supported decision meeting using the dashboard.'], formula: 'Adoption = usefulness × trust × capability × workflow fit', interpretation: 'Training alone will not solve adoption when definitions, incentives or decision processes remain misaligned.' }, exercise: 'Prepare an adoption diagnosis and 90-day intervention plan for a low-use analytics platform.', answerGuide: 'A strong plan identifies user decisions, definition disputes, capability needs, workflow integration, ownership and measurable adoption indicators.' },
      { code: '5.2', title: 'Ethics, security and data protection', duration: '65 minutes', objectives: ['Identify purpose, fairness, privacy and accountability risks.', 'Apply access, minimisation, retention and incident controls.', 'Document human oversight for consequential decisions.'], concepts: [['Ethical purpose', 'Legitimate purpose does not remove obligations to test necessity, proportionality and potential harm.'], ['Data protection', 'Collect the minimum necessary data, control access, retain it only as required and support data-subject rights.'], ['Security', 'Layered prevention, detection, response and recovery controls protect confidentiality, integrity and availability.']], workedExample: { scenario: 'An institution proposes using historical learner data to predict dropout risk.', steps: ['Define the supportive intervention purpose.', 'Assess lawful basis, minimisation and sensitive attributes.', 'Test disparate error rates and proxy effects.', 'Require human review, appeal and outcome monitoring.'], formula: 'Responsible use = lawful purpose + minimisation + fairness + security + human accountability', interpretation: 'A beneficial intention does not justify opaque profiling or unchecked automated decisions.' }, exercise: 'Complete the risk register for the learner-risk case and recommend go, conditional go or stop.', answerGuide: 'A defensible conditional-go decision requires limited purpose, access controls, fairness testing, human review, appeal, retention limits and monitored outcomes.' },
      { code: '5.3', title: 'Tool limitations and proportionate controls', duration: '50 minutes', objectives: ['Recognise row, memory, precision, automation and collaboration constraints.', 'Select controls or migration thresholds before failure.'], concepts: [['Capacity', 'Spreadsheet row limits, memory and recalculation costs can undermine reliability before visible failure.'], ['Control', 'Manual steps, broken links, hidden logic and uncontrolled versions weaken reproducibility.'], ['Migration', 'Move to databases, scripts or governed platforms when scale, concurrency or audit requirements exceed the tool.']], workedExample: { scenario: 'A 700,000-row workbook is emailed among six analysts and takes 12 minutes to recalculate.', steps: ['Measure file size, refresh time and failure frequency.', 'Map manual transformations and external links.', 'Define a controlled interim process.', 'Set a migration threshold and target architecture.'], formula: 'Operational risk = likelihood of failure × decision impact', interpretation: 'A tool can produce correct calculations yet remain operationally unfit because control and recovery are inadequate.' }, exercise: 'Assess the supplied tool scenarios and select retain, strengthen controls or migrate for each.', answerGuide: 'Recommendations should reference scale, repeatability, concurrency, security, auditability, cost and user capability rather than fashion.' },
    ],
    quiz: [
      { code: 'q1', question: 'What most strongly supports sustained analytics adoption?', options: [['a','Technology alone'],['b','Usefulness, trust, capability and workflow fit'],['c','Mandatory colour schemes'],['d','More metrics']] },
      { code: 'q2', question: 'What does data minimisation require?', options: [['a','Collect every available field'],['b','Collect only data necessary for the defined purpose'],['c','Retain data forever'],['d','Publish raw identifiers']] },
      { code: 'q3', question: 'What is essential for consequential predictive decisions?', options: [['a','No human involvement'],['b','Human oversight and a challenge route'],['c','Hidden criteria'],['d','Unlimited reuse']] },
      { code: 'q4', question: 'When should an organisation migrate beyond spreadsheets?', options: [['a','When scale, concurrency or control requirements exceed them'],['b','Whenever a chart is needed'],['c','Only after total failure'],['d','Never']] },
      { code: 'q5', question: 'What does a security programme need in addition to prevention?', options: [['a','Detection, response and recovery'],['b','A larger file'],['c','Fewer owners'],['d','Hidden documentation']] },
    ],
    practicalTitle: 'Submit a responsible analytics assurance note',
    practicalDescription: 'Assess adoption, ethical, data-protection, security and tool risks, then recommend controls and a defensible implementation decision.',
    rubric: standardRubric,
  },
}
