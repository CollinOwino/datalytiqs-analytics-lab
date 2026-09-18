# Exam & Competency Hub — Phase 1 Architecture

## Status

The generic data and authorization foundation is implemented. The MVP reference programme is seeded as `KASNEB CA35P - Business Data Analytics (Practical Paper)`, following the confirmed canonical code. The supplied qualifications booklet's `CA36P` identifier is preserved as a source alias for historical traceability.

## Reused platform capabilities

- Supabase Auth is the sole learner identity source.
- The existing organization role model remains authoritative for organization products.
- The Tutor LMS event bridge remains the commerce/enrolment ingestion boundary.
- Existing MERL attempt, evidence and server-side grading patterns informed the hub design.
- The certification master remains the credential issuance service.

## New bounded contexts

| Context | Source of truth |
|---|---|
| Programme catalogue | `exam_bodies`, `exam_programmes` |
| Versioned syllabus | `exam_syllabus_versions`, `exam_topics` |
| Competency map | `exam_competencies`, mapping tables |
| Learner relationship | `exam_enrollments`, `exam_study_plans` |
| Freemium access | `exam_access_grants`, `can_access_exam_topic()` |
| Assessment content | public question metadata + private answer keys |
| Evidence history | append-only attempts, responses and competency evidence |
| Adaptive guidance | `exam_recommendations` |
| Applied work | `exam_practical_submissions` |

## Security invariants

1. The first `free_topic_limit` top-level topic positions are free; later topics require an active full or topic grant.
2. Topic authorization is evaluated in the database, not inferred from hidden UI elements.
3. Answer keys and rubrics are stored in the non-exposed `private` schema and are revoked from browser roles.
4. Learner rows are owner-scoped with RLS. Staff scope is explicit per programme.
5. Published syllabus versions are immutable. Corrections require a new version, preserving attempt history.
6. Attempt, response and evidence tables expose no browser UPDATE or DELETE privileges.
7. Payment providers never become an authorization source directly; verified commerce events create or revoke access grants.

## Reference programme controls

- The programme and a source-record syllabus version are seeded in `draft` state.
- The source PDF checksum and page reference are retained in metadata.
- No topics or learning outcomes are inferred from the qualifications booklet.
- Publication remains blocked until the detailed official syllabus is acquired and checksummed.

## CA35P syllabus and assessment blueprint

- The provisional syllabus is captured as a checksummed draft version with five domains and fifteen subtopics.
- Six assessable competency domains map directly to the published learning outcomes.
- The current mock blueprint records the aggregate 2024-2026 structure: 20 one-mark MCQs, three compulsory 20-mark practicals, and one 20-mark specialisation practical selected from two.
- Historical question text is not imported. The production question bank must contain original DatalytIQs items with documented provenance.

## Deferred content production

- Tutor/WooCommerce product-to-programme mapping for the confirmed code.
- Original diagnostic, topic-practice, practical and mock questions with rubrics.

## Next implementation slice

Add transactional enrolment/study-plan RPCs, connect verified Tutor events to grants, build the learner programme shell, and begin original question/rubric production against the approved blueprint.
