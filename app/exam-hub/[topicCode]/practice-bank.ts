/** Original, self-check case questions. Scored quiz keys remain server-side. */
export type PracticeItem = { prompt: string; answer: string }

export const practiceBank: Record<string, readonly PracticeItem[]> = {
  '1.0': [
    { prompt: 'A workbook has 1,200 sales rows. A PivotTable reports KES 4.8 million, while SUMIFS on the complete source reports KES 5.1 million. What should you investigate first?', answer: 'Check the PivotTable source range and refresh state, then filters, blank rows and numeric data types. Reconcile the row count and total before presenting either figure.' },
    { prompt: 'Fixed cost is KES 820,000, price is KES 2,500 and variable cost is KES 1,450 per unit. Calculate break-even units.', answer: 'Contribution per unit is KES 1,050. Break-even is 820,000 / 1,050 = 780.95, rounded up to 781 units.' },
    { prompt: 'A lookup returns #N/A for three new product codes. What is the sound control response?', answer: 'Flag and investigate unmapped codes against the controlled product master. Do not replace errors with zero revenue or silently exclude those records.' },
    { prompt: 'What do you record when a two-input Excel data table changes price and volume?', answer: 'Identify the output formula, both input cells, units and baseline, then compare the sensitivity grid with the base model and document the decision threshold.' },
  ],
  '2.0': [
    { prompt: 'A credit team asks for a default prediction but has no definition of default. Which CRISP-DM phase is incomplete?', answer: 'Business understanding. Define the outcome, time horizon, cost of errors and decision before selecting data or a model.' },
    { prompt: 'Describe the difference between a logical and physical model for customer payments.', answer: 'A logical model defines entities, keys and relationships independent of technology; a physical model specifies tables, data types, indexes and implementation constraints.' },
    { prompt: 'A streaming dataset has millions of fast-arriving records but many duplicate IDs. Which of the five Vs raises the primary trust concern?', answer: 'Veracity. Assess duplication, completeness and validity; volume and velocity do not establish reliability.' },
    { prompt: 'Which analysis supports choosing a constrained allocation of limited audit hours?', answer: 'Prescriptive analytics compares feasible actions under capacity and risk constraints; descriptive summaries and predictions can inform its inputs.' },
  ],
  '3.0': [
    { prompt: 'Revenue is KES 10 million and receivables average KES 1.5 million. Estimate receivable days assuming all revenue is credit sales.', answer: '1.5 / 10 × 365 = 54.75, about 55 days. Disclose the credit-sales assumption and use actual credit revenue where available.' },
    { prompt: 'An investment costs KES 100,000 now and pays KES 60,000 at each year-end for two years. Calculate NPV at 10%.', answer: 'NPV = −100,000 + 60,000/1.10 + 60,000/1.10² = approximately KES 4,132.23. Time-zero cost is not discounted again.' },
    { prompt: 'A base-case NPV is positive but a realistic downside reverses it. What must the recommendation disclose?', answer: 'Present both cases, the drivers and likelihood or decision thresholds; do not describe the positive base case as guaranteed value.' },
    { prompt: 'A forecast balances only after an unexplained plug to cash. What is the first integrity check?', answer: 'Reconcile cash movements and linked statements, inspect formula references and assumptions, and identify the missing flow before accepting a balancing figure.' },
  ],
  '4.0': [
    { prompt: 'Budgeted output is 8,000 units at KES 100 variable cost per unit; actual output is 8,600. What is the flexed variable-cost allowance?', answer: 'KES 860,000. Compare actual variable cost with this allowance, not the KES 800,000 static figure, to isolate spending performance.' },
    { prompt: 'An invoice number appears twice for one supplier. Is that sufficient to conclude fraud?', answer: 'No. Confirm whether records are duplicates, credits or legitimate instalments, reconcile purchase order and receipt, and obtain supporting evidence.' },
    { prompt: 'Approved budget is KES 12 million, revised budget KES 10 million, actual spend KES 9 million. Calculate execution against the revised budget.', answer: '90%. Disclose that the denominator is the revised budget for the same period and explain the revision separately.' },
    { prompt: 'A tax workbook uses an outdated rate. How should the model be designed?', answer: 'Keep dated rates and allowances in a controlled assumptions table, separate accounting profit from tax adjustments, and reconcile source periods before estimating liability.' },
  ],
  '5.0': [
    { prompt: 'A predictive model excludes applicants using postcode as a proxy. What review is required?', answer: 'Assess fairness and lawful purpose, test subgroup outcomes, document model limits, and provide meaningful human review and a challenge route.' },
    { prompt: 'A dashboard includes names and national IDs when only regional totals are needed. What should change?', answer: 'Remove unnecessary identifiers, aggregate at the required level and restrict source access and retention under the stated purpose.' },
    { prompt: 'A team wants to replace a governed workbook with a cloud service. Which risks belong in its decision?', answer: 'Evaluate data residency, access, export and recovery, audit logs, contracts, total cost, skills and operational continuity alongside analytical capability.' },
    { prompt: 'A published metric changes after a late data correction. What is the appropriate evidence trail?', answer: 'Record source version, correction reason, approver, recalculation and publication date; preserve prior values and notify affected users.' },
  ],
}

export const assignmentChecklist: Record<string, readonly string[]> = {
  '1.0': ['Controlled workbook with source, assumptions, calculations and output sheets', 'Pivot and independent reconciliation, formula checks, scenario table', 'One-page interpretation with break-even and management recommendation'],
  '2.0': ['CRISP-DM decision brief with success measure and phase deliverables', 'Conceptual, logical and physical model sketches with lifecycle controls', 'Two labelled charts and a justified descriptive, predictive or prescriptive choice'],
  '3.0': ['Common-size and trend statements with reconciled ratios', 'Assumptions-led forecast and time-zero NPV/IRR calculation', 'Base, downside and upside interpretation with recommendation'],
  '4.0': ['Contribution, break-even and flexed budget with variance explanations', 'Auditable duplicate and three-way match exception schedule', 'Tax or public-finance calculation with dated assumptions and limitations'],
  '5.0': ['Use-case and tool suitability assessment with evidence', 'Privacy, fairness, security and retention risk register with owners', 'Implementation decision, monitoring indicators and incident response route'],
}
