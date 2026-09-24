# Role and permission matrix

Actual model roles: customer, worker, contractor, admin. No shop/retailer/agent role. Existing middleware verifies JWT signature then compares strings; requireRole helper is not used by the observed handlers. This report separates **current exposure** from the **proposed policy**.

Current: users/analytics restricted to admin; category/promo writes and dispute resolution restricted to admin; worker profile creation requires worker. Jobs/project/attendance/dispute creation and most business mutations require only authentication. Worker self-update has no field allowlist. Public workers expose private profile data. Jobs/payments are unscoped for contractor, projects unscoped for worker, and missing User lookups can remove intended list filters. Payment-method read is self-scoped but delete is not. TASK-001–004/006.

## Proposed policy to implement and test

`own` means ownership/assigned participation verified by server, not an ID in the request. `review` means administrative decision with audit. Dash = denied/not applicable. Destructive historical operations should normally archive rather than delete.

| Role → module | View | Create | Update | Delete | Approve | Special actions |
| --- | --- | --- | --- | --- | --- | --- |
| Guest → catalog/discovery | Public safe active DTO | — | — | — | — | Request/verify own OTP with limits |
| Customer → profile/addresses/methods | Own | Own address/method | Allowlisted own | Own address/method | — | Change credentials, revoke sessions |
| Customer → jobs | Own | Own request | Own allowed transition/fields | — | Charges/completion on own job | Cancel per policy, pay server-priced job, review completed job |
| Customer → projects | Own | Own project request | Own allowed fields | — | Own milestones | Provider-verified milestone payment |
| Customer → disputes/attendance | Own participation | Dispute own job | Own evidence | — | Attendance only if explicitly required by product policy | No wage override by default |
| Worker → profile | Own private + public | One own profile | Skills/rates/availability/docs allowlist | — | — | Submit KYC; never self-verify or edit aggregates |
| Worker → jobs | Assigned/explicit offered subset | — | Assigned allowed transition | — | — | Accept/reject offer, start with OTP, request completion/charges |
| Worker → attendance/earnings | Own | Own assigned check-in | Own permitted check-out | — | — | See reconciled payout history, dispute own job |
| Contractor → profile/projects | Own | Own profile; project offer if specified | Assigned project fields | — | — | Submit quotation/milestone evidence; no unrestricted job/payment read |
| Admin → users/KYC | Restricted private DTO | Authorized provisioning | Account status/role through explicit actions | Archive per policy | KYC review | Reset/revoke through controlled flow; never view hashes/OTPs |
| Admin → catalog/promos/settings | All | Yes | Validated/versioned | Reference-safe archive | Campaign/config review as needed | No direct unvalidated financial rule writes |
| Admin → jobs/projects/disputes | All justified operational data | On-behalf only with explicit policy | Audited transitions | — | Dispute/milestone decisions | Assignment, cancellation, evidence review |
| Admin → attendance/financial ops | Audited operational view | Adjustment request | Audited adjustment | — | Wage/payout/refund approvals | Provider reconciliation; never fabricate paid status |
| All authenticated → chat/notifications | Own/job participants | Authorized message/token registration | Own read/preferences | Own device registration | — | No arbitrary room joining/recipient access |

Implementation: define permission keys (`job.view`, `job.transition`, `worker.review`, `attendance.approve`, `payment.initiate`, `payment.refund`, etc.), map roles centrally, then apply per-resource policy and field allowlists. Resolve current active principal before `can(user, permission)`. Reject unsupported roles by default in APIs and navigation. Log sensitive decisions with actor, target, previous/new permitted values, timestamp and redacted request context. TASK-003/004/006/028.

Tests must cover every proposed grant and denial plus two distinct owners per role. Policies involving customer wage approval, contractor creation, on-behalf admin operations and shop scope are explicit product decisions; do not silently grant broad access while waiting for those decisions. TASK-031 records these decisions without blocking remediation of existing IDOR.
