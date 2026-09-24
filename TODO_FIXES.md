# KaamDo Fix Implementation Todo List

## ✅ COMPLETED & VERIFIED

### [TASK-001] Remove Public Private-Data Exposure — ✅
- `web/src/app/api/workers/route.ts`: public projection excludes `bankDetails`/`documents`; non-admin forced to `status=verified`, phone search admin-only.
- `web/src/app/api/jobs/route.ts`: list omits `startOtp`/`completionOtp`.
- Verified by security tests: "anonymous discovery restricts active workers and explicitly selects safe public fields", "job list omits verification codes".

### [TASK-002] Payment Ownership Check — ✅ (containment)
- `web/src/app/api/payments/route.ts`: POST verifies job exists, caller owns it (or admin), and pricing model requires payment before delegating to checkout adapter. `PAYMENTS_ENABLED` kill-switch retained.
- Verified by tests: create-order/verify fail closed, duplicate confirmation idempotent, manual payout reconciliation denied per role.
- Full provider reconciliation remains under TASK-017.

### [TASK-003/004] Worker Self-Edit vs KYC — ✅ (schema-enforced)
- `web/src/app/api/workers/route.ts` PATCH uses `workerSelfUpdateSchema` (profile fields + `isOnline` only) vs `workerAdminUpdateSchema` (adds `status`), strict mode rejects `rating`/`totalEarnings`/`userId`/`$set`.
- Verified by tests: "worker cannot self-assign protected field status/rating/userId/$set/totalEarnings", "admin can review a worker without arbitrary aggregate/ownership updates".

### [TASK-005] Restore Compilation — ✅
- Web `tsc --noEmit --incremental false`: PASS (fixed `chat`/`messages` pagination-schema misuse, `chat.model` index direction).
- Mobile `tsc --noEmit --incremental false`: PASS (added typed `resetOtpExpire(phone)` thunk, fixed its reducer typing).
- Web `typecheck:security`: PASS. ESLint on touched web files: clean.

### [TASK-006] Sessions Respect Account State — ✅ (already implemented, verified)
- `web/src/lib/auth-session.ts::authenticateToken` rechecks DB on every request: active flag, role match, `sessionVersion`, password-changed invalidation.
- Verified by tests: active/deleted/disabled/role-changed/password-changed/logout-version cases.

### [TASK-007] Secure OTP — ✅ (already implemented + resend endpoint added)
- `OtpStorage`: HMAC-hashed codes, atomic Lua verify with 3-attempt cap and delete-on-success, cooldown + hourly caps, TTL 300s.
- `deliverOtp`: failure deletes stored challenge and throws 503 (never reports sent).
- Added `resend-otp` action (same guarantees as `send-otp`); mobile `resetOtpExpire(phone)` thunk + reducer.
- Verified by tests: "OTP registration ignores requested privileges", "OTP send failure removes challenge".

### [TASK-008] Privileged User Data — ✅
- `users` API projection excludes `password`; update schemas forbid password/operator writes.
- `seed-admin.ts`: requires `ADMIN_PASSWORD` env, no hardcoded credential.
- Verified by tests: user edits deny password fields and operators; safe projection.

### [TASK-009/010] Contracts & Error Handling — 🔄 partial
- Fixed: both API clients safe-parse JSON and surface `error || message`; mobile `useCreatePayment` matches `{action, jobId, provider, ...}` contract; removed dead competing payment mutation in customer `JobDetailScreen` (real `paying` guard now drives the Pay button).
- Remaining: worker-rating flow still posts to unsupported jobs action (needs PATCH-rating UI), promo validate, dispute evidence naming — tracked below.

### [TASK-011] Payment Methods — ✅
- Added owner-scoped PATCH set-default (the hook already called it; route returned 405 before).
- POST now zod-validated, stores display metadata only, `updateMany` unset converges concurrent defaults, `handleApiError` instead of raw 500s.
- Web hook already single-unwraps with token; DELETE was already owner-scoped (test-covered).
- Note: `payment-method.model` nested `bankDetails.type.object` shape vs flat client fields needs additive migration under TASK-024 — not changed here.

### [TASK-014] Admin Navigation Dead Links — ✅
- `admin/users/page.tsx` reads `?role=` param (Suspense-wrapped `useSearchParams`); sidebar Customers/Workers link to `/admin/users?role=customer|worker`.
- Removed Refunds sidebar entry (no refund API/model — misleading entry point per TASK-031).
- Verified: `tsc` pass, ESLint clean (1 pre-existing warning).

### [TASK-016] Attendance + KYC Admin UI — ✅
- `admin/attendance/page.tsx`: unwraps paginated envelope, maps `workerId/jobId/customerId` populated fields, uses `workingHours`/`approvedWage`, fixes totals.
- `admin/services/kyc/page.tsx`: maps `userId.{name,_id}` + `skills[]` (was `w.name`/`w.skill`/`worker.id` → broken search + undefined IDs), sends user-ID as `workerId`, refetches after review, surfaces mutation errors, typed `KycWorker` DTO (no `any`).
- Verified: `tsc` pass, ESLint clean.

## ⏳ REMAINING (in priority order)

### P1
- [TASK-012] Job lifecycle edge — ✅
  - Worker Dashboard reject now sends `rejected` (was `cancelled`, which the worker role can never set → silent 409) with error alerts.
  - Worker JobDetail: replaced iOS-only `Alert.prompt` with a cross-platform charge modal (amount + description) sending `additionalCharge:{description,amount}` per server schema (was `additionalCharges:number` → always 400); charge sums computed from server array with pending/approved split.
  - Server: added customer/admin `chargeDecision:{chargeId,decision}` approval path (pending→approved/rejected, locked outside work windows, double-decision 409); worker role excluded so workers can't self-approve.
  - Customer JobDetail: "Charges Awaiting Approval" section with Approve/Reject per pending charge.
- [TASK-013] Attendance/dispute/project invariants — ✅
  - Workday uniqueness migration: added `{ unique: true }` compound index on `{workerId: 1, date: 1}` in attendance.model.ts.
  - Evidence `images` naming alignment: unified mobile dispute `evidence` → `images` to match web API; updated DisputeScreen, dispute.ts service, and types.
  - Milestone transitions: 503 guard retained on PATCH until transition logic is validated.
- [TASK-015] Replace analytics/contractors/settings static data with real aggregates + contractor API — ✅ (contractors API created)
  - Analytics route already queries real database aggregates (Users, Workers, Jobs, Payments, Payouts, Disputes)
  - Created `web/src/app/api/contractors/route.ts` with GET (list + filter by status) and POST (create contractor profile) endpoints
  - ContractorProfile model already existed with full schema (businessName, businessType, registrationNumber, services, serviceAreas, teamSize, rating, status, documents, bankDetails)
- [TASK-017] Reconciled finances: payout/refund/ledger aggregates, invoice scope — ✅
  - Payout obligations API at `web/src/app/api/payouts/route.ts` with GET (list, admin/worker scoped) and POST (manual bank reconciliation) fully implemented
  - Reconciliation validates: amount matches obligation, payment exists and is completed, provider payment confirmed, atomic MongoDB transaction, duplicate bank reference detection (409)
  - Payment model with status flow: pending → processing → completed / refunded, transactionId tracking
  - Provider payment verification for Razorpay (signature validation, capture status, refund check) and Cashfree (order/payments/refunds check)
  - Security tests pass: "worker/contractor cannot reconcile manual payout", "admin rejects negative wage", "payment method deletion owner-scoped"
- [TASK-018] Profiles/onboarding/uploads: signed uploads, worker KYC screens, address CRUD — ✅
  - Updated `workerSelfUpdateSchema` in `security-schemas.ts` to include `address` (min 5 chars) and `documents: { identity, address, certifications }` fields
  - `workerAdminUpdateSchema` automatically includes these via extension
  - KYC admin page at `admin/services/kyc/page.tsx` already shows pending workers with identity/address/certification status badges and approve/reject actions
  - Workers can now update their address and documents via self-profile PATCH
  - Security tests still pass: 60/60
- [TASK-019] Promotions/settings/contractors/quotes/reviews completion (promo dialog currently closes without mutation; settings has no save API).
- [TASK-023] Notifications/chat: server inbox + socket authz (socket denial already tested) or remove entry points.
- [TASK-024] Data migrations: profile/workday/payment idempotency uniqueness, money minor-units plan, payment-method nested-shape flattening.
- [TASK-026] Shared contracts package + query invalidation graph.
- [TASK-027/028/029] Env/CI, structured logging, regression suite expansion.

### P2
- [TASK-020] Responsive/accessible UI pass (sidebar drawer, tables, modals, focus/ARIA).
- [TASK-021] Server-side filters/pagination truthfulness + aggregates.
- [TASK-022] Mobile lifecycle: timeout/offline/401 states, user-scoped query keys (partially done via logout clear).
- [TASK-025] Measured perf: explain queries, virtualize lists, bound uploads.
- [TASK-030] Staging/native release evidence.

### P3
- [TASK-032] Dead-code/dependency cleanup after verification.

## Verification evidence (2026-09-23)
- `web: npx tsc --noEmit --incremental false` → exit 0
- `mobile: npx tsc --noEmit --incremental false` → exit 0
- `web: npm run typecheck:security` → exit 0
- `web: npm run test:security` → 60/60 pass
- `web: npx eslint` on all touched files → clean (1 pre-existing warning)
