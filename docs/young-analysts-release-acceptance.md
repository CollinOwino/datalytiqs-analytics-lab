# Young Analysts Release Candidate Acceptance Gate

Branch: `feat/young-analysts-shell`

Do not merge to `main` until the Vercel Preview deployment is READY and every required gate below passes.

## Build and routes
- Next.js production build completes without TypeScript, JSX, CSS import or route errors.
- `/young-analysts` renders.
- `/young-analysts/schools` renders.
- Preview routes render: institution, club, cohort, instructor, learner and guardian.
- No route exposes real child, guardian or school records.

## Safeguarding and data boundaries
- All preview identities and metrics are visibly labelled synthetic.
- Learner work is not presented as public.
- Cohort signals are instructional, not public rankings.
- Guardian view states that production access is relationship-gated.
- No unrestricted messaging or unnecessary behavioural surveillance is introduced.
- Public marketing routes remain distinct from role-specific workspace concepts.

## Accessibility and responsive QA
- Keyboard focus is visible on interactive controls.
- Skip-to-content works.
- Navigation landmarks have accessible labels.
- Cohort roster uses a semantic table with labelled progress elements.
- Mobile layouts at narrow widths remain readable without clipping critical actions.
- Reduced-motion preference is respected.
- Text/background contrast is checked in rendered Preview.

## Functional acceptance
- Public calls to action point only to implemented routes.
- Planned products remain visibly marked PLANNED and are not represented as purchasable/live.
- Synthetic institution totals reconcile with the synthetic roster and challenge fixtures.
- Instructor attention signals derive from fixture data.
- Refreshing each Preview route preserves deterministic fixture content.

## Security review
- No secrets, service-role keys, tokens or credentials are present in client code.
- No child/guardian PII is committed.
- No privileged mutation endpoint is added by this release candidate.
- Authentication/authorization claims are not treated as implemented until separately tested.

## Merge gate
Only merge after: Preview READY → route smoke test PASS → mobile/accessibility PASS → security review PASS.
