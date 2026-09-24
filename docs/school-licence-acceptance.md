# School licence acceptance register · 2026-09-24

## Approved terms and draft catalog state

| SKU | WooCommerce ID | Learners | Annual KES | Status |
| --- | ---: | ---: | ---: | --- |
| DTQ-SCHOOL-STARTER-25 | 1644 | 25 | 30,000 | draft, virtual |
| DTQ-SCHOOL-GROWTH-50 | 1645 | 50 | 50,000 | draft, virtual |
| DTQ-SCHOOL-PLUS-100 | 1646 | 100 | 85,000 | draft, virtual |
| DTQ-SCHOOL-INSTITUTIONAL-250 | 1647 | 250 | 175,000 | draft, virtual |

All plans run for one paid year, renew via manual invoice, and grant existing learners a 30-day grace period. The draft Academy programme page (1643) reflects these prices. No product has a live checkout. The version-controlled SKU mapping and boundary rules live in `lib/schools/licensing.ts`; four `node --test` checks pass, as does `npm run build`.

## Order-to-access contract to implement before publication

1. Attach an approved school application and adult administrator identity to a single WooCommerce order. Never infer the institution from the purchaser's self-editable metadata or a browser callback.
2. A server-to-server signed event must identify the order and line-item SKU. On receipt, fetch the current order through trusted WooCommerce server credentials, verify `completed` and paid amount/currency, validate the product SKU and invoice approval, and record an immutable order event. Webhook retries must be idempotent.
3. In one database transaction, activate/extend the school's paid period and cap, record the WooCommerce order ID and SKU, and bind already verified staff. Ignore duplicate or out-of-order events; on refund/cancellation, revoke or flag a manual review according to the school's terms.
4. Allow only an authorised school administrator/coordinator to invite a learner, and require guardian verification before a minor's school-linked account gains paid access. An atomic capacity check must count active learners across all cohorts in that school, not per cohort; prevent simultaneous requests from admitting an extra learner.
5. Existing learners retain paid access during grace; new admissions stop. At the exclusive end of the thirtieth grace day, paid access ends while the Python for Kids Modules 1–3 remain free. Invoiced renewal only extends access after verified payment.
6. Community space provisioning must be explicit, private and school-specific. No public project access, cross-school roster, broad invitation link or automatic minor membership. Instructor resources and learner submissions need distinct permissions and moderator review.

## Verified now / unverified gates

- PASS: Four distinct draft products re-read as KES 30,000/50,000/85,000/175,000 and capacities stated in descriptions.
- PASS: Pure licence rules cover cap boundaries, the 30-day grace boundary, revoked state, early and late renewal dates; production build passes.
- PASS: Analytics Lab school page lists the four approved tiers from the same source-controlled mapping; it links to institutional enquiry without opening checkout.
- AUDIT: WooCommerce currently lists zero webhooks. The existing Tutor LMS event bridge handles course enrolment/completion only; it cannot securely activate an institutional licence or infer a school from an email match.
- PASS: `lib/schools/woocommerce.ts` validates WooCommerce's raw-body HMAC signature and accepts only a single completed, paid, full-price KES plan line. Synthetic denial tests cover altered signatures, unpaid, discounted, wrong-currency, mixed and duplicate-quantity orders. This validator is deliberately not connected to a webhook or entitlement write until school-order binding and transactional persistence exist.
- AUDIT: `ya_institutions`, `ya_clubs`, `ya_cohorts`, `ya_cohort_memberships` and `ya_guardian_relationships` exist. `organization_subscriptions` belongs to a separate `organizations` model and only supports `premium`/`enterprise`; reusing it directly for school tiers would conflate accounts.
- BLOCKED: No signed WooCommerce school-order bridge, atomic school subscription transaction, guardian verification flow or synthetic payment transaction exists yet. These four products remain drafts.
- PASS: Administrator session verified 24 September 2026. HumHub had ten public Spaces and an existing private Instructor & Facilitator Hub; these were preserved. Created [Young Data Scientists Club — Synthetic Pilot](https://community.datalytiqsacademy.com/s/young-data-scientists-club-synthetic-pilo/) with `Private (Invisible)`, `Only by invite`, private default content, and administrator as sole member. No learners or external users invited.
- BLOCKED: HumHub member-role defaults still allow inviting members and creating public content. An attempted change to deny member invitations in this specific pilot Space was rejected by automatic approval review because the exact permission, role and scope were not explicitly approved. No permission override was saved; keep the pilot admin-only until this is resolved and tested with a synthetic non-member.
- NOT RUN: Synthetic school A/B isolation, concurrent seat cap, failed/partial/refunded order, manual invoice renewal, post-grace expiry, HumHub non-member access and authentic mobile-device tests.

Publication gate: all integration and denial-path tests must pass using synthetic schools/learners; no real learner data may be used for acceptance.

## Phase 3 independent recheck · 24 September 2026

- The four WooCommerce products were read again by ID: all four remain draft, virtual, KES-priced at the approved amounts. WooCommerce still reports zero webhooks. Checkout and payment confirmation cannot be acceptance-tested without a configured non-charging test path and a school-order activation handler. No real order was initiated.
- Supabase live counts: zero `ya_institutions`, `ya_clubs`, `ya_cohorts`, and `ya_cohort_memberships`. There is no synthetic school or learner cohort to validate. The existing school tables lack a transactional school licence and paid-order binding.
- The authenticated HumHub administrator rechecked the synthetic pilot Space: `Private (Invisible)`, `Only by invite`, private default content, one administrator member, zero posts and zero followers. The defaults for member invitations and public posts remain a safeguarding blocker. No learner was invited.
- The public production URL `https://datalytiqs-analytics-lab.vercel.app/schools` returned HTTP 404 in a browser. PR #52 remains open and draft, not merged. The school page and synthetic library exercise are staged code, not deployed features.
- Full 25-learner acceptance, checkout/payment, cross-school denial, instructor feedback, renewal/expiry and Community learner participation: **not run / not passed**. Offline rule tests alone do not constitute a production acceptance pass.

## Pilot operator handoff (draft; do not publish yet)

1. School administrator: submit institutional details, adult contact and desired tier through an approved registration flow; wait for a verified invoice and payment confirmation before inviting learners. Never enter a learner's private information into an enquiry form.
2. Coordinator: after paid activation, verify the school-specific private Space, assign adult instructors, create a cohort and invite only consent-verified learners. Monitor the single school-wide seat count; at 25 seats the Starter Club rejects a 26th admission. Do not use public join links.
3. Instructor: assign Python for Kids and, where appropriate, the Young Data Scientists synthetic library challenge; check each learner's access and feedback visibility within the school's cohort. Assess narrative answers personally and label automated checks as automated.
4. Renewal: issue a manual invoice before the paid-through date; during the following 30 days existing learners retain access but new admissions stop. Verify paid renewal before extending the licence. At the exclusive end of grace, paid modules close while Python for Kids Modules 1–3 remain free.
5. Acceptance evidence: use two synthetic schools and 25 synthetic learners in the first to demonstrate both seat rejection at 26 and denial of a second school's roster; use a payment gateway test mode or authorised zero-charge invoice workflow. Preserve order IDs, event IDs, permission screenshots and test timestamps without copying secrets or minors' records.

The handoff describes the intended procedure, **not an operational workflow**. It must be updated after end-to-end verification.

## Final execution recheck and production readiness checklist

The authenticated HumHub permission view returned `502 Bad Gateway` (`Connection refused`) on initial navigation and one reload. Do not infer a saved role override or invite users while the member permissions cannot be inspected. The Space's previously observed private/invite-only settings and one administrator member remain the last successful browser observation, not a new post-error verification.

The production deployment check for the draft school branch reports one Vercel project check failed with a build-rate-limit URL and another succeeded. Neither establishes that `/schools` is deployed to the public production domain; the latest browser visit there returned 404. Supabase still has zero institution, club, cohort and cohort-membership rows. PR #52 and the phase-2 syllabus register PR #53 remain draft.

| Gate | Evidence required | Current result |
| --- | --- | --- |
| Non-charging checkout and paid activation | Gateway test-mode or authorised zero-charge order, signed event, trusted order lookup, idempotent entitlement write | Not run; no school-order webhook |
| Manual renewal, grace and expiry | Paid renewal order and frozen-clock entitlement checks at boundaries | Pure rule tests pass; integration not run |
| 25 learner cap | Atomic admission of 25, rejection of 26th and concurrent attempts | Pure boundary test passes; live transaction not run |
| School isolation | Synthetic A and B staff and learners, cross-school denial for roster, submissions and feedback | Not run; no school rows |
| Safeguarding and Community | Restricted member permissions, private projects, non-member denial, moderator review | Blocked by permission state and current 502 |
| Academy and Lab journey | Registration, Python for Kids free Modules 1–3 and paid access, progress sync, exercise, instructor feedback | Not run end to end; public Lab school route 404 |
| Mobile and accessibility | Real mobile viewport and keyboard/screen-reader checks across live journey | Not run |

**Release decision: HOLD.** Keep products, Academy programme material and PRs unpublished/draft; do not activate paid school enrolment or populate 25 synthetic learner accounts until these gates pass. The synthetic HumHub pilot Space remains separate from real learner analytics.
