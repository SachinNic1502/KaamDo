# Production readiness checklist

Status on 2026-09-21: **blocked**. Checked items below describe audit evidence only. All unchecked items need implementation or external verification.

## Audit evidence

- [x] Source inventory covers web/admin, API, customer/worker mobile, models, state/config and provider clients.
- [x] Both TypeScript checks run; failures documented (not passed).
- [x] Both lockfile npm audits run; zero reported advisories.
- [x] Pre-existing user changes preserved; no business code or database changed by audit.
- [ ] Freeze release commit and repeat affected findings because working files changed during inspection.

## Security and financial gates

- [ ] P0 findings 001–004 closed with negative ownership/role tests.
- [ ] Public APIs omit hashes, bank/KYC data and unauthorized OTPs; private documents use restricted access.
- [ ] Missing/disabled/deleted/role-changed principals denied; login/refresh/logout/password change invalidate sessions as designed.
- [ ] OTP delivery, expiry, atomic consume, attempt limits, redacted logging and trusted-proxy distributed limits verified.
- [ ] Seed credentials supplied securely; any deployed known bootstrap credential rotated; history/build secret scan complete.
- [ ] Provider order/amount/currency/signature/webhook verified; duplicate/replayed/concurrent events idempotent.
- [ ] Payment, refund, adjustment and payout ledger reconciles; no placeholder beneficiary or fabricated completion.
- [ ] Cookie/bearer policy explicit; CORS/preflight, CSRF where applicable, HTTPS and browser security headers verified.

## Data/API gates

- [ ] DTO/schema contracts shared and tested; invalid input/auth/permission errors return correct status/code.
- [ ] Job/approval transitions and charge/material/milestone calculations server-controlled and audited.
- [ ] Pagination/filter/sort/search semantics consistent; aggregates reflect full scoped dataset.
- [ ] Backups restored on staging; migration duplicates/reference report reviewed; additive migration and rollback rehearsed.
- [ ] Transaction-capable topology, unique/idempotency constraints and query-specific indexes verified on deployed DB.
- [ ] All P1 contract/UI findings closed; no visible production demo data or silent no-op controls.

## Web/mobile gates

- [ ] Web typecheck, lint and production build pass from frozen lockfiles.
- [ ] Mobile typecheck, framework compatibility checks and Android/iOS release builds pass.
- [ ] Customer/worker/admin/contractor scope explicitly accepted; no unsupported-role navigation fallback.
- [ ] Critical role journeys pass including denied operations, errors, retries and logout/login account switch.
- [ ] 360/390/768/1024/1440/1920 web viewport matrix, keyboard, zoom, labels and focus verified.
- [ ] Native safe area, back/keyboard, large type, permission denial, timeout, offline/reconnect and foreground recovery verified.
- [ ] Push token lifecycle/deep links and chat delivery/history tested with real authorized participants if in scope.
- [ ] Signed private upload, image bounds and document access rules verified.

## Operations/release gates

- [ ] Separate dev/staging/prod env values validated without printing secrets; no release localhost fallback.
- [ ] Expo project IDs/config plugins/permission descriptions, signing keys, provisioning and store release settings verified.
- [ ] CI runs critical tests, typecheck/lint/build, advisory and secret checks with protected deployment credentials.
- [ ] Structured logs redact credentials/PII; audit trail records sensitive actions; retention/access controls configured.
- [ ] Health/readiness checks, error monitoring, provider/event retry/dead-letter handling and actionable alerts tested.
- [ ] Staging load/device baselines meet agreed budgets; restore and rollback runbooks rehearsed.
- [ ] Release owner reviews exact artifacts/commit, migrations, remaining accepted risks and deployment rollback.

No live browser/device, payment sandbox, load test, deploy, backup restore or database migration was executed in this audit. Their boxes intentionally remain unchecked.
