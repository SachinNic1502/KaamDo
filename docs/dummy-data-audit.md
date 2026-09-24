# Dummy, static and misleading data audit

Production-facing values below are identified from render/data paths, not keyword matches alone. Replacement is deliberately scheduled after Phase 1 and security/contract work.

| File → data | Expected real source | Required fix / task |
| --- | --- | --- |
| web/src/app/admin/analytics/page.tsx → jobStats, topServices, topLocations, workerStats; fixed money/growth metrics | Date-bounded analytics aggregations over Job/Payment/WorkerProfile | Add authorized aggregate contracts and replace every rendered number; errors must not show demo data. 015 |
| web/src/app/admin/users/contractors/page.tsx → five fabricated businesses and counts 45/38/etc. | ContractorProfile joined to safe User DTO, aggregate totals | Implement missing contractor API and actions, then render paginated data. 015,019 |
| web/src/app/admin/settings/page.tsx → commission percentages, cancellation charges, service-area/default form values | Versioned Commission/settings configuration used by backend | Persist and retrieve actual rules; keep label lists as constants, not fake saved settings. 019 |
| mobile/src/screens/common/NotificationsScreen.tsx → six demo events, relative times, read flags and foreign-currency payment | Authenticated durable notification inbox | Replace with paginated API; read/unread/deep-link updates and empty/error states. 023 |
| mobile/src/store/authSlice.ts → updateNotificationSettings returns arguments as if saved | Authenticated User.notificationSettings API | Persist, rehydrate, invalidate/update session DTO only after success. 019 |
| web/src/app/api/payments/route.ts → synthetic TXN timestamp and completed status; Payout bank fields set to Pending | Verified provider IDs/events and verified beneficiary | Remove false settlement path; provider reconciliation and real ledger/destination. Highest severity despite not being a mock array. 002 |
| mobile/src/screens/customer/ProfileScreen.tsx → fabricated email/phone and remote placeholder avatar | Current user DTO, explicit missing-field UI | Display absent state/initials instead of invented identity. 018 |
| mobile/src/services/payment.ts → placeholder checkout image | Existing KaamDo asset approved for provider checkout | Use supported branded asset while fixing payment contract. 017 |
| mobile/src/screens/customer/SearchScreen.tsx → static category chips | ServiceCategory API | Generate category filters from catalog; popular-search suggestions can remain editorial configuration if labelled. 018,021 |
| mobile/src/screens/customer/SearchScreen.tsx → each worker reviews set to 0 | Authorized review count aggregate | Return real count or omit unknown count rather than presenting zero. 019 |
| mobile/src/screens/worker/JobDetailScreen.tsx → default worker_assigned/customer/0 price/0 coordinates | Authorized Job detail DTO | Never enable status actions/navigation before valid data; distinguish not-found/loading/error from actual zeros. 009,012 |
| mobile/src/screens/worker/ProfileScreen.tsx and DashboardScreen.tsx → rating/jobs/experience/earnings fallbacks derived from wrong fields | WorkerProfile and financial aggregates | Fix shape/source; do not label unknown as verified zero or lifetime earnings. 017,018 |
| mobile/src/screens/customer/JobDetailScreen.tsx → worker rating 0 and blank timeline | Worker review aggregate and job status history | Return fields or remove unsupported display. 012,019 |

`mobile/src/screens/worker/JobsScreen.tsx` defines mockJobs at line 68, but renders allJobs mapped from jobsRes. It is an **unused fixture**, not production fallback. Remove only after reference confirmation under TASK-032.

Keep legitimate constants: mobile Colors/Spacing/FontSize/JobStatus, sidebar/menu labels, form steps, dispute reason choices, status color maps, currency code, request timeout defaults and branded SVGs. `Math.random` in OTP generation is a security finding, not fake dashboard data; job/project number generation is an identifier collision concern. Chat typing/scroll timers are not fake API delays. No production fake-delay response handler was found in the inspected API.

Page-derived payment/project/dispute totals are real but incomplete, not fabricated arrays. Track these under TASK-017/021. Missing recentJobs in dashboard API produces an empty section; do not call it a verified empty database. The old plan's broad statements about all dashboards being dummy would be inaccurate.
