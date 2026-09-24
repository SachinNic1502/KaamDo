# KaamDo Development Plan

> Implementation progress: [Phase 2 HTTP security containment](docs/phase-2-progress.md) records the first fixes, tests, temporary write restrictions and remaining work. The original audit snapshot and task acceptance criteria below are preserved; tasks are not considered fully complete until their remaining criteria pass.

> Audit update (2026-09-21): the original plan below is preserved as historical context. Use the **Verified audit task register** later in this file and [codebase audit](docs/codebase-audit.md) for current findings. The system is not production-ready; both TypeScript checks failed. Phase 1 produced documentation only, and TASK-001 through TASK-032 remain open. Claims below such as absent rate limiting, absent indexes, absent strict mode and fallback JWT secrets are superseded where contradicted by the verified reports.

## Executive Summary

This development plan outlines the current state of the KaamDo codebase, identifies critical issues, missing features, and provides a prioritized roadmap for improvements. The project is a service marketplace connecting customers with workers/technicians, built with Next.js (web admin), React Native/Expo (mobile), and MongoDB.

---

## Current State Analysis

### ✅ **Implemented Features**

#### Web Admin Panel
- Basic dashboard with analytics
- User management (customers, workers, contractors)
- Service category management
- Job management interface
- Payment/transaction tracking
- Dispute management interface
- Attendance tracking
- Promotion management
- Basic authentication with JWT
- Responsive UI with shadcn/ui components

#### Mobile App
- OTP-based authentication
- Customer app with home, search, job creation, jobs list, profile
- Worker app with dashboard, jobs, earnings, profile
- Basic navigation with React Navigation
- Redux Toolkit for state management
- TanStack Query for API calls
- Basic screens for chat, notifications, rating, disputes, promo codes

#### Backend/API
- RESTful API structure
- MongoDB models for core entities
- Authentication middleware
- Basic validation with Zod
- OTP generation and verification
- Job creation and status updates
- Payment processing logic
- Commission calculation
- Basic dispute handling

---

## 🚨 **Critical Issues & Bugs**

### 1. **Security Vulnerabilities**

#### High Priority
- **Hardcoded JWT Secret**: Default secret in <ref_file file="E:\Working Project\KaamDo\web\src\lib\auth.ts" lines="3" />
- **In-Memory OTP Storage**: OTPs stored in Map <ref_file file="E:\Working Project\KaamDo\web\src\app\api\auth\route.ts" lines="13" /> - lost on server restart
- **No Rate Limiting**: API endpoints lack rate limiting protection
- **Missing Input Sanitization**: Direct use of user input in regex queries
- **No CSRF Protection**: Missing CSRF tokens for state-changing operations

#### Medium Priority
- **Weak Password Requirements**: User model has password field but no validation
- **No API Key Validation**: Payment provider keys not validated before use
- **Missing CORS Configuration**: No explicit CORS settings

### 2. **Authentication & Authorization Issues**

- **No Admin Creation Mechanism**: No way to create initial admin account
- **Missing Role-Based Access Control**: Some endpoints check role but not comprehensive
- **No Session Management**: JWT tokens can't be revoked
- **Missing MFA**: No multi-factor authentication for admin accounts
- **No Password Reset Flow**: No forgot password functionality

### 3. **Data Integrity Issues**

- **Missing Database Indexes**: Some queries lack proper indexing
- **No Transaction Support**: Payment operations not wrapped in transactions
- **Missing Unique Constraints**: Potential duplicate data issues
- **No Data Validation**: Some fields lack proper validation
- **Missing Soft Deletes**: Hard deletes prevent audit trails

### 4. **API & Backend Issues**

- **Inconsistent Error Handling**: Mix of error response formats
- **Missing Request Validation**: Some endpoints skip validation
- **No API Versioning**: Breaking changes will break clients
- **Missing Request Logging**: No audit trail for API calls
- **No Pagination Limits**: Can fetch unlimited data

### 5. **Mobile App Issues**

- **Missing Error Boundaries**: App crashes on unhandled errors
- **No Offline Support**: App requires constant connectivity
- **Missing Push Notifications**: Notification infrastructure not implemented
- **No Background Sync**: Data doesn't sync in background
- **Missing Location Services**: GPS features not implemented
- **Incomplete Razorpay Integration**: Payment flow not complete
- **No Socket.IO Implementation**: Real-time chat not working

### 6. **Frontend Issues**

- **Missing Loading States**: Some UI elements lack loading indicators
- **No Error Handling**: API errors not properly displayed to users
- **Missing Form Validation**: Client-side validation incomplete
- **No Accessibility Features**: Missing ARIA labels and keyboard navigation
- **Performance Issues**: Large component re-renders

---

## 🎯 **Missing Features (PRD Requirements)**

### Customer App
- ❌ Address management (save/edit/delete addresses)
- ❌ Service detail pages with pricing
- ❌ Worker profile viewing with ratings/reviews
- ❌ Quotation comparison system
- ❌ Real-time job tracking with map
- ❌ In-app chat with workers
- ❌ Razorpay payment integration
- ❌ Invoice download
- ❌ Booking history with filters
- ❌ Rebook functionality
- ❌ Promo code application
- ❌ Notification preferences

### Worker App
- ❌ Worker registration/onboarding flow
- ❌ KYC document upload
- ❌ Skills and experience management
- ❌ Service area configuration
- ❌ Pricing model setup
- ❌ Availability calendar
- ❌ Bank/UPI details setup
- ❌ Job request acceptance/rejection
- ❌ Navigation to customer location
- ❌ OTP-based work start verification
- ❌ Additional charge request workflow
- ❌ Material cost entry
- ❌ Work completion request
- ❌ Attendance check-in/out
- ❌ Earnings breakdown
- ❌ Payout history
- ❌ Reviews viewing

### Admin Panel
- ❌ Customer management pages
- ❌ Worker management with KYC approval
- ❌ Contractor management
- ❌ Service subcategory management
- ❌ Individual job detail pages
- ❌ Project management interface
- ❌ Quotation management
- ❌ Transaction detail pages
- ❌ Payout processing interface
- ❌ Commission rule configuration
- ❌ Refund processing
- ❌ Dispute resolution workflow
- ❌ Attendance monitoring with GPS
- ❌ Analytics dashboard with charts
- ❌ Reports generation
- ❌ Settings configuration
- ❌ Notification management
- ❌ Service area management

### Backend/API
- ❌ Socket.IO server for real-time chat
- ❌ Firebase integration for push notifications
- ❌ Cloudinary integration for file uploads
- ❌ Google Maps integration for location services
- ❌ Razorpay payment gateway integration
- ❌ Email service integration
- ❌ SMS service integration
- ❌ Worker matching algorithm
- ❌ Automatic payout processing
- ❌ Invoice generation
- ❌ Attendance geofencing
- ❌ Milestone-based project payments
- ❌ Promo code validation logic
- ❌ Review aggregation
- ❌ Analytics data aggregation

---

## 📋 **Prioritized Development Roadmap**

### **Phase 1: Critical Security & Infrastructure (Week 1-2)**

#### Priority: 🔴 Critical

1. **Security Hardening**
   - [ ] Move JWT secret to environment variables
   - [ ] Implement Redis for OTP storage
   - [ ] Add rate limiting to all API endpoints
   - [ ] Implement input sanitization middleware
   - [ ] Add CSRF protection
   - [ ] Implement proper password hashing
   - [ ] Add API key validation
   - [ ] Configure CORS properly

2. **Authentication Overhaul**
   - [ ] Create admin seed script for initial setup
   - [ ] Implement comprehensive RBAC
   - [ ] Add JWT refresh token mechanism
   - [ ] Implement MFA for admin accounts
   - [ ] Add password reset flow
   - [ ] Implement session management

3. **Database Improvements**
   - [ ] Add missing database indexes
   - [ ] Implement database transactions for payments
   - [ ] Add unique constraints where needed
   - [ ] Implement soft delete pattern
   - [ ] Add data validation at model level

### **Phase 2: Core Backend Features (Week 3-4)**

#### Priority: 🟠 High

1. **Real-time Features**
   - [ ] Implement Socket.IO server
   - [ ] Create chat API endpoints
   - [ ] Implement real-time job status updates
   - [ ] Add presence system

2. **File Upload & Storage**
   - [ ] Integrate Cloudinary
   - [ ] Create file upload API endpoints
   - [ ] Add image validation
   - [ ] Implement file size limits

3. **Location Services**
   - [ ] Integrate Google Maps API
   - [ ] Implement geocoding service
   - [ ] Add distance calculation
   - [ ] Create location-based search

4. **Payment Integration**
   - [ ] Integrate Razorpay
   - [ ] Implement payment webhooks
   - [ ] Add refund processing
   - [ ] Create payout automation

5. **Notification System**
   - [ ] Integrate Firebase Cloud Messaging
   - [ ] Create notification service
   - [ ] Implement notification templates
   - [ ] Add notification preferences

### **Phase 3: Worker App Core Features (Week 5-6)**

#### Priority: 🟡 Medium

1. **Worker Onboarding**
   - [ ] Create registration flow screens
   - [ ] Implement KYC document upload
   - [ ] Add skills selection interface
   - [ ] Create service area selector
   - [ ] Build pricing configuration
   - [ ] Add availability calendar
   - [ ] Implement bank details setup

2. **Job Management**
   - [ ] Implement job request notifications
   - [ ] Create job acceptance/rejection flow
   - [ ] Add navigation integration
   - [ ] Implement OTP work start verification
   - [ ] Build additional charge request
   - [ ] Add material cost entry
   - [ ] Create completion request flow

3. **Attendance System**
   - [ ] Implement GPS check-in/out
   - [ ] Add geofencing validation
   - [ ] Create attendance history
   - [ ] Build attendance approval flow

4. **Earnings & Payouts**
   - [ ] Create earnings dashboard
   - [ ] Implement payout history
   - [ ] Add bank account management
   - [ ] Build payout request flow

### **Phase 4: Customer App Core Features (Week 7-8)**

#### Priority: 🟡 Medium

1. **Service Discovery**
   - [ ] Enhance category browsing
   - [ ] Add service detail pages
   - [ ] Implement worker profiles
   - [ ] Create rating/review display
   - [ ] Add search filters

2. **Job Creation Flow**
   - [ ] Multi-step form improvement
   - [ ] Add image upload
   - [ ] Implement address management
   - [ ] Add scheduling interface
   - [ ] Create price estimation

3. **Job Management**
   - [ ] Real-time job tracking
   - [ ] Implement map integration
   - [ ] Add in-app chat
   - [ ] Create payment flow
   - [ ] Implement invoice download
   - [ ] Add booking history

4. **Communication**
   - [ ] Implement chat interface
   - [ ] Add push notifications
   - [ ] Create notification center
   - [ ] Build message history

### **Phase 5: Admin Panel Enhancement (Week 9-10)**

#### Priority: 🟢 Normal

1. **User Management**
   - [ ] Customer management pages
   - [ ] Worker management with KYC
   - [ ] Contractor management
   - [ ] User detail pages
   - [ ] Bulk actions

2. **Service Management**
   - [ ] Subcategory management
   - [ ] Service area configuration
   - [ ] Pricing model setup
   - [ ] Bulk import/export

3. **Job & Project Management**
   - [ ] Job detail pages
   - [ ] Project management interface
   - [ ] Quotation management
   - [ ] Bulk job operations

4. **Financial Management**
   - [ ] Transaction detail pages
   - [ ] Payout processing interface
   - [ ] Commission configuration
   - [ ] Refund processing
   - [ ] Financial reports

5. **Analytics & Reports**
   - [ ] Enhanced dashboard with charts
   - [ ] Custom report builder
   - [ ] Export functionality
   - [ ] Scheduled reports

### **Phase 6: Advanced Features (Week 11-12)**

#### Priority: 🔵 Low

1. **Advanced Matching**
   - [ ] Implement worker matching algorithm
   - [ ] Add skill-based matching
   - [ ] Implement rating-based sorting
   - [ ] Add availability matching

2. **Project Management**
   - [ ] Milestone management
   - [ ] Progress tracking
   - [ ] Document sharing
   - [ ] Team collaboration

3. **Promotions & Marketing**
   - [ ] Promo code validation
   - [ ] Campaign management
   - [ ] Referral system
   - [ ] Analytics tracking

4. **Quality Assurance**
   - [ ] Automated testing setup
   - [ ] E2E test suite
   - [ ] Performance monitoring
   - [ ] Error tracking integration

---

## 🛠️ **Technical Debt & Refactoring**

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] Implement ESLint rules enforcement
- [ ] Add Prettier configuration
- [ ] Create code style guide
- [ ] Add pre-commit hooks

### Architecture
- [ ] Implement repository pattern
- [ ] Add service layer abstraction
- [ ] Create proper error handling middleware
- [ ] Implement caching strategy
- [ ] Add API versioning

### Testing
- [ ] Add unit tests for utilities
- [ ] Create API integration tests
- [ ] Add component tests
- [ ] Implement E2E tests
- [ ] Add performance tests

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component documentation
- [ ] Deployment guides
- [ ] Troubleshooting guides
- [ ] Onboarding documentation

---

## 📊 **Success Metrics**

### Technical Metrics
- [ ] 90%+ test coverage
- [ ] <2s API response time
- [ ] 99.9% uptime
- [ ] Zero critical security vulnerabilities
- [ ] <100ms mobile app load time

### Business Metrics
- [ ] User registration flow completion rate >80%
- [ ] Job creation success rate >95%
- [ ] Payment success rate >99%
- [ ] Average rating >4.5/5
- [ ] Dispute rate <5%

---

## 🚀 **Deployment Strategy**

### Development Environment
- [ ] Set up staging environment
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing in pipeline
- [ ] Configure environment-specific configs

### Production Deployment
- [ ] Set up production database
- [ ] Configure CDN for static assets
- [ ] Implement backup strategy
- [ ] Add monitoring and alerting
- [ ] Configure SSL certificates
- [ ] Set up load balancing

---

## 📝 **Notes**

- This plan assumes a team of 2-3 developers working full-time
- Timelines are estimates and may vary based on complexity
- Regular code reviews and testing should be conducted throughout
- Stakeholder feedback should be incorporated at the end of each phase
- Security audits should be conducted before production deployment

---

## 🔗 **References**

- Product Requirements Document: <ref_file file="E:\Working Project\KaamDo\docs\project_prd.md" />
- Tech Stack Documentation: <ref_file file="E:\Working Project\KaamDo\README.md" />
- Next.js Documentation: https://nextjs.org/docs
- Expo Documentation: https://docs.expo.dev
- MongoDB Documentation: https://docs.mongodb.com

---

**Last Updated:** 2026-09-21
**Status:** Ready for Implementation
**Next Review:** After Phase 1 Completion


---

# Verified audit task register — 2026-09-21

This section is the implementation plan derived from the current source audit. **It supersedes conflicting assertions and estimates above; earlier user-authored content is preserved.** Phase 1 is documentation only. Tasks below remain open; no application fixes are claimed. Read [the audit](docs/codebase-audit.md) and [dependency roadmap](docs/development-roadmap.md) first. P0 items precede P1/P2/P3; explicit dependencies govern execution within a priority group. A higher-numbered foundation may need to run first (005 build, 006 principal, 024 migration design, 029 fixtures). No destructive database change or deployment is performed by this plan.

## TASK-001 — Remove public private-data exposure

Priority: P0
Platform: API
Module: Discovery and job data
Dependencies: None; immediate containment
Status: Open

Problem:
Public worker GET returns entire bank/document profile with contact fields; job list includes OTP fields.

Current:
Public GET → full persistence records

Expected:
Role-scoped query → explicit public/private DTO

Files:
- `web/src/app/api/workers/route.ts`
- `web/src/app/api/jobs/route.ts`
- `web/src/lib/models/worker-profile.model.ts`

Required Work:
- Allowlist public worker fields and eligible status
- separate self/admin private views
- remove OTPs from list DTOs
- add two-role projection tests.

Acceptance Criteria:
- Anonymous worker response contains no bank/KYC/private contact data
- job list never leaks OTPs to unauthorized actors
- authorized discovery remains usable.

## TASK-002 — Replace fabricated payment settlement

Priority: P0
Platform: API + Mobile
Module: Payments
Dependencies: Immediate disable/contain unsafe success path; full implementation depends on 003,009,012,024,029
Status: Open

Problem:
POST can mark a completed job paid without gateway evidence; multi-document writes race; mobile swallows verification failure.

Current:
Authenticated POST → completed Payment + paid Job + placeholder Payout

Expected:
Authorized server-priced order → verified provider event → idempotent ledger/transaction → truthful UI

Files:
- `web/src/app/api/payments/route.ts`
- `web/src/lib/models/payment.model.ts`
- `web/src/lib/models/payout.model.ts`
- `mobile/src/services/payment.ts`

Required Work:
- Reject unsupported actions
- add provider sandbox order/verify/webhook adapter
- verify amount/currency/owner
- deterministic commission
- idempotency keys and transactional/recoverable writes
- verified beneficiaries
- redact secrets.

Acceptance Criteria:
- Forged/wrong-owner/wrong-amount/replayed events cannot settle money
- concurrent requests settle once
- partial failure recovers
- client never shows success after failed verification.

## TASK-003 — Enforce resource ownership and role policy

Priority: P0
Platform: API
Module: Authorization
Dependencies: 006 for current principal; containment can precede refactor
Status: Open

Problem:
Authenticated users can mutate unrelated records or approve wages; list scopes fail open for unsupported/missing users.

Current:
JWT present → findById → mutate

Expected:
Current principal → permission + resource scope → allowed mutation

Files:
- `web/src/lib/auth-middleware.ts`
- `web/src/app/api/jobs/route.ts`
- `web/src/app/api/projects/route.ts`
- `web/src/app/api/attendance/route.ts`
- `web/src/app/api/disputes/route.ts`
- `web/src/app/api/payment-methods/route.ts`
- `web/src/app/api/payments/route.ts`

Required Work:
- Implement centralized permission map and ownership predicates
- deny unsupported roles
- use immutable userId scopes
- owner-scoped method deletion
- explicit attendance approver policy
- tests for all matrix grants/denials.

Acceptance Criteria:
- Two distinct owners cannot read/mutate each other's private data
- worker/contractor exceptions are denied
- deleted principal never receives global lists
- admin actions remain audited.

## TASK-004 — Separate worker self-edit from KYC decisions

Priority: P0
Platform: API + Web
Module: Worker verification
Dependencies: 003,006
Status: Open

Problem:
Worker PATCH accepts verification, ownership and aggregate fields supplied by the caller.

Current:
Own userId → unrestricted update

Expected:
Permission-specific schema → allowlisted fields → audited review

Files:
- `web/src/app/api/workers/route.ts`
- `web/src/lib/validations.ts`
- `web/src/app/admin/services/kyc/page.tsx`

Required Work:
- Allow only legitimate self-edit fields
- admin-only status decision with reason/history
- reject operator keys and aggregate writes
- preserve submitted/verified transitions.

Acceptance Criteria:
- Worker cannot self-verify, change owner or edit rating/earnings
- admin approval/rejection uses correct user/profile identifier and records actor/reason.

## TASK-005 — Restore web and mobile compilation

Priority: P1
Platform: Web + Mobile + API
Module: Build baseline
Dependencies: None; preserve existing working-tree changes
Status: Open

Problem:
Observed TypeScript checks fail; source also has missing exports/types and copied cross-platform assumptions.

Current:
Parse/type errors → no reliable release artifact

Expected:
Valid platform-native imports/JSX/types → repeatable check/build

Files:
- `web/src/app/page.tsx`
- `web/src/components/features/FeaturesSection.tsx`
- `web/src/components/header/Header.tsx`
- `web/src/store/index.ts`
- `web/src/lib/models/index.ts`
- `web/src/hooks/use-payment-methods.ts`
- `mobile/src/screens/auth/OtpScreen.tsx`
- `mobile/src/screens/common/SettingsScreen.tsx`

Required Work:
- Repair malformed JSX/imports
- correct web session assumptions
- export PaymentMethod
- resolve hook types and worker filter schema fields
- implement declared OTP handlers
- use pressable settings controls and correct thunk payload
- read required local/versioned framework docs before application edits.

Acceptance Criteria:
- Both tsc commands pass without suppressions
- web lint/build passes
- no mobile-only import added to web to mask an architectural mismatch
- further errors surfaced after parse repair are resolved.

## TASK-006 — Make sessions respect current account state

Priority: P1
Platform: API + Web + Mobile
Module: Authentication
Dependencies: 005,029 fixtures
Status: Open

Problem:
JWT claims bypass current account status; restore trusts stale local data; no revocation/refresh flow despite helpers.

Current:
Saved token/role → authorized until expiry

Expected:
Validated active principal + session policy → scoped authorization

Files:
- `web/src/lib/auth.ts`
- `web/src/lib/auth-middleware.ts`
- `web/src/app/api/auth/route.ts`
- `mobile/src/store/authSlice.ts`

Required Work:
- Validate active/deleted/changed-role users
- choose session/version/revocation model
- implement refresh rotation/reuse controls if retained
- password change and logout revoke
- define recovery and privileged-auth policy
- remove unused mandatory secrets only with migration.

Acceptance Criteria:
- Disabled/deleted/role-changed sessions fail immediately as designed
- expiry/revocation/reuse tested
- password change invalidates old sessions
- no permanent loader on invalid stored credentials.

## TASK-007 — Complete secure OTP delivery and enrollment

Priority: P1
Platform: API + Mobile
Module: OTP
Dependencies: 005,006,010; provider sandbox configuration
Status: Open

Problem:
OTP is logged rather than delivered; new User lacks required password; verification read/write/delete is racy; process limiter easy to fragment.

Current:
Generate/log → Redis → incomplete registration

Expected:
Secure code → atomic bounded store → provider delivery → one-time verification → valid account

Files:
- `web/src/app/api/auth/route.ts`
- `web/src/lib/auth.ts`
- `web/src/lib/services/redis-client.ts`
- `web/src/lib/middleware/rate-limit.ts`
- `web/src/lib/models/user.model.ts`
- `mobile/src/screens/auth/OtpScreen.tsx`

Required Work:
- Cryptographic code generation
- redact OTPs
- delivery errors truthful
- atomic consume/attempts/TTL
- per-phone and trusted-IP distributed limits
- compatible passwordless account model
- normalize phones
- resend countdown and separate bootstrap/request loading.

Acceptance Criteria:
- Fresh account can log in with delivered code
- expired/wrong/concurrently reused OTP denied
- unavailable Redis/SMS never reports sent
- no OTP/phone pair in logs
- enrollment cannot grant admin.

## TASK-008 — Protect privileged user data and provisioning

Priority: P1
Platform: API + Operations
Module: User credentials
Dependencies: 006,010
Status: Open

Problem:
Users endpoint serializes password hashes; unrestricted updates can bypass credential rules; seed uses/logs known credential.

Current:
User document → API/log; raw update → credential field

Expected:
Safe DTO + explicit credential commands + secure provisioning

Files:
- `web/src/app/api/users/route.ts`
- `web/src/lib/models/user.model.ts`
- `web/scripts/seed-admin.ts`

Required Work:
- Exclude credentials in model/query and DTO
- forbid generic password writes
- bootstrap from protected input/env without echo
- rotate any deployed default
- test admin privilege changes and audit histories.

Acceptance Criteria:
- No hash/password appears in responses/logs
- ordinary updates cannot set raw passwords or bypass validation
- seed has no fixed password
- existing hashes preserved.

## TASK-009 — Align cross-platform DTOs and core job contracts

Priority: P1
Platform: Web + Mobile + API
Module: API contracts
Dependencies: 003,005,010; coordinate 026
Status: Open

Problem:
Auth id/_id differs; detail GET returns list; create payload and result shape conflict; populated fields mapped incorrectly.

Current:
Screen-specific guessed shapes → incompatible endpoint

Expected:
Shared runtime contract → validated request → explicit DTO → typed view

Files:
- `mobile/src/hooks/use-api.ts`
- `mobile/src/types/index.ts`
- `web/src/types/index.ts`
- `web/src/app/api/jobs/route.ts`
- `mobile/src/screens/customer/CreateJobScreen.tsx`
- `mobile/src/screens/customer/JobDetailScreen.tsx`
- `mobile/src/screens/worker/JobDetailScreen.tsx`
- `mobile/src/store/authSlice.ts`

Required Work:
- Choose canonical IDs
- implement authorized detail contract
- align category/subcategory/images/address/date/pricing payload and create response
- fix nested worker/customer fields
- contract tests and error/empty states.

Acceptance Criteria:
- Customer creates a valid job and both roles open its correct details
- bad ID returns safe 400/404
- no list-as-object casts or invented assigned state
- user ID stable after login/restore.

## TASK-010 — Standardize validation, errors and list semantics

Priority: P1
Platform: API + Clients
Module: API foundation
Dependencies: 005,003
Status: Open

Problem:
Thrown auth/schema failures become 500; raw updates/regex and missing filter schema create unsafe or ignored behavior.

Current:
Handler-specific parsing/catch → generic error or ignored parameter

Expected:
Central typed errors + request schemas + explicit DTO envelope

Files:
- `web/src/lib/api-response.ts`
- `web/src/lib/validations.ts`
- `web/src/app/api`
- `web/src/lib/api-client.ts`
- `mobile/src/api/client.ts`

Required Work:
- Adopt success/data/message and safe error message/code with compatibility adapter
- validate ObjectIds/date bounds/integers/enum transitions
- forbid unknown update/operator fields
- escape literal search
- allowlist sort
- add worker price/rating and active filters deliberately.

Acceptance Criteria:
- 401/403/400/404/409/429/503 deterministic
- no stack/DB details
- existing pagination stays capped
- invalid filters rejected rather than silently ignored
- clients handle non-JSON/empty errors safely.

## TASK-011 — Repair saved payment-method contracts

Priority: P1
Platform: Web + API
Module: Payment methods
Dependencies: 003,005,010,024
Status: Open

Problem:
Missing export, mismatched nested fields, missing PATCH, token omitted and double response unwrap.

Current:
Unattached hook → unsupported/default operation

Expected:
Owner-authorized CRUD/default command → correct DTO/schema

Files:
- `web/src/app/api/payment-methods/route.ts`
- `web/src/lib/models/payment-method.model.ts`
- `web/src/hooks/use-payment-methods.ts`

Required Work:
- Use provider tokens/display metadata only
- fix schema shape via additive migration
- attach auth
- single data unwrap
- implement atomic default selection and scoped delete
- wire only approved settings UI.

Acceptance Criteria:
- Two users isolated
- no raw card credential storage
- exactly permitted default state under concurrency
- correct 401/404/error handling
- existing bank data migration validated.

## TASK-012 — Enforce job lifecycle and business pricing

Priority: P1
Platform: API + Mobile + Web
Module: Jobs
Dependencies: 003,004,009,010,024
Status: Open

Problem:
No legal transition graph, incomplete OTP verification, arbitrary assignment and inconsistent additional charge/material/rating/price fields.

Current:
Client status/price → mutable document

Expected:
Actor-authorized transition → invariant validation → history → server totals

Files:
- `web/src/app/api/jobs/route.ts`
- `web/src/lib/models/job.model.ts`
- `web/src/lib/validations.ts`
- `mobile/src/screens/worker/JobDetailScreen.tsx`
- `mobile/src/screens/customer/JobDetailScreen.tsx`

Required Work:
- Define offers/assignment/acceptance/rejection semantics
- validate category/subcategory and worker eligibility
- generate/consume completion OTP
- fix code length
- separate charge proposal/approval
- compute materials/prices server-side
- review only completed owned jobs.

Acceptance Criteria:
- Illegal/skipped/concurrent transitions denied
- absent OTP never passes
- charges require customer approval
- totals identical on both apps
- rating cannot reassign worker
- each action returns updated state.

## TASK-013 — Complete attendance, dispute and milestone invariants

Priority: P1
Platform: API + Mobile + Web
Module: Operational records
Dependencies: 003,009,010,012,024
Status: Open

Problem:
Location/check-out actions differ from API; disputes evidence/status drift; writes and milestone edits lack invariants.

Current:
Client action → unrelated schema or partial save

Expected:
Explicit operation → assignment/participant checks → validated atomic update

Files:
- `web/src/app/api/attendance/route.ts`
- `web/src/app/api/disputes/route.ts`
- `web/src/app/api/projects/route.ts`
- `mobile/src/services/attendance.ts`
- `mobile/src/services/dispute.ts`

Required Work:
- Align check-in/out/location DTO
- define workday/shift/timezone/geofence policy
- prevent negative hours and repeated approval
- persist evidence under canonical name
- enforce project dates/sums/milestone transitions
- atomic dispute/job changes.

Acceptance Criteria:
- Assigned worker check-in/out works
- unauthorized wage approval denied
- evidence survives retrieval
- partial failures don't leave mismatched status
- out-of-order milestones rejected.

## TASK-014 — Connect web authentication and admin navigation

Priority: P1
Platform: Web
Module: Admin shell
Dependencies: 005,006,008,010
Status: Open

Problem:
Admin shell unguarded, missing login, Sign In loops home and logout inert; sidebar links missing pages.

Current:
Visible shell → unauthenticated queries or dead links

Expected:
Login/session validation → authorized shell → valid routes → logout teardown

Files:
- `web/src/app/admin/layout.tsx`
- `web/src/components/admin/sidebar.tsx`
- `web/src/components/header/Header.tsx`
- `web/src/lib/api-client.ts`
- `web/src/components/providers.tsx`

Required Work:
- Build login and session-expired flow using chosen auth contract
- guard admin layout and APIs independently
- connect logout/cache cleanup
- point links to existing screens or implement scoped pages
- remove unsupported profile link.

Acceptance Criteria:
- Anonymous/non-admin navigation handled correctly
- no secrets in UI
- each sidebar item resolves
- logout prevents cached data/back-navigation disclosure
- both password/OTP policy behaviors covered.

## TASK-015 — Replace static dashboards and contractor data

Priority: P1
Platform: Web + API
Module: Analytics and contractors
Dependencies: 003,009,010,019,021
Status: Open

Problem:
Analytics/contractors are fabricated; main dashboard expects sections not returned.

Current:
Static arrays or missing fields → misleading display

Expected:
Scoped aggregates/contractor API → states → current data

Files:
- `web/src/app/admin/analytics/page.tsx`
- `web/src/app/admin/page.tsx`
- `web/src/app/admin/users/contractors/page.tsx`
- `web/src/app/api/analytics/route.ts`

Required Work:
- Provide date-bounded analytics/totals and actual recent activity/KYC queue if retained
- connect contractor list/stats
- remove no-op export or implement real export
- preserve legitimate labels.

Acceptance Criteria:
- No fabricated financial/customer/contractor records
- totals match fixture database across pages
- empty/error distinct
- date ranges and exports match displayed scope.

## TASK-016 — Complete admin users, categories, KYC, jobs and attendance UI

Priority: P1
Platform: Web
Module: Operational administration
Dependencies: 003,004,009,010,012,013,014
Status: Open

Problem:
Visible actions are inert; attendance casts envelope as array; KYC IDs/fields conflict.

Current:
List or fake action → no mutation/crash

Expected:
Action → validation/API → persisted change → invalidation/feedback

Files:
- `web/src/app/admin/users/page.tsx`
- `web/src/app/admin/services/categories/page.tsx`
- `web/src/app/admin/services/kyc/page.tsx`
- `web/src/app/admin/jobs/page.tsx`
- `web/src/app/admin/attendance/page.tsx`

Required Work:
- Unwrap attendance data and map proper fields
- implement KYC document review with correct identity
- connect user/job/category actions only to authorized operations
- pending/confirmation/errors
- server filtering/pagination and valid detail routes.

Acceptance Criteria:
- Each visible action tested end-to-end
- failed mutation keeps form/row state
- attendance no crash
- KYC approved row refreshes
- no duplicate submits or phantom success.

## TASK-017 — Render reconciled financial data on both platforms

Priority: P1
Platform: Web + Mobile + API
Module: Earnings, payouts and receipts
Dependencies: 002,009,012,024
Status: Open

Problem:
Payment rows mistaken for payouts; balances/today/week from one page; wrong price fields and inactive pending guard.

Current:
Visible page sum → supposed wallet/payout balance

Expected:
Server ledger aggregates → scoped transactions/payouts → receipts/status

Files:
- `web/src/app/admin/payments/page.tsx`
- `mobile/src/screens/worker/EarningsScreen.tsx`
- `mobile/src/screens/worker/DashboardScreen.tsx`
- `mobile/src/screens/customer/JobDetailScreen.tsx`
- `mobile/src/services/payment.ts`

Required Work:
- Expose authorized payout/refund/history/aggregate contracts
- define gross/net/held/available/paid-out semantics
- real payment pending and reconciliation polling
- invalidate jobs/payments/earnings/analytics after confirmed result
- implement invoice/receipt scope.

Acceptance Criteria:
- Balances reconcile across pages/refunds/payouts
- no provider failure shown as success
- pending blocks repeated checkout
- real receipt references match ledger and owner.

## TASK-018 — Finish profiles, onboarding, addresses and uploads

Priority: P1
Platform: Mobile + API
Module: Profile and discovery
Dependencies: 003,004,007,009,010,024
Status: Open

Problem:
Menus inert; self-profile uses admin endpoint; worker fields wrongly stored/read as User; upload fallback absent.

Current:
Local identity/URI → inert form or invalid API

Expected:
Authorized profile/onboarding DTO → signed storage → persisted metadata

Files:
- `mobile/src/screens/customer/ProfileScreen.tsx`
- `mobile/src/screens/worker/ProfileScreen.tsx`
- `mobile/src/screens/customer/SearchScreen.tsx`
- `mobile/src/screens/customer/CreateJobScreen.tsx`
- `mobile/src/services/upload.ts`
- `web/src/app/api/users/route.ts`
- `web/src/app/api/workers/route.ts`

Required Work:
- Own-profile/address contract
- worker enrollment/KYC/bank/skills/availability screens
- signed upload with type/size bounds/private KYC URLs
- upload before job/dispute submission
- remove invented identity
- wire menus and worker detail
- catalog-driven discovery.

Acceptance Criteria:
- Profile survives restart
- worker cannot self-approve
- customer edits own data only
- remote image accessible to authorized viewer
- invalid files/permissions/network failures recover without fake success.

## TASK-019 — Complete promotions, settings, contractors, quotes and reviews

Priority: P1
Platform: Web + Mobile + API
Module: Remaining business modules
Dependencies: 003,009,010,012,013,024,031 scope
Status: Open

Problem:
Forms close without saving; actions unsupported; config/preferences not persisted; project/dispute/quote flows lack UI/API pieces.

Current:
Static/local setting or incompatible action → apparent success

Expected:
Approved contract → durable validated business action → refreshed UI

Files:
- `web/src/app/admin/promotions/page.tsx`
- `web/src/app/admin/settings/page.tsx`
- `web/src/app/admin/jobs/projects/page.tsx`
- `web/src/app/admin/jobs/quotations/page.tsx`
- `web/src/app/admin/disputes/page.tsx`
- `mobile/src/services/promo.ts`
- `mobile/src/services/rating.ts`
- `mobile/src/screens/common/PromoScreen.tsx`
- `mobile/src/screens/common/SettingsScreen.tsx`

Required Work:
- Connect promo create/redeem and atomic usage
- canonical promo fields/active expiry
- actual clipboard
- persist preferences/settings/commission
- contractor CRUD
- project/milestone and dispute detail/resolution
- quote lifecycle and completed-job reviews
- implement chosen password recovery policy.

Acceptance Criteria:
- No no-op success
- settings rehydrate
- promo caps/expiry enforced concurrently
- quotes linked to jobs and accepted once
- review ratings aggregate correctly
- scope exclusions removed from visible UI.

## TASK-020 — Apply consistent responsive accessible UI

Priority: P2
Platform: Web + Mobile
Module: Design system
Dependencies: 005,014,016; iterate with feature modules
Status: Open

Problem:
Fixed sidebar, repeated ad hoc states/colors, unlabeled icon controls and unverified responsive behavior.

Current:
Screen-specific layout/states

Expected:
Existing primitives + shared semantic design specification

Files:
- `web/src/app/globals.css`
- `web/src/components/ui`
- `web/src/app/admin/layout.tsx`
- `web/src/components/admin/sidebar.tsx`
- `mobile/src/constants/index.ts`
- `mobile/src/screens`

Required Work:
- Implement UI audit token/spacing/typography/state rules
- small-screen sidebar/table/modal layouts
- labels/aria/focus/keyboard/confirmation
- native touch/dynamic-type/keyboard
- remove unsupported widgets and gratuitous effects only where evidenced.

Acceptance Criteria:
- Viewport matrix and keyboard/screen-reader tests pass
- no page overflow
- every asynchronous form has pending/error/success
- no gratuitous redesign of working logic.

## TASK-021 — Make filtering, pagination and summaries truthful

Priority: P2
Platform: Web + Mobile + API
Module: Data lists
Dependencies: 009,010,017,019
Status: Open

Problem:
Filtering/summing only first server page hides records and mislabels totals; mobile price/rating filters are local.

Current:
GET first page → local filter/sum

Expected:
Server-scoped filter/sort/page + aggregate → complete navigation

Files:
- `web/src/app/admin/jobs/quotations/page.tsx`
- `web/src/app/admin/jobs/projects/page.tsx`
- `web/src/app/admin/payments/page.tsx`
- `mobile/src/screens/customer/SearchScreen.tsx`
- `mobile/src/screens/customer/JobsScreen.tsx`
- `mobile/src/screens/worker/JobsScreen.tsx`
- `web/src/hooks/use-api.ts`
- `mobile/src/hooks/use-api.ts`

Required Work:
- Send all filters server-side incl pricingModel/date/rating
- reset page on change
- stable sort
- bounded/debounced search
- add next-page/load-more/empty states and metadata
- distinguish page counts from full aggregates.

Acceptance Criteria:
- Multi-page fixture has no missing/duplicate rows across filters
- totals correct
- mobile reaches all records without loading entire dataset
- requests bounded.

## TASK-022 — Handle mobile network, lifecycle and logout safely

Priority: P2
Platform: Mobile + Web clients
Module: Session and async state
Dependencies: 006,009,026
Status: Open

Problem:
No timeout/401/offline strategy; bootstrap failure can hang; query cache and sockets survive logout; GPS timers leak.

Current:
Fetch/local token → indefinite/stale state

Expected:
Bounded request → classified outcome → lifecycle-aware cache/session

Files:
- `mobile/src/api/client.ts`
- `mobile/src/store/authSlice.ts`
- `mobile/App.tsx`
- `mobile/src/navigation/AppNavigator.tsx`
- `mobile/src/services/attendance.ts`
- `mobile/src/services/chat.ts`
- `web/src/lib/api-client.ts`

Required Work:
- Separate bootstrap/request state
- rejected storage handling
- timeout/cancellation
- connectivity/AppState integration
- safe GET retry
- cancel+clear sensitive queries on logout, terminate sockets/GPS
- user-scoped keys
- rollback availability
- cross-platform charge modal.

Acceptance Criteria:
- Offline/timeout/expired token produce actionable states
- no infinite loader
- A→logout→B never sees A data
- unmount stops tracking
- repeated checkout never automatically retried
- Android/iOS controls usable.

## TASK-023 — Implement real notifications and chat or remove release entry points

Priority: P1
Platform: API + Mobile
Module: Communication
Dependencies: 003,018,022,028,031 scope
Status: Open

Problem:
Only clients/static inbox exist; unsupported token/history calls and no durable server.

Current:
Socket emit/static notifications → no verified delivery

Expected:
Authorized persisted event/message → acknowledgment → inbox/push → UI

Files:
- `mobile/src/services/notifications.ts`
- `mobile/src/services/chat.ts`
- `mobile/src/screens/common/ChatScreen.tsx`
- `mobile/src/screens/common/NotificationsScreen.tsx`
- `mobile/App.tsx`
- `mobile/app.json`
- `web/src/app/api`

Required Work:
- Message/token/inbox models and participant policies
- authenticated socket/history service
- delivery acknowledgment/dedup/read state
- reconnect
- push token lifecycle, sender/outbox/retry, deep links and persisted preferences
- configure project IDs.

Acceptance Criteria:
- Only participants access history/rooms
- sent text retained on failure
- no demo inbox
- read state persists
- push registration follows login and removal follows logout
- denied permissions handled.

## TASK-024 — Add safe data-integrity migrations

Priority: P1
Platform: Database + API
Module: Persistence
Dependencies: 005; plan before 002/012/013/017 implementation
Status: Open

Problem:
Missing uniqueness/idempotency/reference invariants; financial writes nontransactional; DTO/model mismatches.

Current:
Check-then-write → races/partial records

Expected:
Reviewed additive migration + constraints + transactions/recovery

Files:
- `web/src/lib/models`
- `web/src/lib/db.ts`
- `docs/database-audit.md`

Required Work:
- Execute documented duplicate/index/reference audit on staging
- credential and money migration design
- normalized workday/profile uniqueness
- financial source/event keys
- validate defaults/schema shapes
- backup/restore/rollback evidence
- domain audit histories.

Acceptance Criteria:
- No lost records or changed financial totals
- duplicates explicitly reconciled
- concurrent operations tested
- migration rollback rehearsed
- no destructive field/index removal without separate documented review.

## TASK-025 — Optimize measured query, bundle and device costs

Priority: P2
Platform: All
Module: Performance
Dependencies: 021,024,026; usable build baseline
Status: Open

Problem:
Aggregation polling/regex/KEYS/unbounded ID lookup and growing ScrollViews risk poor scale.

Current:
Unmeasured queries/rendering

Expected:
Recorded baseline → targeted optimization → measured comparison

Files:
- `web/src/app/api/analytics/route.ts`
- `web/src/app/api/workers/route.ts`
- `web/src/lib/services/redis-client.ts`
- `mobile/src/screens`
- `mobile/src/services/upload.ts`

Required Work:
- Explain representative queries
- add justified compound indexes/cache
- replace KEYS if helpers retained
- virtualize long lists
- bounded image uploads/dimensions
- inspect bundle and React/native profiles
- avoid speculative memoization.

Acceptance Criteria:
- Document p50/p95/query plans/bundle/device baselines
- agreed budgets met without stale/incorrect data
- cache invalidation and memory/lifecycle tests pass.

## TASK-026 — Establish shared contracts and state ownership

Priority: P1
Platform: Web + Mobile + API
Module: Shared architecture
Dependencies: 005; co-design with 009/010/006
Status: Open

Problem:
Duplicated type/enum/price definitions drift; web no-op store conflicts with auth consumers; invalidation isolated.

Current:
Loose casts/duplicated derived data

Expected:
Shared runtime schemas/DTO/status definitions + explicit state owners

Files:
- `web/src/types/index.ts`
- `mobile/src/types/index.ts`
- `web/src/hooks/use-api.ts`
- `mobile/src/hooks/use-api.ts`
- `web/src/components/providers.tsx`
- `web/src/store/index.ts`
- `mobile/src/store/authSlice.ts`

Required Work:
- Extract minimal shared pure contracts using current tooling
- keep rendering separate
- server computes money/transitions
- Query owns server data, Redux minimal session/UI, local form state
- stable store instance
- mutation invalidation graph
- canonical date/currency/ID rules.

Acceptance Criteria:
- Both clients compile against same contract fixtures
- no any cast hides shape drift
- logout clears sensitive data
- mutation refreshes all affected screens
- no wholesale framework rewrite.

## TASK-027 — Validate environments and release configuration

Priority: P1
Platform: Operations + All
Module: Configuration/CI
Dependencies: 005,006,010
Status: Open

Problem:
Conflicting wildcard/credential CORS, unused config helpers, localhost defaults, missing mobile release/CI setup.

Current:
Implicit dev defaults → release uncertainty

Expected:
Validated environment profiles + reproducible build/CI

Files:
- `web/.env.example`
- `web/next.config.ts`
- `web/src/lib/middleware/cors.ts`
- `web/src/lib/middleware/api-validation.ts`
- `mobile/app.json`
- `mobile/src/api/client.ts`
- `web/package.json`
- `mobile/package.json`

Required Work:
- Define dev/staging/prod env contracts
- fail fast missing server secrets/release URLs without logging values
- origin/preflight/security transport policy
- integrate critical test/lint/build/audit gates
- Expo IDs/plugins/permissions and signed build profiles
- verify dependency compatibility before upgrades.

Acceptance Criteria:
- Release cannot point to localhost or expose server secrets
- allowed/disallowed origins tested
- clean lockfile installs/builds repeatable
- CI blocks critical failures and uses protected credentials.

## TASK-028 — Add redacted observability and audit histories

Priority: P1
Platform: API + Operations
Module: Monitoring/background work
Dependencies: 003,006; integrate alongside 002/012/013
Status: Open

Problem:
Raw console logs/no durable audit or reconciliation worker; partial operations hard to investigate.

Current:
Ad hoc log → no reliable history

Expected:
Request/event IDs + structured redaction + durable audited operations

Files:
- `web/src/app/api`
- `web/src/lib/services`
- `web/src/lib/models`
- `mobile/src/services`

Required Work:
- Logger with credential/PII redaction
- actor/action/record/previous/new safe values/time
- restricted IP/device data
- provider event outbox/retry/dead-letter
- dependency readiness without key fragments
- error monitoring/alerts/runbooks.

Acceptance Criteria:
- OTP/password/token/provider secrets absent from logs
- important admin/financial transitions traceable
- retries idempotent
- alert and recovery drills demonstrated
- retention/access configured.

## TASK-029 — Create critical automated regression coverage

Priority: P1
Platform: All
Module: Testing
Dependencies: 005 for runnable baseline; start fixtures before fixes
Status: Open

Problem:
No test scripts or repository test suite found; compiler alone cannot verify workflows.

Current:
Untested contracts and authorization

Expected:
Isolated fixtures → unit/API/integration/E2E checks in CI

Files:
- `web/package.json`
- `mobile/package.json`
- `web/src/app/api`
- `web/src/lib/models`
- `mobile/src/services`
- `mobile/src/navigation/AppNavigator.tsx`

Required Work:
- Choose minimal compatible tooling
- unit schemas/money/transitions
- API role/owner matrix and invalid input
- real disposable Mongo/Redis integration with concurrency/rollback
- customer-worker-admin E2E
- provider sandbox signing/replay
- upload/password recovery and session cache tests.

Acceptance Criteria:
- All P0/P1 regression cases automated
- tests cannot hit production
- failing permissions/payment proof fail CI
- multi-user/multi-page/race and network cases covered
- no arbitrary coverage percentage substitutes for behavior.

## TASK-030 — Validate staging, native releases and operational recovery

Priority: P2
Platform: All + Operations
Module: Release evidence
Dependencies: All release-required P0/P1 tasks,020,025,027–029,031
Status: Open

Problem:
No successful release build/device/provider/deployment/backup evidence yet.

Current:
Static audit/check failures

Expected:
Frozen release artifact → staging journeys/device/performance/restore → reviewed release

Files:
- `docs/production-readiness-checklist.md`
- `web/package.json`
- `mobile/package.json`
- `mobile/app.json`

Required Work:
- Run production builds/lint/typecheck, package/native compatibility, viewport/accessibility/device matrix, sandbox payment/push/uploads, load profile, backup restore and rollback
- record command/results/commit
- resolve failures rather than suppressing.

Acceptance Criteria:
- Checklist has verifiable evidence
- P0/P1 closed
- no untested money/session path
- Android/iOS signed artifacts and staging rollback proven
- production release separately reviewable.

## TASK-031 — Resolve release roles and product-policy scope

Priority: P1
Platform: Product + All
Module: Scope and authorization policy
Dependencies: Audit findings; does not block containing existing vulnerabilities
Status: Open

Problem:
Generic request includes shop app while code has only customer/worker and partial contractor model; several policy decisions unspecified.

Current:
Unsupported role → customer tabs / implied features

Expected:
Explicit role/channel/release matrix → implemented or excluded features

Files:
- `docs/module-inventory.md`
- `docs/role-permission-matrix.md`
- `docs/missing-features.md`
- `mobile/src/navigation/AppNavigator.tsx`

Required Work:
- Document contractor/shop intent, customer web scope, attendance approver policy, quote/milestone flows, refunds/payout rules, passwordless/password recovery and communication release scope
- reject unsupported roles
- remove misleading unavailable entry points.

Acceptance Criteria:
- Release matrix approved and testable
- no invented shop/loan modules
- unknown roles denied
- each visible promised feature implemented or deliberately excluded with honest UI.

## TASK-032 — Remove proven dead code and unnecessary packages

Priority: P3
Platform: All
Module: Cleanup
Dependencies: Feature verification and 029/030 affected checks
Status: Open

Problem:
Unused fixtures/helpers/hooks and potential unused/transitive-deprecated dependencies remain.

Current:
Keyword-based suspected dead code

Expected:
Reference/build/feature proof → narrow cleanup

Files:
- `docs/dead-code-report.md`
- `web/src/lib/middleware`
- `web/src/hooks`
- `mobile/src/screens/worker/JobsScreen.tsx`
- `web/package.json`
- `mobile/package.json`

Required Work:
- Confirm import/tooling/public asset/external API references
- remove unused mock constant
- integrate or remove orphan helpers
- inspect transitive deprecated owners
- correct dependency placement only when safe
- preserve cn/shadcn CSS uses and intended module hooks.

Acceptance Criteria:
- No working feature/route/asset removed accidentally
- checks pass
- bundle/dependency impact recorded
- no blind major upgrades or blanket model deletion.
