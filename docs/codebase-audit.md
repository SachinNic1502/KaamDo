# KaamDo codebase audit

Audit date: 2026-09-21. Scope: Phase 1, analysis and documentation. Business logic has not been changed by this audit.

Implementation follow-up: [Phase 2 progress](phase-2-progress.md) records subsequent changes and remaining blockers. The findings below remain the original audit snapshot, not a claim that those fixes have not happened.

## 1. Executive Summary

**Release decision: not ready for production.** This is a service marketplace, not a loan or retail platform. The repository contains a Next.js web/admin application with its backend in Route Handlers, and one Expo application with customer and worker navigation. Contractor models and admin screens exist, but there is no independent contractor/shop mobile application. Do not rename workers to shops or infer loan/order functionality from the generic request.

The highest risks are unauthenticated disclosure of worker bank/KYC fields, authenticated cross-account mutations, self-approval of worker verification, payment records completed without gateway confirmation, and missing session/account enforcement. Both applications fail their TypeScript checks. Several screens call real endpoints with incompatible payloads; the existence of a hook is not evidence of a working workflow.

The working tree was already dirty, including an untracked DEVELOPMENT_PLAN.md. Files changed during inspection, including the landing page and FeaturesSection. Findings describe the files observed during this session, not a frozen release commit. Existing changes and the earlier plan are preserved. The appended TASK register supersedes contradicted legacy assertions.

Evidence levels: **verified source** means an implementation path was inspected; **check result** means a command was run; **unverified runtime** means a live database, provider, browser, or device test is still required. No live records, payments, messages, deployments, or schema migrations were performed. This is a repository-wide static audit with targeted checks, not a claim that every runtime state was exercised.

## 2. Architecture Overview

See [architecture-overview.md](architecture-overview.md). Two separate package manifests/lockfiles; no workspace/shared contract package. Web uses Next.js 16.3.5, React 19.2.8, Mongoose, Zod, TanStack Query, Tailwind/Base UI, and a placeholder Redux reducer. Mobile uses Expo ~57.0.24, React Native 0.86.3, React 19.2.3, React Navigation, Redux auth, TanStack Query and SecureStore. MongoDB stores business entities; Redis is wired for OTPs. No server socket implementation or durable job runner was found.

## 3. Web Application Analysis

See [ui-ux-audit.md](ui-ux-audit.md) for every page and control family. Lists and aggregate dashboard queries are partly connected. Attendance incorrectly treats an API envelope as an array. KYC uses incompatible profile IDs/fields. Analytics, contractors and settings contain static business data. Navigation includes missing routes; logout is inert. There is no functioning web login/protected layout. Landing-page syntax blocks compilation.

## 4. Mobile Application Analysis

See [mobile-app-audit.md](mobile-app-audit.md). Customer and worker experiences share one binary. Creation, detail, rating, attendance, promo and payment contracts are inconsistent with the backend. Notifications are demo records. Profile menu buttons lack handlers. Settings/OTP compile errors, session cache isolation, network recovery and physical-device release validation remain open.

## 5. Backend/API Analysis

See [api-audit.md](api-audit.md): 12 route files and 32 exported method handlers observed. CRUD is implemented directly in handlers. Create schemas exist, pagination is capped at 100, and responses already share helpers. Many PATCH handlers accept unrestricted fields. Exceptions from requireAuth/Zod are generally converted to 500. Several mobile action values are ignored or routed into unrelated create handlers.

## 6. Database Analysis

See [database-audit.md](database-audit.md): 13 model files, 12 barrel exports; PaymentMethod is omitted from the barrel used by its route. Existing unique fields, indexes and timestamps must be preserved. Multi-record payment/dispute writes are not transactional; profile/attendance/payment idempotency constraints are absent. Actual collection contents, duplicate counts and deployed indexes are unknown.

## 7. Role & Permission Analysis

See [role-permission-matrix.md](role-permission-matrix.md). Roles are customer, worker, contractor and admin. JWT role claims drive scattered checks. Account activity, deleted principals and changed roles are not revalidated. Ownership must accompany permissions; a centralized can() helper alone would not fix IDOR.

## 8. Security Issues

See [security-audit.md](security-audit.md). TASK-001–008 cover release-blocking exposure, financial integrity, ownership, field-level authorization, build integrity, account enforcement, OTP delivery, and privileged data/seed credentials. No actual deployment compromise is asserted. JWT secrets now require environment configuration; the older plan's fallback-secret claim is stale.

## 9. UI/UX Issues

Preserve current reusable controls and blue/orange brand. Prioritize truthful data, usable actions, errors, semantic labels, focus and small-screen navigation over decoration. Source review indicates fixed sidebar and wide controls need responsive work; browser contrast/overflow measurements have not been performed. See TASK-014–022 and ui-ux-audit.md.

## 10. API Issues

Keep existing success/data/pagination semantics while introducing stable message/code errors with a client migration. Add schemas, ObjectId/date bounds, role/ownership checks, explicit response DTOs, detail contracts and action dispatch. Do not introduce duplicate APIs just to avoid fixing existing consumers. TASK-009–013.

## 11. Dummy/Mock Data

See [dummy-data-audit.md](dummy-data-audit.md). Separate production-rendered analytics/contractors/notifications/settings from unused mockJobs and legitimate design/status constants. Zero fallbacks can hide broken mappings even when no literal mock array is used. Replacements are planned, not applied in Phase 1.

## 12. Performance Issues

See [performance-audit.md](performance-audit.md). Counts/totals from a single page are correctness bugs. Unescaped regex searches, unbounded worker-ID lookup, aggregate dashboard polling, Redis KEYS and nonvirtualized mobile lists merit profiling. No fabricated latency, memory or bundle measurements are reported.

## 13. Missing Features

See [missing-features.md](missing-features.md). Distinguish a missing endpoint from a missing screen and from an incomplete integration. Contractor/shop scope needs a product decision; refunds, payouts, onboarding, addresses, durable notifications and chat need real implementations or removal from the release scope.

## 14. Broken Features

Verified checks: web `node_modules/.bin/tsc.cmd --noEmit --incremental false` exited 1 for malformed landing JSX and FeaturesSection import syntax. Mobile equivalent exited 1 for missing resetOtpExpire/handleResendOtp, invalid disabled type, incorrect settings thunk call, missing preference value and View onPress. Source also shows missing PaymentMethod barrel export, undeclared ApiResponse in payment-method hooks, unsupported payment-method PATCH, missing web auth state/constants/icon imports, and worker filter schema fields absent from paginationSchema. Parsing failures can mask later type errors.

Critical workflow failures include OTP user creation without the required password, create-job payload mismatch, list-as-detail responses, attendance envelope `.filter()` failure, KYC identifier mismatch, unsupported rating/promo/upload/push actions and financial settlement without proof. Details and reproduction criteria are in the linked reports and TASK register.

## 15. Dead/Unused Code

See [dead-code-report.md](dead-code-report.md). Nothing was deleted. Source-only reference absence is a candidate signal, not proof that public routes or exported library functions are safe to remove.

## 16. Technical Debt

Duplicated types and fetch clients; broad any/unknown casts; screen-specific status/price calculations; weak mutation invalidation; unused security wrappers; no test scripts or repository test files found. TypeScript strict mode already exists in both apps, contrary to the earlier plan.

Dependency check: `npm.cmd audit --package-lock-only --json` succeeded for both apps with **0 reported vulnerabilities** on this audit date (web dependency total 834; mobile 572 in audit metadata). This is registry advisory evidence, not proof of secure business logic or native compatibility. No upgrades were made. See performance report for dependency candidates.

## 17. Recommended Architecture

Keep the two apps and existing backend. Extract small shared runtime schemas/DTOs and status definitions; centralize principal resolution, resource authorization and error translation. Keep business invariants server-side, isolate payment/provider adapters, and add transactional/idempotent domain operations incrementally. Query owns server data; Redux owns minimal session/UI state; form state remains local. TASK-023–026.

## 18. Priority Matrix

| Priority | Tasks | Release impact |
| --- | --- | --- |
| P0 | 001–004 | Public sensitive data, fabricated settlement, cross-account writes, verification bypass |
| P1 | 005–019, 023–024, 026–029, 031 | Build/auth/contracts, incomplete workflows, data and release controls |
| P2 | 020–022, 025, 030 | Product consistency, mobile network/lifecycle, performance |
| P3 | 032 | Verified cleanup after functionality works |

Tasks are expanded in [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md), with dependencies and acceptance criteria. Number order groups priorities; the execution graph in the roadmap handles dependencies that must precede higher-numbered work.

## 19. Development Roadmap

See [development-roadmap.md](development-roadmap.md) and [production-readiness-checklist.md](production-readiness-checklist.md). Phase 1 deliverables are documentation; phases 2–10 remain implementation work. No production-readiness claim, arbitrary completion percentage, fixed staffing timeline or destructive migration is implied by this audit.
