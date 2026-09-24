# Database audit

13 Mongoose model files under `web/src/lib/models`; all define timestamps. MongoDB data, deployed indexes, volume and duplicate records were not queried. Reference declarations do not enforce foreign keys. No destructive schema change was made.

| Model | Required relationships / business fields | Observed indexes/uniqueness | Integrity finding / task |
| --- | --- | --- | --- |
| User | name, phone, password; role enum | Unique phone, sparse unique email; explicit phone/email/role indexes | OTP creation omits required password; duplicate index declarations; password projected to API. Normalize phone/email and credential strategy carefully. 007,008,024 |
| WorkerProfile | User; skills, areas, verification, bank/docs, rating/earnings | userId, status, skills, serviceAreas; userId not unique | Concurrent duplicate profiles; private fields publicly returned; aggregates mutable by owner. 001,004,024 |
| ContractorProfile | User, businessName/businessType; services/team/docs/bank | userId/status/services, no unique userId | Model not connected to contractor API; same profile uniqueness issue. 019,024 |
| ServiceCategory | name, unique slug; embedded subcategories/pricing | slug and isActive; slug explicitly indexed again | Category delete can orphan Job; validate active category and contained subcategory. 012,024 |
| Job | unique jobNumber; customer User, optional worker User, category, required subcategory ObjectId, address/state/date/pricing | jobNumber/customerId/workerId/status/categoryId/createdAt | OTP fields not private, missing generated completion code; charge/material totals not validated end-to-end; client prices and no state history. 002,012,024 |
| Project | unique projectNumber; customer/contractor; amount/startDate; embedded milestones | projectNumber/customerId/contractorId/status/createdAt | Dates, milestone sum, paidAmount and progress need domain invariants; raw assignment bypasses policy. 003,013,024 |
| Payment | Job/customer/worker; amount/platformFee/workerEarning/paymentMethod; status | jobId/customerId/workerId/status/createdAt, no unique provider ID/idempotency | Check-then-create race; financial fields use floating Number; no proof or ledger event. 002,024 |
| Payout | worker User; amount/status; required bank account/IFSC | workerId/status/createdAt | Placeholder destination persisted; no payment/ledger linkage or reconciliation API. 002,017 |
| PaymentMethod | User/type; card display and bank metadata | userId/isDefault, no unique default constraint | `bankDetails.type.object` and card equivalent don't match direct client fields; absent barrel export; no gateway token relationship. 005,011,024 |
| Attendance | Job/worker/customer/date; check times/hours/status/wage/approver | jobId/workerId/date/status, no unique workday key | Exact timestamp lookup races, no negative-hours validation; needs timezone/workday semantics and approval separation. 013,024 |
| Dispute | Job/raisedBy/reason/description/images; resolution actor/date | jobId/raisedBy/status/createdAt | Dispute + job change partial writes; mobile evidence/status shape drift; no evidence history or refund linkage. 013,028 |
| Commission | category string, type/value/isActive | category/isActive | Nondeterministic category/default `$or` findOne; rule currency/bounds/effective dates absent. 002,019 |
| PromoCode | unique code, description/type/value, usage/date/category limits | code/isActive/startDate+endDate | No atomic redemption ledger or application flow; invalid date ordering/percentage bounds; public active query ignored. 019,024 |

Model barrel exports 12 entries and omits PaymentMethod. Routes use `.populate(...).lean()` for list responses, but populated entity shape differs from both platform views. API DTOs should explicitly map relations and avoid exposing complete persistence objects.

## Migration plan, never automatic deletion (TASK-024)

1. Take and restore-test a backup; inventory existing fields/indexes and record counts on staging. Search duplicate normalized phone/email, profile userId, attendance workday and provider/event/idempotency keys. Report counts without sensitive payloads. No actual duplicate claim is made now.
2. Decide OTP-only versus password credential rules before changing User.password. Do not bulk generate known passwords or erase valid hashes. Backfill explicit credential capability and verified-phone state only from trustworthy evidence.
3. Add fields/indexes first, retaining compatibility. Deduplicate with reviewed mappings before unique constraints. Profile userId should normally be unique. Attendance uniqueness requires job+worker+normalized business day, or a shift identifier if multiple shifts are allowed. Financial uniqueness requires provider event/order keys and a documented partial uniqueness policy for settled payments, not blindly unique jobId that forbids retries.
4. Choose integer minor units/currency or exact decimal representation; audit existing money precision and reconcile totals before conversion. Link payouts and adjustments to ledger sources. Preserve historical rule versions.
5. Add compound indexes matched to observed queries, e.g. participant/status/createdAt for jobs and payments, participant/date for attendance. Confirm with explain on representative staging data; do not add every possible index speculatively.
6. Use transaction-capable MongoDB topology for multi-document invariants; add idempotency/recovery where provider calls cannot be transactional. Introduce status/audit history and reference-safe archival; do not blanket-delete historical categories/promos/users.
7. Verify counts/relationships/totals after backfill, staged deploy with old/new compatible readers, rollback rehearsal and monitoring. Remove old fields only in a later documented change with explicit data retention decisions.

No evidence supports the earlier generic claim that indexes or validation are entirely absent: many single-field indexes, enums, required fields and some unique constraints already exist. The problem is missing domain/transactional enforcement and query-specific guarantees.
