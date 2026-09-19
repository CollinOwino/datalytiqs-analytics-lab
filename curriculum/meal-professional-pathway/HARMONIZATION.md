# DatalytIQs MEAL Professional Pathway — harmonization overlay

This overlay harmonizes the existing MERL engineering with professional MEAL terminology while preserving research and analytics as explicit evidence disciplines.

## Naming contract
- Public pathway: Monitoring, Evaluation, Accountability & Learning (MEAL) Professional Pathway.
- Research remains a cross-cutting evidence method, not a deleted competency.
- Existing /merl routes and database identifiers remain stable in this release to avoid breaking learner records.
- New learner-facing copy should use MEAL where the concept includes accountability; technical identifiers may retain MERL until a separately migrated version.

## Competency cycle
1. Diagnose context, stakeholders, information needs and accountability commitments.
2. Design results logic, Theory of Change, indicators and a MEAL plan.
3. Collect proportionate quantitative, qualitative, administrative and feedback evidence.
4. Assure data quality, protection, consent, access and auditability.
5. Analyse and interpret evidence against results, risks, assumptions and equity/disaggregation.
6. Account: close feedback loops, document response/non-response, escalate safeguarding or integrity concerns and communicate back to affected stakeholders.
7. Learn: run structured reflection, identify lessons, test assumptions and maintain a learning agenda.
8. Adapt: convert evidence into a decision/action log with owner, due date, rationale and follow-up measure.
9. Communicate: tailor evidence products for communities, implementers, managers, funders and public decision-makers.

## Mandatory accountability / learning / adaptation evidence
Every applied learner portfolio must contain:
- stakeholder and information-needs map;
- feedback/accountability mechanism specification;
- feedback register or privacy-safe synthetic equivalent;
- response/closure and escalation protocol;
- learning agenda with priority questions and evidence sources;
- pause-and-reflect record;
- adaptation/decision log showing evidence, decision, owner, due date and follow-up;
- communication-back plan;
- ethics, safeguarding, inclusion and data-protection note.

## Human competency rubric
Each dimension is scored 0–3. 0 = absent or unsafe; 1 = emerging; 2 = competent; 3 = strong professional practice.

Dimensions: results and causal logic; measurement and methodological fitness; data quality, ethics, safeguarding and protection; accountability and stakeholder responsiveness; analysis and defensible interpretation; learning and reflection; evidence-to-adaptation / decision use; communication, inclusion and professional integrity.

Critical rules:
- A learner cannot be declared competent with a 0 in integrity/protection or accountability.
- Overall competent threshold: >= 16/24.
- Strong professional practice: >= 20/24 with no dimension below 2.
- Automated completion/quiz gates establish readiness for human review; they do not independently award professional competence.
- Acceptance-test or synthetic learner accounts are excluded from credential issuance.

## Portfolio review workflow
SYSTEM GATES PASSED -> HUMAN REVIEW PENDING -> APPROVED | CHANGES REQUESTED | REJECTED -> CREDENTIAL ELIGIBLE -> ISSUED

Changes requested must include reviewer notes and permit resubmission. Review history must remain auditable; issuance must use the approved review state and a snapshot of evidence/credential metadata.

## Release acceptance
- authenticated learner completes required gates and persistence survives refresh/re-login;
- learner cannot review/approve own portfolio;
- reviewer/admin authorization is enforced server-side and in database policy/RPC;
- acceptance-test account cannot become credential eligible;
- changes-requested -> resubmission -> approved path is tested;
- certificate issuance requires APPROVED review, valid signatories and non-placeholder metadata;
- keyboard/mobile/accessibility regression passes;
- no answer key or sensitive evidence is exposed to the client bundle;
- privacy-safe feedback/accountability artifacts contain no unnecessary personal data.
