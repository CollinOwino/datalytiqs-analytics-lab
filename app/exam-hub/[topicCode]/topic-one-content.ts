export const topicOneLessons = [
  {
    code: '1.1',
    title: 'Excel productivity and controlled navigation',
    duration: '35 minutes',
    objectives: [
      'Structure a workbook so inputs, calculations and outputs remain traceable.',
      'Use keyboard navigation and named ranges to reduce avoidable processing errors.',
      'Apply basic workbook controls before beginning analysis.',
    ],
    concepts: [
      ['Workbook architecture', 'Separate source data, assumptions, calculations and reporting into clearly named sheets. Avoid hard-coded values inside formulas.'],
      ['Navigation discipline', 'Use Ctrl + Arrow, Ctrl + Shift + Arrow, Ctrl + Page Up/Page Down and Go To Special to inspect large workbooks efficiently.'],
      ['Control checks', 'Document the data source, reporting period, units, refresh date and reconciliation totals in a visible control sheet.'],
    ],
    workedExample: {
      scenario: 'A monthly sales workbook contains 240 transactions and a separate assumptions sheet.',
      steps: [
        'Convert the transaction range into an Excel Table named SalesData.',
        'Create named cells TaxRate and TargetMargin on the assumptions sheet.',
        'Add control totals for transaction count, total revenue and missing customer IDs.',
        'Use Freeze Panes and consistent number formats before analysis.',
      ],
      formula: '=COUNTBLANK(SalesData[Customer_ID])',
      interpretation: 'A result above zero is an exception that must be resolved or disclosed before analysis.',
    },
    exercise: 'Prepare the supplied sales dataset as a controlled workbook. Record the transaction count, missing-ID count and total revenue on a Control sheet.',
    answerGuide: 'Expected controls: 12 transactions, 0 missing customer IDs and total revenue of KES 958,750.',
  },
  {
    code: '1.2',
    title: 'Analytical tables, pivots and decision functions',
    duration: '55 minutes',
    objectives: [
      'Summarise transactional data with structured references and PivotTables.',
      'Apply SUMIFS, COUNTIFS, XLOOKUP and IFERROR appropriately.',
      'Explain the business meaning of a calculated result rather than merely reporting it.',
    ],
    concepts: [
      ['Conditional aggregation', 'SUMIFS and COUNTIFS answer questions involving defined categories, periods or thresholds.'],
      ['Reference lookups', 'XLOOKUP connects controlled reference data to transactions and provides an explicit not-found response.'],
      ['Pivot analysis', 'PivotTables rapidly compare products, regions and periods; refresh status and source range must be controlled.'],
    ],
    workedExample: {
      scenario: 'Management needs regional revenue and a list of transactions falling below the target margin.',
      steps: [
        'Create a PivotTable with Region in Rows and Revenue in Values.',
        'Use SUMIFS to reproduce one regional total as an independent check.',
        'Retrieve each product target using XLOOKUP.',
        'Create a Margin_Status field using IF to flag exceptions.',
      ],
      formula: '=SUMIFS(SalesData[Revenue],SalesData[Region],A2)',
      interpretation: 'The independently calculated regional total should reconcile exactly to the corresponding PivotTable value.',
    },
    exercise: 'Produce a regional revenue table, identify the highest-revenue region and flag every transaction whose margin is below its target.',
    answerGuide: 'Western leads with KES 330,250. Six transactions fall below their respective target margins.',
  },
  {
    code: '1.3',
    title: 'Advanced formulas and auditable financial models',
    duration: '70 minutes',
    objectives: [
      'Build a driver-based model that separates assumptions from calculations.',
      'Use scenario inputs without overwriting base data.',
      'Apply formula checks and explain the effect of assumptions on outputs.',
    ],
    concepts: [
      ['Driver-based modelling', 'Revenue, variable cost and fixed cost should be calculated from explicit assumptions that can be reviewed independently.'],
      ['Scenario integrity', 'Base, downside and upside assumptions should be stored separately and selected through a controlled input.'],
      ['Auditability', 'Formula consistency, balance checks, protection and documented assumptions make a model defensible.'],
    ],
    workedExample: {
      scenario: 'A proposed service has an expected volume of 1,200 units, price of KES 2,500, variable cost of KES 1,450 and fixed cost of KES 820,000.',
      steps: [
        'Calculate revenue as volume multiplied by price.',
        'Calculate contribution as volume multiplied by price less variable cost.',
        'Deduct fixed cost to obtain operating profit.',
        'Calculate break-even units using fixed cost divided by contribution per unit.',
      ],
      formula: '=Fixed_Cost/(Unit_Price-Variable_Cost)',
      interpretation: 'Break-even volume is 781 units when rounded up; the base forecast therefore provides a 419-unit margin of safety.',
    },
    exercise: 'Use the model template to evaluate a 10% fall in volume and a 6% rise in variable cost. State whether the service remains profitable and identify the more influential risk.',
    answerGuide: 'The service remains profitable under either isolated scenario. The 10% volume fall has the larger adverse effect in the supplied base case.',
  },
] as const

export const topicOneQuiz = [
  { code: 'q1', question: 'The 12-row sales file will feed a management report. Which workbook design keeps its source, rate assumptions and final output traceable?', options: [['a', 'Inputs, calculations and outputs mixed on one sheet'], ['b', 'Separate source, assumptions, calculations and output sheets'], ['c', 'Values pasted over all formulas'], ['d', 'Hidden sheets without documentation']] },
  { code: 'q2', question: 'You must independently reproduce the Western revenue PivotTable total. Which Excel function sums Revenue where Region equals Western?', options: [['a', 'SUMIFS'], ['b', 'COUNTBLANK'], ['c', 'LEFT'], ['d', 'ROUNDUP']] },
  { code: 'q3', question: 'The PivotTable total is lower than the 12-row source total. Why run an independent SUMIFS check before presenting it?', options: [['a', 'To make the workbook larger'], ['b', 'To confirm the source and aggregation are complete'], ['c', 'To remove structured references'], ['d', 'To avoid refreshing the PivotTable']] },
  { code: 'q4', question: 'A reviewer changes a tax-rate assumption in the financial model. Where should this rate live to keep the calculation auditable?', options: [['a', 'Hard-coded in every formula'], ['b', 'In a controlled assumptions cell'], ['c', 'Inside a chart title'], ['d', 'In an unrelated workbook']] },
  { code: 'q5', question: 'The model shows KES 820,000 fixed cost and KES 1,050 contribution per unit. Which formula gives break-even units before rounding up?', options: [['a', 'Fixed cost ÷ contribution per unit'], ['b', 'Revenue ÷ fixed cost'], ['c', 'Variable cost × price'], ['d', 'Profit ÷ volume']] },
] as const

export const topicOneDownloads = [
  { href: '/downloads/ca35p/topic-1/ca35p-topic1-sales-practice.csv', title: 'Sales practice dataset', meta: 'CSV · 12 controlled transactions' },
  { href: '/downloads/ca35p/topic-1/ca35p-topic1-model-template.csv', title: 'Financial model template', meta: 'CSV · assumptions and scenario structure' },
] as const
