# Phase 2 progress — critical HTTP API containment

Date: 2026-09-21. This is a follow-up to the Phase 1 source snapshot, not a production-readiness declaration. Existing changes were present when implementation resumed, including RBAC, transaction helpers, socket server and index changes. Those were re-read before editing. No database migration, provider operation, deployment or dependency installation was performed.

## Implemented changes

- Public worker discovery now selects explicit public profile fields and only active, verified workers. Private bank/earnings/KYC fields and phone/email are omitted for non-admin callers; admin KYC queries retain document/contact fields, without bank details. Literal name search is escaped; public phone search is removed. Price/rating filters now have real validation.
- User enumeration is admin-only. Self-profile edits are owner-scoped and strictly allowlisted; only admins can change role/account activity. Raw password, operator and unknown-field writes are rejected. User read/update projections exclude password and lock fields. This also contains a newly observed regression: the RBAC map granted customer user:write while the handler previously accepted arbitrary user IDs/role updates.
- Worker self-edit permits only profile inputs/availability; status review is admin-only. Ownership, rating and earnings writes are rejected for all generic profile updates. Existing legitimate availability updates remain supported.
- HTTP authentication now resolves the current active User, rejects deleted/disabled/role-changed principals and tokens issued before passwordChangedAt, and uses current identity fields. This does not yet supply refresh rotation/logout revocation or secure the separate socket authentication path.
- Job/project/attendance/dispute lists use explicit role/identity scope, denying roles without a defined relationship. Job/project mutations, dispute creation and saved-payment-method deletion use scoped record queries. Worker attendance creation verifies assignment; approval is admin-only and negative wages are rejected. Reviewed attendance cannot be overwritten through the normal creation endpoint.
- Job lists and mutation responses omit OTPs. A missing start/completion code can no longer pass by comparing undefined values. Job updates reject unknown/protected fields, workers cannot assign themselves, extra charges start pending, material totals are derived from quantity/unit price, and ratings require completed jobs. A full state machine, one-time OTP lifecycle and price/charge approval process remain open.
- **All payment POST actions return 503 / PAYMENT_VERIFICATION_UNAVAILABLE after authorization, with no payment/job/payout writes.** The added transaction service did not verify provider proof; atomic fabricated settlement is still fabricated settlement. Payment history remains readable with customer/worker/admin scope. Reopening writes requires the provider verification/idempotency work in TASK-002.
- **Project milestone updates return 503 / MILESTONE_VALIDATION_UNAVAILABLE.** Generic project updates can edit validated title/description only. Ownership, amount, paid state and milestones require dedicated validated operations before re-enabling. The existing UI had no connected milestone editor.
- Changed routes use typed safe error mapping (401/403/400) instead of converting every denial to 500. The existing error field is retained for client compatibility while message/code are available. PaymentMethod is exported from the model barrel. OTP generation now uses node:crypto randomInt; JWT secret configuration has explicit nonoptional typing.

## Validation

The security suite executes actual TypeScript handlers/schemas via the installed TypeScript transpiler and Node's built-in test runner. Authentication and persistence are stubbed so it cannot contact a database, merchant or deployed service. It asserts owner-scoped queries, private-field projections, denied writes, allowed updates and truthful failure responses. This is boundary regression coverage, **not** live MongoDB/provider concurrency or end-to-end UI coverage.

- `npm run test:security` / `node --test tests/security-routes.test.cjs`: 38 tests passed in the latest recorded run before the final documentation update. Test-worker creation needed sandbox escalation; no network/database access was used by the suite.
- `npm run typecheck:security`: **passed, exit 0**; changed handlers and their imported dependencies only.
- Targeted ESLint: **passed, exit 0**, no warnings/errors for the changed TypeScript modules.
- Full web `tsc --noEmit --incremental false`: failed during baseline verification. Existing landing/Header/FeaturesSection imports/state, payment-method hook types and the new SocketServer remain build blockers. The JWT typing error identified in that run was repaired here. A full build is not certified by the focused typecheck.

## Task status

| Task | Current status |
| --- | --- |
| 001 | HTTP exposure containment implemented; live response/DB validation still pending |
| 002 | Unsafe settlement contained; full gateway/ledger/idempotency implementation remains open |
| 003 | HTTP ownership/approval containment implemented; socket path, concurrency and final policy matrix remain open |
| 004 | Self-verification/mass-assignment containment implemented; KYC UI/audit-history workflow remains open |
| 005 | PaymentMethod export/JWT typing corrected; full app compilation still blocked elsewhere |
| 006 | Current-account HTTP validation implemented; login policy, refresh/session revocation, socket revalidation remain open |
| 007 | Cryptographic OTP generation only; delivery, atomic Redis attempts and log redaction remain open |
| 008 | Safe user projection/update restrictions implemented; bootstrap credential removal/rotation remains open |
| 010–013 | Selected contract/error/ownership controls implemented; see remaining roadmap |
| 029 | 38 focused security regression tests added; full integration/E2E/provider coverage remains open |

## Remaining release blockers and behavior changes

Payments and milestone writes are deliberately unavailable until verified implementations exist. Job completion now requires an actual code, so the missing completion-code generation/delivery flow must be completed before that journey works. Unsupported roles cannot access lists merely because no scope was defined. Frontend contract defects are not hidden with fake fallback data.

The newly present `web/src/lib/socket/server.ts` uses separate JWT-only middleware and permits arbitrary join_chat/join_job room subscriptions. It also broadcasts messages before checking job participation, and its event names differ from the mobile client. Treat that path as an unresolved release blocker under TASK-003/023; HTTP tests do not cover it. `web/server.ts` and changed dev/start scripts need runtime/production-mode validation. Audit-log and transaction helper presence is not evidence that all audited events or provider reconciliation work.

MongoDB uniqueness/transaction behavior, atomic transition races and projections must still be exercised against isolated real fixtures. Worker discovery currently uses a distinct active-user-ID lookup before pagination; profile it and replace with an indexed joined query if volume requires it (TASK-025). No P0/P1 task is marked completely done solely on these mocked-boundary tests.

Next dependency order: restore complete web/mobile compilation (005), secure new socket path (003/023), complete OTP/enrollment/session flows (006/007), then job detail/state contracts and verified financial integration (009/012/002). Preserve all existing application work while completing those modules.

## Continuation — 2026-09-22

See [implementation and activation notes](implementation-progress-2026-09-22.md) for build repairs, socket authorization, openWA auth, booking transitions, both collection gateways and manual payout reconciliation. Payments remain disabled by default pending configured staging acceptance; the earlier blanket containment now has a guarded integration path.
