# Data Science — Beginner to Advanced: evidence-led upgrade register

Status: curriculum design and source register, 24 September 2026. Existing Tutor LMS course 1040 is published at https://datalytiqsacademy.com/courses/data-science-beginner-to-advanced/. The new case orientation on the course page is published; the twelve-module pathway, files, labs, submissions and rubrics below are a development specification, not available course activities.

## Existing-course audit

- Reuse course 1040, title, permalink and existing learner records. Do not create a duplicate.
- Its published description presents a ten-step learning route and a six-topic Tutor curriculum summary: workflow, acquisition, cleaning/EDA, statistical reasoning, machine learning/responsible practice, and professional evidence. The full underlying lesson tree, enrolment counts and per-learner progress have not been independently enumerated.
- Tutor LMS 4.0.9 is detected; course-specific product metadata and payment binding were not exposed by the read-only course endpoint and remain unverified.
- The published page now includes an original fictional service-queue decision exercise, three depth levels and explicit labels separating available Tutor activities from the development roadmap.
- Analytics Lab submission, identity sync, execution isolation and instructor marking for this course remain unverified. Do not link to an unverified submission endpoint or claim a portfolio credential.

## Competency and evidence matrix (development specification)

| Stage | Competency | Original evidence | Assessment and gate |
| --- | --- | --- | --- |
| 1. Frame the decision | Questions, units, baselines, lifecycle and responsible scope | Fictional service-centre decision memo | Instructor checks question, measure and limitation |
| 2. Build Python toolkit | Environments, functions, debugging, versioned notebooks | Reusable validation and reporting package | Run tests and explain reproducibility |
| 3. Acquire data | CSV/Excel/JSON, SQL, API provenance and lawful collection | Synthetic institution data dictionary and ingestion log | Schema and source audit |
| 4. Repair evidence | Missingness, duplicates, outliers, transformation ledger | Reproducible cleaning notebook on synthetic records | Before/after checks and audit trail |
| 5. Explore and explain | Distributions, descriptive statistics and chart choices | EDA report and accessible chart captions | Instructor evaluates interpretation and caveats |
| 6. Infer carefully | Sampling, uncertainty, intervals and testing | Fictional training evaluation report | Assumptions, effect and uncertainty rubric |
| 7. Predict responsibly | Leakage-safe splits, regression/classification, validation | Documented baseline model | Holdout integrity and error analysis |
| 8. Compare models | Trees, ensembles, SVM and tuning | Model-comparison memo | Same data splits, metrics and cost discussion |
| 9. Find patterns | Clustering and dimensionality reduction | Synthetic service-segmentation note | Stability and usefulness review |
| 10. Interpret text | Text preparation, classification and thematic analysis | Fictional service-feedback thematic report | Human review of coding and bias |
| 11. Communicate and automate | Dashboard, report generation and deployment basics | Management dashboard and decision brief | Accessibility, reproducibility and audience fit |
| 12. Audit professional practice | Privacy, consent, fairness, explainability and security | Ethical impact and model-limitation review | Instructor judgement required |
| Capstone | Integrated evidence-to-decision practice | Technical report, code, figures, executive presentation | Five-dimension rubric below |

Each stage should offer Foundations (guided), Practitioner (independent) and Advanced (sensitivity or model comparison) tasks only after prerequisites are met. Separate automated syntax/data checks from instructor assessment of interpretation.

## Original case library specification

| Case | Synthetic problem | Required artefacts |
| --- | --- | --- |
| Education | Fictional school attendance summaries with changing term definitions | Brief, generated aggregate CSV, dictionary, notebook, challenge, answer key, rubric, reporting template |
| Civil registration | Fictional service queue and turnaround times with a mid-period definition change | Same seven artefacts; no real citizen records |
| Healthcare administration | Fictional appointment capacity and missed visits | Same seven artefacts; no patient data |
| Agriculture | Fictional seasonal crop service requests and rainfall summaries | Same seven artefacts |
| Business operations | Fictional inventory delays and reorder decisions | Same seven artefacts |
| Monitoring and evaluation | Fictional training intervention with allocation and missing follow-up | Same seven artefacts |

These datasets and files are specified, not yet generated or released. Review bias and re-identification risk before publication.

## Capstone: The DatalytIQs Evidence-to-Decision Challenge

A fictional county service unit must decide whether to change staffing or appointment scheduling. The supplied synthetic data will deliberately include a revised outcome definition, duplicates and missing time stamps. Learners must register questions and decisions, preserve raw inputs, document cleaning, produce descriptive and uncertainty analysis, justify whether prediction adds value, evaluate limitations, and present a management brief. Deliverables: reproducible code, technical report, annotated visuals and a concise executive presentation.

Rubric, 100 points: technical correctness 25; reproducibility and custody 20; statistical interpretation and limitations 25; communication 15; responsible data practice 15. Passing any automated check does not replace instructor review.

## Reference and originality register

| Source | Technical concepts considered | Independent DatalytIQs work | Reuse restriction |
| --- | --- | --- | --- |
| Nathan George, *Practical Data Science with Python*, Packt, 2021, ISBN 978-1-80107-197-0 | Broad toolkit and workflow gap check, including project methodology and data-science skills | Fictional Kenyan institutional cases, original learning sequence, assessment prompts, rubrics and prose | No book prose, code, exercises, images, distinctive data or chapter structure copied. The supplied edition's copyright page reserves reproduction rights. |

A concept is not a licence to reuse the book's expression. Source code, supplementary files and images must be separately licensed before inclusion. All released cases should have an author, reviewer, version, dataset provenance and rights field.

## Release gates

1. Inventory actual Tutor lesson and quiz IDs, enrolment state, product binding and assessment results before reorganising existing material.
2. Build and peer-review each original case's seven artefacts. Run notebook outputs against seeded expected values.
3. Connect a tested Lab exercise to course and identity; verify row isolation and execution sandbox.
4. Test submission, feedback, progress persistence and paid enrolment with synthetic accounts.
5. Check mobile, keyboard, captions, colour contrast and downloads; record instructor sign-off.
6. Release incrementally through existing course 1040 while preserving its URL and progress. Do not claim the capstone or credential until gates pass.
