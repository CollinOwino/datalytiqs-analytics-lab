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
