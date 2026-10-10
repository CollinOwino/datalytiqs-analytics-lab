# Young Data Scientists Club implementation inventory · 2026-09-24

## Existing systems

| System | Reusable asset | Verified gap |
| --- | --- | --- |
| Academy | Tutor LMS 4.0.9; Python for Kids course 1422 and premium continuation 1474; WooCommerce Python premium product 1463 (KES 3,500) | No institutional club licence product, school checkout binding, or verified renewal event |
| Analytics Lab | Python for Kids guided lessons, sandboxed exercises, own-user progress and paid access grants; Supabase authentication | No school provisioning, second-pathway learner progress, instructor review UI, school entitlement mapping, or guardian view |
| Supabase | `ya_institutions`, `ya_clubs`, `ya_cohorts`, memberships, guardian relationships, challenges, assignments and submissions are present with RLS; canonical organization and subscription tables also exist | All `ya_*` tables are empty; RLS offers member reads but no vetted institutional provisioning write path; no confirmed payment-to-licence mapping |
| Community | Existing HumHub URL supplied | No authenticated admin connector or verified space/permission configuration in this session; no school spaces created |
| Vercel | Existing Analytics Lab project and production deployment | Production still at commit `7b67e335` when checked; this branch is local only |

## Work completed

- Academy page 1643: draft school landing page, with Python for Kids free Modules 1–3 highlighted and no invented school price.
- Academy course 1625: draft six-unit Young Data Scientists Tutor curriculum with eleven project-based lessons.
- Analytics Lab `/schools`: responsive public pathway overview, a synthetic four-week library statistics challenge, and signed-in cohort/assignment summary using existing RLS. No learner PII or raw projects are rendered. The exercise is a local practice check and explicitly does not save progress or count as an instructor grade. Code is isolated in `feature/young-data-scientists-club`.

## Release gates

1. Agree annual school licence price, capacity tiers, renewal terms and purchasing authority. Create one WooCommerce product only after reviewing commercial rules.
2. Define and test a signed, idempotent WooCommerce order lifecycle hook that activates/renews/revokes a school licence and reconciles refunds; never trust browser payment claims.
3. Implement authenticated school provisioning, verified staff invitations, guardian consent and linked learner creation with explicit capacity and age gates. Reconcile WordPress and Supabase identity without duplicating accounts.
4. Build separately authorised instructor, administrator, learner and guardian views; enforce school and cohort isolation in database functions/policies, including updates and reviews.
5. Implement the Young Data Scientists Lab progression and assessments; keep Python for Kids Modules 1–3 free while institution access controls later modules.
6. Configure private HumHub spaces with school-only membership and moderation; test public/other-school denial before learner activation.
7. Run synthetic end-to-end registration, purchase, activation, instruction, renewal and revocation tests on a nonproduction payment path, plus real mobile and accessibility checks.

Do not publish the drafts or activate a club until these gates are met.
