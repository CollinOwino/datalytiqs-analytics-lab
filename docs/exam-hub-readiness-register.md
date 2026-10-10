# DatalytIQs Professional Exam Hub — Readiness Register

Last verified: 2026-10-04

This register separates catalogue presence, official-source verification, content development, technical acceptance and production readiness. A paper is not production-ready merely because it appears in the catalogue.

| Component / paper | Current state | Target state | Implemented | Tested | Blocker / remaining gate | Remediation / next execution | Owner | Evidence | Go-live |
|---|---|---|---|---|---|---|---|---|---|
| Exam Hub catalogue | Production | Reusable professional catalogue | Yes | Production HTTP 200 | None for catalogue layer | Continue content waves | DatalytIQs | PR #57; production deployment b2454888 | LIVE |
| CA35P Business Data Analytics | Production reference | Full theory + practical + mock + readiness | Yes | Production HTTP 200; existing assessment engine retained | Continue periodic regression | DatalytIQs | Academy course 1522; /exam-hub/ca35p | LIVE |
| DD31 Python Data Visualisation | Content in development | Full verified preparation pathway | Catalogue + reusable shell | Generic production route HTTP 200 | Current detailed official syllabus/assessment blueprint not yet verified in implementation | Verify current official syllabus, then build lessons, Python labs, rubric, question bank and mock | DatalytIQs | Current KASNEB DDMA structure + CBE listing | NOT LIVE AS FULL COURSE |
| DD32 Data Management and Analytics | Content in development | Full verified preparation pathway | Catalogue + reusable shell | Catalogue route architecture tested | Current detailed official syllabus must be reconciled with available official historical syllabus | Verify current syllabus before activating topic map; then build R/analytics practicals and mocks | DatalytIQs | Current KASNEB DDMA structure; official 2021 DDMA syllabus retained as historical reference | NOT LIVE AS FULL COURSE |
| DD24 Quantitative Modelling Skills | Content in development | Full verified preparation pathway | Catalogue + reusable shell | Catalogue route architecture tested | Detailed current official syllabus not yet verified | Verify current syllabus; build staged quantitative modelling workflow, datasets, calculations and interpretation tasks | DatalytIQs | Current KASNEB DDMA structure + current timetable/CBE identity | NOT LIVE AS FULL COURSE |
| CA15 Quantitative Analysis | Content in development | Full verified preparation pathway | Catalogue + reusable shell | Catalogue route architecture tested | Current detailed syllabus confirmation required before publishing topic map | Reconcile current paper against official detailed syllabus; build worked problems, spreadsheet practice and timed mocks | DatalytIQs | Current CPA structure; official 2021 detailed syllabus retained as reference | NOT LIVE AS FULL COURSE |
| CA23 Financial Reporting and Analysis | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed official syllabus and exam structure | Verify then implement Wave 2 | DatalytIQs | Current KASNEB CPA structure | PLANNED |
| CA25 Management Accounting | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed official syllabus and exam structure | Verify then implement Wave 2 | DatalytIQs | Current KASNEB CPA structure | PLANNED |
| CA33 Advanced Financial Management | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed official syllabus and exam structure | Verify then implement Wave 2 | DatalytIQs | Current KASNEB CPA structure | PLANNED |
| CA34S3 Advanced Management Accounting | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed official syllabus and exam structure | Verify then implement Wave 2 | DatalytIQs | Current KASNEB CPA structure | PLANNED |
| DD21 Database | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed current official syllabus | Verify then implement Wave 2 | DatalytIQs | Current KASNEB DDMA structure | PLANNED |
| DD22 Warehousing and Data Mining | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed current official syllabus | Verify then implement Wave 2 | DatalytIQs | Current KASNEB DDMA structure | PLANNED |
| DD23 Mathematical Concepts in Data Science | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed current official syllabus | Verify then implement Wave 2 | DatalytIQs | Current KASNEB DDMA structure | PLANNED |
| DD33 Cloud Data Solutions | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed current official syllabus | Verify then implement Wave 2 | DatalytIQs | Current KASNEB DDMA structure | PLANNED |
| CQP106 Quantitative Skills and Data Analytics | Syllabus verification pending | Production preparation pathway | Catalogue only | Catalogue layer | Detailed current official syllabus and exam structure | Verify official CQP curriculum then implement Wave 2 | DatalytIQs | Official KASNEB CQP curriculum identity | PLANNED |

## Release controls

- Official examining-body metadata and DatalytIQs-developed preparation content remain distinct.
- No syllabus topic is labelled official unless supported by an authoritative examining-body source.
- Catalogue inclusion is not equivalent to course readiness.
- Existing CA35P learner records, attempts, evidence, entitlements and certification controls are preserved.
- Privileged Supabase service-role configuration remains production-only; it was not broadened to preview environments merely to bypass acceptance.
- Production releases require build success plus route-level runtime verification.
- Synthetic acceptance evidence must never be treated as certification evidence or real learner analytics.

## Current execution priority

1. Verify current detailed official syllabus/assessment requirements for DD31, DD32, DD24 and CA15.
2. Build source-to-competency maps only from verified official requirements.
3. Create substantive DatalytIQs teaching material, original question banks, practical tasks and rubrics.
4. Bind theory to Academy and practical evidence to Analytics Lab without duplicate courses.
5. Activate mock/readiness status only after content, scoring, access-control and end-to-end acceptance gates pass.
