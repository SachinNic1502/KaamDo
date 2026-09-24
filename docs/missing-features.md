# Missing and incomplete capabilities

These findings reflect repository implementation, not promises inferred from README/PRD. They are development decisions, not permission to add an unrelated loan/retail product.

| Capability | What exists | What is missing / task |
| --- | --- | --- |
| Web login/protected admin/logout | Auth API, token helpers, shell | Working web session UI, role guard, session-expired flow and logout. 006,014 |
| SMS/OTP registration | Redis storage/verification | Delivery adapter, valid credential model, safe enrollment, resend/abuse semantics. 007 |
| Refresh/recovery/device sessions | JWT helper functions | Refresh rotation/revocation/current principal, lost-password flow if password product retained, session inventory. 006 |
| Worker onboarding | Model + worker POST | Safe customer-to-worker application, KYC upload/review screens, bank/skills/areas/availability editing. 018 |
| Contractor/shop experience | Contractor model and static admin page | Contractor CRUD/profile workflow; independent mobile flows absent. Shop role/product not specified. 019,031 |
| Assignment/quotations | Match count and job pricingModel | Offers/delivery/accept arbitration, quote records/history/compare/accept. 012,019 |
| Job status history/receipts | Status/times on Job | Auditable transitions, reliable OTP lifecycle, approved charge/material calculation, invoices. 012,017,028 |
| Financial settlement | Payment/Payout models and SDK client | Provider order/verify/webhook, refund reconciliation, payout beneficiary verification/processing/history, ledger/source links. 002,017 |
| Addresses/profile preferences | User profile type helpers/menu labels | Authorized self-profile/address API/UI and persisted notification settings. 018,019 |
| Push/inbox | Expo registration/listeners, static screen | Supported token endpoint/model, server sender/outbox, durable inbox/read state/deep links. 023 |
| Chat | Socket client/screen | Authorized server rooms, message persistence/history, delivery acknowledgments/reconnect deduplication. 023 |
| Uploads/KYC | Picker/direct unsigned preset | Authenticated signed upload/size/type controls, private documents, usable fallback. 018 |
| Attendance/location | Client GPS and record model | Compatible check-in/out endpoints, assignment policy, server validation/geofence, timezone/shift rules. 013 |
| Promotions/reviews | Schemas/models and screens | Customer validation/redemption, usage accounting, authorized completed-job review and worker aggregates. 019 |
| Settings/commission | Static UI, Commission model | Authorized versioned persistence and deterministic effective-rule lookup. 019 |
| Admin details/actions | Lists and hooks | User/job/project/dispute detail/actions, category edit, contractor CRUD, export controls. 016,019 |
| Operations | Scripts/env example | CI/checks, structured/audit logging, dependency health, durable event jobs, rollback/backup proof, native release profiles. 027–030 |

Build the approved minimum end-to-end service flow first: onboard → discover → create → assign → accept → verify start → record work → approve completion → provider payment → reconciled payout/review. Hide or clearly disable unfinished features instead of supplying fake data/success. Feature absence alone is not always a defect: customer web and a separate shop app require an explicit release scope decision in TASK-031.
