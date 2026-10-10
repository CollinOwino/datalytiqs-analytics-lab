# DTQ-101 protected evidence submission — deployment and acceptance

Status: **DRAFT PR — NOT PRODUCTION ACCEPTED**.

## Architecture and ownership

- Academy Tutor LMS course **1049** is mapped to Lab code `DTQ-101`.
- Lab sign-in uses its existing Supabase cookie-based user identity.
- Eligible learners require either an `active` or `completed` row in `tutor_lab_entitlements` for course 1049, or an explicitly provisioned active `practical_course_access` row.
- Instructor permissions are independent: only explicitly assigned `practical_course_reviewers` may review. An instructor may not review their own work.
- Server routes perform entitlement checks on every write. A protected private Supabase Storage bucket holds files. The server issues 60-second evidence links to owners and assigned instructors.
- Evidence is held per authenticated user and submission ID; no credentials are stored in code or the client bundle.
- `practical_submission_events` records state changes. A submitted or graded record cannot be overwritten by the learner; a reviewer may request revision.

## Files and routes

- `/practicals/dtq-101` — assessment brief plus learner submission form when authenticated and entitled.
- `POST /api/practicals/dtq-101/submissions` — same-origin multipart request, save draft/final, three validated documents (1 MB maximum each).
- `GET /api/practicals/dtq-101/evidence?kind=questionnaire|codebook|pilot_note` — owner-only short-lived download.
- `/practicals/dtq-101/review` — assigned instructor review queue.
- `GET /api/practicals/dtq-101/evidence?submission=<UUID>&kind=<kind>` — assigned instructor view of submitted/reviewable evidence.
- `POST /api/practicals/dtq-101/reviews` — four-criterion rubric (40+25+20+15), substantive feedback, grade or revision request.

**Evidence file limits:** only PDF, DOCX, XLSX, CSV, TXT; max 1 MB each; PDF/ZIP signature and UTF-8 checks are basic format validation, not malware scanning. Reviewer workstations must still use safe document-handling practices.

## Secure provisioning — administrator action only

The database migration creates **no learner grants and no instructor assignments**. Do not grant access based only on a claimed identity, matching name or unverified email. Identify the test learner and assigned instructor in both Academy and the Lab before configuring roles.

1. Confirm course 1049 is published and the test learner has an actual Tutor LMS enrolment.
2. Confirm the Lab profile maps to the same learner, and that an active `tutor_lab_entitlements` record for course 1049 has arrived via the existing Tutor/Lab event integration.
3. If the integration is not yet operational, issue a *scoped test access grant* only after independent admin verification of the learner's Academy enrolment. Use the Supabase SQL Editor with a verified Lab UUID:

```sql
insert into public.practical_course_access(user_id,course_code,status)
values ('<VERIFIED_TEST_LEARNER_UUID>','DTQ-101','active')
on conflict (user_id,course_code) do update set status='active';
```

4. Assign a distinct, verified instructor Lab UUID:

```sql
insert into public.practical_course_reviewers(user_id,course_code,active)
values ('<VERIFIED_INSTRUCTOR_UUID>','DTQ-101',true)
on conflict (user_id,course_code) do update set active=true;
```

5. Verify the Vercel **Preview** environment has `NEXT_PUBLIC_SUPABASE_URL`, a public Supabase key and a server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role key in terminal output, client code or GitHub.
6. After verification, test on Preview, then merge only after explicit acceptance. The production domain remains on `main` until merge.

## Acceptance tests (real browser, separate synthetic accounts)

| ID | Actor | Expected outcome |
|---|---|---|
| DTQ-01 | Signed-out visitor | Assessment brief is visible; form replaced by sign-in link. |
| DTQ-02 | Signed-in but unentitled learner | No upload; server POST rejected with 403. |
| DTQ-03 | Verified enrolled learner | Form appears and three file inputs are available. |
| DTQ-04 | Enrolled learner | Save partial draft, reload, verify summary and private evidence links. |
| DTQ-05 | Enrolled learner | Upload remaining documents and submit; server requires all three and 80–3,000 character summary. |
| DTQ-06 | Learner | Refresh/sign out/sign in: submitted record and files persist; submitted record cannot be overwritten. |
| DTQ-07 | Unrelated learner | Cannot obtain another learner's evidence or instructor review queue. |
| DTQ-08 | Assigned instructor | Reads only submitted evidence, gives 4 rubric marks and >30-character feedback. |
| DTQ-09 | Assigned instructor | Cannot grade own work; duplicate review rejected. |
| DTQ-10 | Learner | Reviews grade and feedback after refresh, evidence still available. |
| DTQ-11 | Instructor | Requests revision; learner sees feedback and can upload replacement evidence and resubmit. |
| DTQ-12 | Administrator | RLS enabled on all five new tables, bucket private, trigger RPC not anon-executable, event audit exists. |
| DTQ-13 | QA | Test on mobile and keyboard; confirm failure/retry messages and no content leakage in browser logs. |

**Separate integration gates:** verify Academy quiz completion independently; the new submission API gates on **enrolment**, not quiz completion. Confirm Tutor LMS events genuinely populate Lab entitlements and verify any desired central learning-dashboard progress synchronization before advertising these as implemented.

## Operational rollback

Frontend rollback: do not merge this PR, or revert its merge commit if a future release fails. Data rollback is **not** dropping the schema: disable catalogue access with `update public.practical_course_catalog set enabled=false where course_code='DTQ-101';` after notifying affected instructors. Preserve submitted learner evidence and audit records. Never delete the bucket or tables as an automatic rollback action.
