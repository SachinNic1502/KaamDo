# API audit

Source: `web/src/app/api/<name>/route.ts`, `web/src/lib/validations.ts`, both `hooks/use-api.ts`, and `mobile/src/services`. All entries below are observed implementation, not intended documentation. 12 route files expose 32 method handlers. No dynamic API detail routes were found.

Common list query `Q`: page (default 1, min 1), limit (default 20, min 1, max 100), optional search/status/role/skill/sortBy/sortOrder. Page/limit lack integer constraints. Each endpoint consumes only its own subset; sort fields are accepted by the schema but handlers use fixed sorting. Arbitrary IDs/dates are not consistently validated. String search is used directly as Mongo regex.

Common response `S`: `{success:true,data,message?}`; `L`: S plus pagination `{page,limit,total,totalPages}`; `E`: `{success:false,error}`. Most catches log the raw exception and return E/500. requireAuth throws and is not translated to 401; schema/cast errors usually become 500 too. Explicit checks return 400/403/404/409. No stable error code. The existing bounded pagination and generic client-facing 500 messages are positive controls worth retaining.

## Complete implemented method inventory

| Endpoint/method | Authentication and actual scope | Request / validation | Database operation and response | Consumers / gaps / tasks |
| --- | --- | --- | --- | --- |
| `/api/auth` POST send-otp | Public, local process auth limiter | phoneSchema | Redis stores 4-digit OTP; S phone/expiry; no SMS send | Mobile Login, web unused hook. Logs OTP; reports success after storage failure. 007 |
| same POST verify-otp | Public, same limiter | otpSchema | Redis verification; User find/create; JWT; S user/token | Mobile OTP. New User lacks mandatory password; `id` differs from `_id`; no isActive check. 006–007,009 |
| same POST login | Public, same limiter | loginSchema | User lookup/bcrypt; lock fields saved; S user/token | No working web login UI found. Disabled users accepted; lock reset/concurrency needs tests. 006,008,014 |
| same POST change-password | Manual JWT lookup | passwordChangeSchema, current password comparison | User password hash/passwordChangedAt save; S null | No session invalidation; saved timestamp unused in JWT authorization. 006 |
| `/api/analytics` GET | Admin | No date/query schema | 16 concurrent counts/aggregations; S stats | Admin dashboard. No recentJobs/pendingVerifications/trend series; polling cost. 015,025 |
| `/api/users` GET | Admin | Q search/role; status ignored | User find/count, `-__v` only; L | Admin users. Password hashes are not excluded. 008,010 |
| `/api/users` PATCH | Admin | userId required; unrestricted remaining body | findByIdAndUpdate, no runValidators; S User | Admin hook; mobile self-profile receives 403. Privileged fields/password update unconstrained. 008,010,018 |
| `/api/workers` GET | Public | Q search/status/skill; price/rating destructured but missing from schema | User distinct IDs + WorkerProfile find/count + user populate; L entire profiles | Search, KYC. Bank/docs exposed; unverified profiles visible; price filters ineffective. 001,010,016 |
| `/api/workers` POST | Worker only | workerProfileSchema | Existing profile precheck then create draft; S profile | Onboarding consumer missing. Race: userId index not unique. 018,024 |
| `/api/workers` PATCH | Any authenticated user; non-admin targets own userId | workerId for admin; unrestricted updates | findOneAndUpdate `{userId:targetId}`; S populated profile | Mobile availability, KYC. Self-verify and aggregate/owner field updates possible; admin screen sends wrong ID. 004,016 |
| `/api/categories` GET | Public | Q search | Category count/find; L | Web categories, mobile home/create. Inactive records not filtered; mobile first page only. 010,021 |
| `/api/categories` POST | Admin | createCategorySchema | slug precheck then create; S/201 | Working create mutation path; race duplicate error becomes 500. 010,016 |
| `/api/categories` PATCH | Admin | categoryId; unrestricted updates | findByIdAndUpdate; S | Hook exists, editing UI incomplete. Validators absent. 010,016 |
| `/api/categories` DELETE | Admin | query categoryId | Hard delete; S null | Hook exists; no referenced-job integrity guard. 024 |
| `/api/jobs` GET | Auth; customer/worker filters only if User lookup succeeds; contractors unscoped | Q search/status; **jobId/action ignored** | Job count/find/populate, no OTP projection; L | All job lists, detail hook, chat history. Details/history get jobs array; start/completion OTP fields exposed in list. 001,003,009 |
| `/api/jobs` POST | Any authenticated role | createJobSchema | User/category lookup; Job create + limited worker match count; S `{job,matchedWorkers}`/201 | Customer create, rating service incorrectly calls POST. No assignment/notification follows matching; client prices accepted. 002,009,012 |
| `/api/jobs` PATCH | Any authenticated role; **no ownership** | jobId; status schema only | Lookup/save; optional worker/material/rating/charge writes; S Job | Worker/customer mutations. No transition graph, completion OTP may compare undefined to undefined. 003,012 |
| `/api/projects` GET | Auth; customers/contractors conditionally scoped; workers unscoped | Q search/status | Project find/count/populate; L | Admin projects. Deleted principals can lose filter. 003 |
| `/api/projects` POST | Any authenticated role | createProjectSchema | User lookup, generate number, embedded milestones, create; S/201 | Web hook; create button inert. Contractor relation/totals not enforced. 013,019 |
| `/api/projects` PATCH | Any authenticated role; **no ownership** | projectId, milestoneIndex/status; remaining updates unvalidated | Milestone edit + Object.assign + progress + save; S | Web hook. Arbitrary ownership/value/status changes. 003,013 |
| `/api/payments` GET | Auth; customer/worker conditional filters; contractors unscoped | Q search/status | Payment count/find/populate; L | Web transactions/mobile earnings; no payout records. 003,017 |
| `/api/payments` POST | Auth; **no payer ownership or provider verification** | jobId required, paymentMethod; action ignored | Completed-job lookup, payment precheck, commission, create completed Payment, mark job paid, create Payout with placeholder bank data; S `{payment,payout}`/201 | Hook and mobile create-order/verify calls conflict. paymentMethod omitted by service can fail model validation; a valid crafted paymentMethod can reach fake completion. No transaction/idempotency. 002 |
| `/api/payment-methods` GET | Auth, scoped to current userId | None | PaymentMethod find, S array | Unused web hook omits bearer token, double-unwraps data. Missing model barrel export blocks route. 005,011 |
| `/api/payment-methods` POST | Auth; owner set from token | Partial type-dependent field checks | Default precheck/update then create; S/201 | No connected form found; schema nested object shape mismatches payload. 011,024 |
| `/api/payment-methods` DELETE | Auth, **target fetched/deleted by ID without owner scope** | query methodId | Default check uses caller's count, delete by target ID; S null | Cross-user deletion possible. 003,011 |
| `/api/disputes` GET | Auth; non-admin raisedBy only if user exists | Q search/status; disputeId ignored | Dispute count/find/populate; L | Admin list, mobile service. Detail type incorrect. 003,013 |
| `/api/disputes` POST | Auth; **no job participation check** | createDisputeSchema (`images`) | Dispute create then Job marked disputed; S/201 | Mobile sends evidence instead of images. Unrelated job can be disputed; partial writes. 003,013 |
| `/api/disputes` PATCH | Admin | disputeId plus unvalidated status/resolution | Save resolution/actor/date; S | Admin update hook exists but screen only lists; no atomic job/refund resolution. 013,019 |
| `/api/attendance` GET | Auth; conditional worker/customer scope | Q search/status, custom date range | Attendance find/count/populate; L | Admin incorrectly casts L to array. Date UI filters client-side. 003,016 |
| `/api/attendance` POST | Any auth; no worker/assignment authorization | createAttendanceSchema requires workerId/date/status | Existing exact-date record update or create; hours derived; S/200 or 201 | Mobile sends action/location/timestamp without required fields. No geofence enforcement; races. 003,013,024 |
| `/api/attendance` PATCH | Any auth; no approval role/ownership | attendanceId, status, approvedWage unvalidated | Save status/wage and current user as approver; S | Any user can approve others' wages; check-out action ignored. 003,013 |
| `/api/promotions` GET | Public | Q search; active flag ignored | PromoCode find/count; L | Web promos, mobile offers; expired/inactive returned, field names differ. 010,019 |
| `/api/promotions` POST | Admin | createPromoSchema | Code precheck, create; S/201 | Web create dialog closes without calling hook; mobile validate action gets forbidden/create validation. 019 |
| `/api/promotions` PATCH | Admin | promoId; unrestricted updates | findByIdAndUpdate; S | Hook exists; no validators/usage integrity. 010,019 |
| `/api/promotions` DELETE | Admin | query promoId | Hard delete; S null | Hook exists; preserve redemption history when implemented. 024 |

## Missing/unsupported contracts

There is no users POST (push registration/upload calls return method-not-allowed), payment-methods PATCH (default hook cannot work), jobs GET detail/message action, workers GET review action, disputes GET detail action, payments create-order/verify dispatch, promotions validate dispatch, or attendance location action. There are no implemented endpoints for sessions/revoke/refresh, contractor profiles, payouts/refunds, commission/settings persistence, messages, notification inbox or signed upload. Model/helper/library presence does not establish API functionality.

No duplicate endpoint implementation was found; duplicate clients/types and competing payment entry points are the main duplication. Unused exported hooks are listed separately; do not delete endpoints just because no local screen uses them.

## Target contracts and safe migration

Retain `/api` ownership boundaries. Add explicit method/action schemas or deliberate resource routes after consumer inventory; do not silently overload creation with unrelated action values. Standardize S and L; errors become `{success:false,message,code}` with safe field-error metadata. Temporarily adapt clients reading `error` before removing it. Use 400 for malformed input, 401 for invalid session, 403 for denied action, 404 for scoped missing resource, 409 for conflicting transition/idempotency, 429 for rate limits, 503 for unavailable dependency and safe 500 for unknown failures.

Authenticate before database work where feasible; resolve active principal and use scoped predicates. Reject unknown mutation fields and query keys where appropriate. Allowlist sortable fields and escape literal searches. Return only DTO fields required by each role; OTP retrieval belongs to an explicitly authorized flow. Paginated summaries must be server aggregates, not a sum of visible rows. Include contract fixtures for every row above and tests of unauthenticated, wrong-role, wrong-owner, deleted/disabled principal, malformed IDs, concurrent requests and empty results.
