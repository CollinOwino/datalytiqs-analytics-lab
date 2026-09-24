# Excel Academy reference and assessment register

Status: curriculum and downloadable practice resources prepared; Tutor LMS publication of new modules and access controls remains pending verification.

## Source-to-competency matrix

| Canonical reference | Overlap and new competencies | Original curriculum application | Handling |
|---|---|---|---|
| *Excel for Accountants*, Conrad Carlberg (2007), ISBN 978-1-932925-01-2 | Lists, filters, PivotTables, common-size statements, charts, scenarios, PMT/PV, depreciation, legacy QuickBooks IIF | Accountants: mapped chart of accounts, statement links, common-size and loan/depreciation model; Auditors: statement comparison | Conceptual reference only. Do not publish book text, examples, screenshots or data. Replace legacy IIF teaching with documented, validated CSV/Power Query import and a controlled chart-of-accounts map. |
| *Excel for Auditors*, Bill Jelen and Dwayne Dowell (2007), ISBN 1-932802-16-9 | Spreadsheet checks, transaction testing, exceptions and auditable evidence | Auditors: preserve source IDs, reconcile invoice/payments, review duplicate combinations, trace findings | Conceptual reference only; original cases and synthetic records. |
| *Advanced Excel Practice Activities* (seven-page legacy document) | Relative/absolute references, PMT, Goal Seek, Scenario Manager, formula tracing, filtering, subtotal, PivotTable, lookup | Advanced: performance dashboard and sensitivity; Accountants: loan scenario; practical task progression | Do not reproduce the distinctive products, tables, wording or data. Historical menu steps modernised. |
| *Cpt Excel Practice Questions* (20-page PDF) | Formatting, SUM/AVERAGE, IF, percentages, charts, fee and salary calculations | School Bursars: fee ledger and reconciliation; beginner exercises in each pathway | Canonical copy `252504100-Cpt-Excel-Practice-Questions.pdf`. Second upload `(1)(1).pdf` has the same 833,626 bytes and SHA-256 `52220c8353c66f1efc285de9e01c5477e0f44f0806422ebed3b4d73c9d327fb5`. Retain both originals in the owner's files; use one curriculum reference. No original question is reproduced. |

### Pathway architecture

| Existing record | Curriculum extension | Integrated capstone |
|---|---|---|
| Advanced Excel: prior broad course 997 is in Trash; do not restore without enrolment/product audit. Existing published DTQ-105, DTQ-106 and DTQ-107 are complementary short courses. | Formulas and references, tables, exact-match lookups, PivotTables, Scenario Manager, Goal Seek, formula tracing and Power Query refresh | Mwangaza County service performance dashboard |
| Excel for Accountants: draft course 1688 created after confirming no existing published or draft exact-title course; no product or price set. | Chart-of-accounts mapping, common-size statements, SLN depreciation, PMT loans, statement and cash-flow reconciliation | Tulia Cooperative integrated financial model |
| Excel for School Bursars: published course 1045; preserve product 1555 and KES 4,500 binding. | Fee registers, bank and receipt reconciliation, payroll checks, budget variance, board reports | Karibu Valley School year-end reconciliation |
| Excel for Auditors: draft course 1651, 12 topics and 24 scaffold lessons; retain draft until lessons and assessment are verified. | Transaction testing, exception investigation, statements, formula integrity and evidence trace | Lakeview Institute risk-based audit |

### Compatibility and modernisation

- Base assessments use SUM, IF, SUMIFS, INDEX/MATCH, PMT, SLN, ordinary references and standard PivotTables where available. Prefer exact-match lookup and explicit missing-key handling.
- XLOOKUP is an optional modern alternative in Microsoft 365 and Excel 2021/2024, not a requirement for Excel 2016/2019. FILTER/UNIQUE dynamic arrays and modern Python-in-Excel features are optional Microsoft 365 enrichment, not the assessed baseline.
- Power Query import/refresh is a guided extension; supported sources and editing vary across Windows, Mac and web. Power Pivot/Data Model is optional and should be assessed only after checking the learner's Excel platform.
- Goal Seek and Scenario Manager are desktop guided activities. A workbook alone cannot demonstrate that a learner operated those Excel commands. Ask for a saved scenario report and annotated evidence.
- In every CSV/Power Query import, preserve an immutable source extract and reconciliation control before transformations. Do not teach macros as a required shortcut.


## Assessment inventory
Four original learner capstones and a separate instructor key are prepared. Tutor LMS resource permissions and learner submission remain release gates.

## Verified implementation update — 24 September 2026

- Accountant pathway: draft Tutor LMS course 1688, six topics and 12 lesson scaffolds. The course is unpublished.
- Auditor pathway: draft Tutor LMS course 1651 now describes a specific original transaction investigation. The course is unpublished.
- School Bursars: existing published course 1045 includes the original Karibu Valley case brief; original product and pricing were left unchanged.
- Assessment files: four learner workbooks and four separate instructor solution workbooks. In each instructor workbook, five calculated controls matched independently recorded expected values, then recalculated after a synthetic source-cell change and returned to the baseline after restoration. Native Excel PivotTable, Goal Seek, desktop cross-version, Tutor download authorization and end-to-end learner journey remain unverified.
- No learner or instructor workbook has been placed in a public WordPress media location. Course-resource delivery requires a confirmed Tutor LMS access-controlled route and role testing.
