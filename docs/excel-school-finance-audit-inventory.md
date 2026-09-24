# DatalytIQs Excel, school finance and audit pathways — implementation inventory

Status: audited and partially implemented, 24 September 2026. No claim of completed three-course release.

## Existing records and decisions

| Pathway | Existing record | Course URL | Decision |
| --- | --- | --- | --- |
| Advanced Excel for Data Analytics and Financial Management | Earlier Data Analysis in Excel, Tutor ID 997, **Trash** | Historical URL unavailable | Preserve record and any linked progress. Do not restore or create a competing paid course until enrolment, product binding and intended canonical URL are determined. Published DTQ-105/106 and dashboard training remain separate short courses. |
| Excel for School Bursars | Tutor ID 1045, **published**; Woo product 1555, SKU DATALYTIQS-EXCEL-BURSAR-1045, observed KES 4,500 | https://datalytiqsacademy.com/courses/excel-school-bursars-kenya/ | Retain URL, product and current lessons. Original missing-receipt allocation case added to description and verified. Workbook and assessed submission not yet released. |
| Excel for Auditors | No published or draft exact-title course found before creation. New Tutor draft ID 1651, code DTQ-EXCEL-AUDIT-2026 | Admin-only draft: https://datalytiqsacademy.com/?post_type=courses&p=1651 | Twelve topics and 24 lesson scaffolds created; not published, priced or linked to a product. Replace scaffolds with reviewed substantive instruction and tests before release. |

## Original common foundation

Workbook layers: immutable Source, typed Ledger, Checks, Reconciliation, Analysis, Report, and Readme. Each exception should retain a source-row pointer and disposition. Use Excel Tables and structured references for stable ranges; specify a compatibility alternative when XLOOKUP, FILTER, dynamic arrays or Power Query require a newer edition. Teach Power Query refresh and VBA security in explicit desktop/version contexts rather than assuming all learners can use them.

## School bursar case: allocation and bank reconciliation

Fictional aggregate figures: cashbook receipts KES 1,245,000; bank credits KES 1,240,000; a KES 10,000 fee-register reference repeated; a KES 5,000 deposit lacks a student allocation. These deliberately ambiguous clues do **not** justify netting the difference or alleging fraud. Learners must distinguish a timing item, posting error and unresolved receipt through source-supported matching. Mark separately: raw-data custody 20, matching/reconciliation 30, exception reasoning 25, reporting and limitations 15, privacy and audit trail 10.

## Auditor capstone: institutional expenditure

Generate synthetic purchase orders, invoices, approvals, payment rows and bank postings with documented seeded anomalies. Required tests: population completeness, reference uniqueness, amount/date matching, split-payment pattern review, stratified sampling, formula integrity and corroboration plan. The report must classify each observation as data-quality exception, control deficiency, suspected irregularity or substantiated finding based on actual evidence. A spreadsheet flag alone never proves fraud.

## Source and originality register

| Reference | Reviewed scope | Rights boundary |
| --- | --- | --- |
| Bill Jelen and Dwayne K. Dowell, *Excel for Auditors*, Holy Macro! Books/Tickling Keys, 2007, ISBN 1-932802-16-9 | Front matter and table of contents used to identify spreadsheet-auditing topic gaps | Uploaded copy carries a personal licence and prohibits unauthorised reproduction/distribution. No text, examples, data or screenshots imported. |
| Conrad Carlberg, *Excel for Accountants*, CPA911 Publishing, 2007, ISBN 978-1-932925-01-2 | Front matter and table of contents used for spreadsheet accounting topic comparison | Copyright notice prohibits reproduction without permission. No exercise or workbook copied. |
| *Advanced Excel for Chartered Accountants* mentioned in brief | Exact edition/source not matched to a reviewed file | Do not attribute specific material until title and rights are verified. |

## Acceptance gates

1. Inventory course 997 status history, linked product and enrolment before any restore; preserve existing learner outcomes.
2. Enumerate Tutor IDs, lesson content and quizzes for 1045 and draft 1651. Replace generic scaffolds with worked original cases, formulas, answer keys and reviewer checks.
3. Produce synthetic workbook pairs with deterministic expected outputs, data dictionary and rights metadata; validate formulas in compatible Excel editions.
4. Verify instructor-only solutions cannot be downloaded by learners; check actual learner workbook download, submission, feedback and progress.
5. Verify commerce association without changing approved prices, perform a non-charging enrolment test and test mobile/accessibility.
6. Publish the auditor course only after complete content and acceptance. Keep Analytics Lab Python extensions optional and separately tested.
