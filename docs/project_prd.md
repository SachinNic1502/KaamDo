# KaamDo

## Product Requirements Document

**Tagline:** Har Kaam, Sahi Insaan

**Product Type:** Service Marketplace + Technician Hiring + Labor Hiring + Contractor Marketplace + Job Management + Payments

---

# 1. Product Overview

KaamDo is a digital marketplace that connects customers who need work completed with verified:

* Technicians
* Skilled workers
* Daily-wage laborers
* Service professionals
* Contractors
* Agencies
* Work teams

Customers can post work requirements, find suitable workers, receive quotations, book services, track work, approve additional charges, make payments, receive invoices, and rate workers.

Workers can register their skills, receive nearby work opportunities, submit quotations, manage jobs, track earnings, and receive payouts.

KaamDo should support both:

### Small Service Jobs

Examples:

* Electrician
* Plumber
* AC technician
* Carpenter
* Cleaner
* Appliance repair
* Mobile repair
* Laptop/computer technician
* Mechanic

### Labor-Based Jobs

Examples:

* Construction labor
* Helpers
* Loading/unloading workers
* Farm labor
* Warehouse workers
* Painting teams
* Fabrication helpers

### Contract Projects

Examples:

* Complete house painting
* Electrical installation
* Plumbing contracts
* Renovation
* Furniture work
* Construction work
* Commercial maintenance

---

# 2. Product Objective

The main objective of KaamDo is to create one trusted platform where a customer can:

**Find → Hire → Manage → Verify → Pay**

for almost any local service or labor requirement.

At the same time, workers receive a digital platform to find genuine work opportunities without depending only on local contacts or middlemen.

---

# 3. Core Platform Flow

The primary system flow is:

Customer creates requirement

↓

System finds suitable workers

↓

Workers receive request

↓

Worker accepts or submits quotation

↓

Customer confirms worker

↓

Booking created

↓

Worker travels to location

↓

OTP verifies work start

↓

Work performed

↓

Additional work approved if required

↓

Worker requests completion

↓

Customer verifies completion

↓

Payment finalized

↓

Platform commission calculated

↓

Worker payout processed

↓

Invoice generated

↓

Customer rates worker

---

# 4. User Roles

KaamDo should initially support four primary roles.

## 4.1 Customer

A customer is someone who wants to hire a worker, technician, or contractor.

Customers can:

* Register/login
* Manage profile
* Manage addresses
* Search services
* Create work requirements
* Upload problem images/videos
* Select service date/time
* View estimated pricing
* Receive worker matches
* Receive quotations
* Compare quotations
* Select workers
* Book services
* Track assigned worker
* Contact worker
* Approve additional work
* Make payments
* Verify work completion
* Raise disputes
* Download invoices
* Rate workers
* View booking history
* Rebook workers

---

# 5. Worker / Technician Role

Workers can include:

* Electricians
* Plumbers
* AC technicians
* Mechanics
* Carpenters
* Painters
* Appliance technicians
* Computer technicians
* Mobile technicians
* Cleaners
* Drivers
* Other skilled professionals

Workers should be able to:

* Register
* Verify mobile number
* Complete profile
* Upload profile photo
* Add skills
* Add experience
* Add service areas
* Add work availability
* Define service charges
* Add hourly/daily pricing
* Upload verification documents
* Add bank/UPI information
* Complete KYC
* Go online/offline
* Receive job requests
* Accept/reject jobs
* Submit quotations
* Navigate to customer
* Start job using OTP
* Request additional charges
* Upload work images
* Add material costs
* Mark work completed
* Verify completion through OTP
* View earnings
* View commission
* View payout history
* View reviews
* Manage availability

---

# 6. Laborer Role

Labor workers may have slightly different functionality.

Examples:

* Construction labor
* Daily-wage workers
* Loaders
* Helpers
* Agricultural workers
* Warehouse workers

Labor profile should contain:

* Labor type
* Skills
* Daily wage
* Hourly wage
* Available dates
* Preferred locations
* Work experience
* Availability status

Example requirement:

Customer needs:

**4 construction laborers**

Duration:

**5 days**

Daily wage:

**₹800 per worker**

Estimated labor cost:

4 × 5 × ₹800

= ₹16,000

Attendance can be recorded every day.

Daily workflow:

Worker check-in

↓

Customer/supervisor verification

↓

Attendance recorded

↓

Worker check-out

↓

Daily work completed

↓

Payment eligibility calculated

---

# 7. Contractor / Agency Role

Contractors can manage larger projects and multiple workers.

Contractor functionality:

* Contractor registration
* Business profile
* Business verification
* Worker/team management
* Skill categories
* Service locations
* Receive project requirements
* Submit quotations
* Add quotation items
* Define project timeline
* Define milestones
* Manage workers
* Upload progress photos
* Update milestone status
* Submit milestone completion
* Receive payments
* Manage earnings
* Download reports

---

# 8. Super Admin Role

Super Admin controls the entire platform.

Admin functionality:

### Dashboard

Display:

* Total users
* Total workers
* Verified workers
* Active workers
* Customers
* Contractors
* Total jobs
* Active jobs
* Completed jobs
* Cancelled jobs
* Revenue
* Commission
* Pending payouts
* Completed payouts
* Disputes

### User Management

Admin can:

* View customers
* View workers
* View contractors
* Block accounts
* Suspend accounts
* Verify accounts
* Review KYC

### Worker Verification

Admin should review:

* Identity documents
* Address documents
* Certifications
* Experience
* Bank details
* Profile information

Worker statuses:

* Draft
* Submitted
* Under Review
* Verified
* Rejected
* Suspended

---

# 9. Service Category Management

Admin should dynamically create service categories.

Example:

## Home Services

* Electrician
* Plumbing
* Carpentry
* Painting
* Cleaning

## Appliance Services

* AC repair
* Refrigerator repair
* Washing machine repair
* Television repair

## Vehicle Services

* Bike mechanic
* Car mechanic
* Battery service
* Tyre service

## Technology Services

* Mobile repair
* Computer repair
* Laptop repair
* CCTV installation
* Networking

## Labor Services

* Construction labor
* Helpers
* Loaders
* Warehouse workers
* Farm labor

## Contract Work

* Painting contract
* Plumbing contract
* Electrical contract
* Renovation
* Fabrication
* Construction

---

# 10. Pricing Models

KaamDo should support multiple pricing models.

## Fixed Price

Example:

Fan installation — ₹299

Customer sees the service price before booking.

---

## Visit Charge

Example:

AC inspection — ₹199.

After inspection, technician can provide repair quotation.

---

## Hourly Work

Example:

Computer technician — ₹400/hour.

System records:

Start time

↓

End time

↓

Total duration

↓

Final calculation

---

## Daily Wage

Example:

Construction worker — ₹800/day.

Final cost:

Number of workers × working days × daily wage

---

## Quotation

Customer submits requirement.

Workers submit quotations.

Example:

Worker A — ₹4,500

Worker B — ₹5,000

Worker C — ₹4,750

Customer decides which quotation to accept.

---

## Contract Pricing

For larger projects.

Example:

Painting project

Total quotation: ₹50,000.

Payments can be divided across milestones.

---

# 11. Customer Job Creation Flow

Customer selects:

### Step 1

Service category.

Example:

Electrical

### Step 2

Subcategory.

Example:

Fan Repair

### Step 3

Describe issue.

### Step 4

Upload photos/video.

### Step 5

Select address.

### Step 6

Select date and time.

### Step 7

Select pricing option.

### Step 8

Submit work request.

System generates:

**JOB-XXXXXXXX**

Job status:

**Finding Worker**

---

# 12. Worker Matching System

Matching should consider:

* Service category
* Worker skills
* Customer location
* Worker service radius
* Worker availability
* Worker online status
* Verification
* Job history
* Rating
* Pricing
* Acceptance rate

Initially, the system may notify a group of suitable workers.

The first accepted worker can receive the booking for fixed-price jobs.

For quotation jobs, several workers can respond.

---

# 13. Booking Lifecycle

Recommended job statuses:

Draft

↓

Searching

↓

Worker Assigned

↓

Worker Accepted

↓

On The Way

↓

Arrived

↓

Work Started

↓

In Progress

↓

Waiting for Customer Approval

↓

Completion Requested

↓

Completed

↓

Payment Pending

↓

Paid

↓

Closed

Other statuses:

* Cancelled
* Rejected
* Disputed
* Refunded
* Rework Requested

---

# 14. Work Start Verification

The system should generate a Start OTP.

Example:

**4821**

Customer shares it with the worker.

Worker enters OTP.

Server validates OTP.

Then:

**ARRIVED → WORK_STARTED**

Store:

* Start time
* Worker
* Customer
* Job
* Verification method

Optional:

* Location validation
* QR verification

---

# 15. Additional Work Approval

A worker should not arbitrarily change the original price.

Example:

Original AC service:

₹499

Technician identifies:

Gas refill — ₹1,800.

Worker submits:

Additional Work Request

Description: AC gas refill

Price: ₹1,800

Customer receives:

**Approve**

or

**Reject**

Only approved charges are added to the final bill.

---

# 16. Materials and Parts

Workers can optionally add materials.

Example:

Tap replacement — ₹350

Wire — ₹250

Labour charge — ₹500

Total:

₹1,100

Materials should contain:

* Material name
* Quantity
* Unit price
* Total price
* Optional receipt/photo

Customer should approve charges where required.

---

# 17. Completion Flow

When work is finished:

Worker taps:

**Request Completion**

Customer receives notification.

Customer checks work.

System generates completion OTP.

Customer provides OTP.

Worker enters OTP.

Job changes to:

**Completed**

Store:

* Completion time
* OTP verification
* Final amount
* Worker notes
* Before images
* After images

---

# 18. Payments

KaamDo should support:

* UPI
* Cards
* Net banking
* Supported payment-provider methods
* Cash, where enabled

Example:

Job amount: ₹1,000

Platform commission: 10%

Platform commission: ₹100

Worker eligible earning: ₹900

System records:

Customer payment

↓

Payment success

↓

Platform fee

↓

Worker earning

↓

Payout status

The payment architecture must use compliant marketplace/payment-provider functionality for collecting, transferring, settling, and refunding funds.

---

# 19. Worker Wallet / Earnings

The worker's Earnings section should display accounting records rather than behaving like an unregulated stored-value wallet.

Show:

* Gross earnings
* Platform fee
* Taxes/deductions if applicable
* Pending amount
* Settlement processing
* Settled amount
* Refund adjustments
* Payout history

Example:

Job amount: ₹2,000

Commission: ₹200

Net earning: ₹1,800

Status:

Settlement Processing

↓

Paid

---

# 20. Commission System

Admin should configure commission.

Commission can be:

* Percentage
* Fixed fee
* Category-specific
* Worker-specific
* Contractor-specific

Example:

Electrician: 10%

Plumbing: 12%

Construction contract: 5%

Labor: ₹30 per completed day

Rules should be maintained in backend configuration.

---

# 21. Payment Methods

Possible customer payment methods:

* UPI
* Debit card
* Credit card
* Net banking
* Supported digital payment methods
* Cash where allowed

Payments should always have server-side verification.

Never trust payment success only from the client application.

---

# 22. Payout System

Workers should add verified settlement information.

Possible settlement details:

* Bank account
* IFSC
* UPI details where supported

Payout lifecycle:

Eligible

↓

Processing

↓

Submitted

↓

Paid

or

Failed

Failed payouts should support retry after correcting account information.

---

# 23. Invoice System

Every completed paid job should generate an invoice/receipt where appropriate.

Invoice should contain:

* Invoice number
* Customer
* Worker/service provider
* Service
* Job number
* Service charges
* Additional charges
* Material charges
* Taxes if applicable
* Platform-related charges where displayed
* Total
* Payment method
* Payment status
* Date

Customer should be able to download the invoice.

---

# 24. Reviews and Ratings

After job completion:

Customer can rate worker.

Example:

Overall rating: 4.8/5

Optional rating categories:

* Work quality
* Professionalism
* Punctuality
* Communication
* Value

Customer can also leave a written review.

Admin must be able to moderate abusive or fraudulent reviews.

---

# 25. Dispute System

Customer can raise a dispute for issues such as:

* Worker did not arrive
* Poor work quality
* Work incomplete
* Overcharging
* Unauthorized additional work
* Damage
* Payment problem
* Worker behavior

Worker may also raise issues.

Dispute lifecycle:

Raised

↓

Under Review

↓

Evidence Submitted

↓

Support Review

↓

Resolution

Possible outcomes depend on platform policy and payment-provider capabilities:

* Rework
* Partial refund
* Full refund
* Payment settlement
* Administrative closure

---

# 26. Cancellation System

Cancellation policies should depend on job status.

Example:

Before worker assignment:

Free cancellation.

After worker assignment:

Possible cancellation fee.

Worker already arrived:

Visit charge may apply.

Worker cancellation should affect reliability metrics.

Admin should configure cancellation rules.

---

# 27. Attendance System for Labor

Labor hiring requires attendance tracking.

Supported methods:

* Customer confirmation
* Supervisor confirmation
* OTP
* QR
* Time-based check-in/out

Attendance record:

Worker

Job

Date

Check-in

Check-out

Working hours

Attendance status

Approved wage

---

# 28. Contractor Project Flow

Large projects follow:

Customer posts project

↓

Contractors receive requirement

↓

Contractors submit quotations

↓

Customer reviews quotation

↓

Contractor selected

↓

Project agreement confirmed

↓

Milestones created

↓

Work begins

↓

Milestone completed

↓

Customer approves milestone

↓

Payment processed

↓

Next milestone

↓

Final completion

↓

Final settlement

---

# 29. Milestone System

Example project:

House painting

Total:

₹50,000

Milestones:

Advance — ₹10,000

Surface preparation — ₹10,000

First coat — ₹10,000

Final coat — ₹10,000

Completion — ₹10,000

Each milestone contains:

* Description
* Amount
* Due date
* Status
* Supporting images
* Customer approval
* Payment state

---

# 30. Notifications

Support:

* Push notification
* SMS where required
* Email
* In-app notification
* WhatsApp integration later if compliant and appropriate

Notifications include:

* New job
* Job accepted
* Worker assigned
* Worker arriving
* OTP generated
* Additional charge request
* Quotation received
* Payment received
* Completion request
* Payment successful
* Payout processed
* Review reminder
* Dispute update

---

# 31. Communication

Customer and worker should communicate through:

* In-app chat
* Masked/contact-controlled calling where possible

Chat should be linked to the job.

Store messages necessary for support/dispute investigation according to privacy policy and retention requirements.

---

# 32. Location System

Location features can include:

* Customer address
* Worker service area
* Worker travel radius
* Map navigation
* Distance calculation
* ETA
* Job location

Precise live tracking should only be used with appropriate permissions and privacy disclosures.

---

# 33. Search

Customers should search using:

* Service name
* Category
* Skill
* Worker
* Location

Examples:

Electrician

AC technician

Laptop repair

Painter

Construction labor

---

# 34. Customer App Pages

Customer mobile app:

* Splash
* Onboarding
* Login
* OTP verification
* Home
* Categories
* Services
* Search
* Service details
* Create job
* Location
* Schedule
* Booking summary
* Worker matching
* Worker profile
* Quotations
* Job details
* Job tracking
* Chat
* Payment
* Invoice
* Reviews
* Complaints
* Booking history
* Notifications
* Saved addresses
* Profile
* Support
* Settings

---

# 35. Worker App Pages

Worker app:

* Splash
* Login/register
* Mobile verification
* Worker onboarding
* KYC
* Skills
* Service areas
* Pricing
* Availability
* Home dashboard
* Online/offline switch
* Job requests
* Job details
* Navigation
* Start work
* Active job
* Additional work
* Material entry
* Completion
* Earnings
* Payouts
* Job history
* Ratings
* Notifications
* Chat
* Profile
* Documents
* Support
* Settings

---

# 36. Contractor Dashboard

Contractor functionality:

* Dashboard
* Project requests
* Quotations
* Active projects
* Workers
* Teams
* Attendance
* Milestones
* Payments
* Earnings
* Documents
* Ratings
* Reports
* Profile
* Settings

---

# 37. Admin Web Panel

Admin pages:

* Dashboard
* Customers
* Workers
* Contractors
* KYC approvals
* Service categories
* Services
* Jobs
* Projects
* Quotations
* Labor bookings
* Attendance
* Payments
* Transactions
* Commission
* Payouts
* Refunds
* Disputes
* Reviews
* Promotions
* Service areas
* Notifications
* Reports
* Admin users
* Roles and permissions
* Platform settings

---

# 38. Authentication

Recommended authentication:

Customer:

Mobile OTP

Worker:

Mobile OTP + verified profile

Contractor:

Mobile/email + verification

Admin:

Email/password + MFA

Sessions should use secure server-managed authentication.

---

# 39. Verification and KYC

Worker verification can include:

* Name
* Date of birth
* Photo
* Phone verification
* Address proof
* Identity proof
* Bank verification
* Skill documentation where relevant

Contractors may require additional business documents.

The exact KYC requirements should follow payment-provider, legal, and business requirements for the jurisdiction in which KaamDo operates.

---

# 40. Safety Features

Safety features should include:

* Verified worker indicator
* Report worker
* Report customer
* Emergency support contact
* Suspicious activity detection
* Account blocking
* Job audit trail
* OTP verification
* Payment audit trail
* Admin dispute system
* Sensitive-data access controls

---

# 41. Backend Modules

Recommended backend modules:

Authentication

Users

Customers

Workers

Contractors

Worker verification

Categories

Services

Skills

Availability

Locations

Jobs

Job assignment

Quotations

Bookings

Attendance

Projects

Milestones

Payments

Transactions

Commissions

Settlements

Payouts

Refunds

Invoices

Reviews

Disputes

Notifications

Chat

Documents

Promotions

Reports

Settings

Audit logs

---

# 42. Suggested Technical Stack

## Web

Next.js

TypeScript

Tailwind CSS

shadcn/ui

## Mobile

React Native

Expo or suitable native-enabled workflow

TypeScript

## Backend

Next.js API layer or dedicated Node.js service

Node.js

MongoDB

Mongoose

## State Management

Redux Toolkit

TanStack Query

## Validation

Zod

React Hook Form

## Payments

Indian payment provider supporting required marketplace/payment flows

## Maps

Google Maps Platform or another suitable mapping provider

## Notifications

Firebase Cloud Messaging

## Storage

Cloudinary / S3-compatible storage

## Email

Transactional email provider

---

# 43. Suggested Database Entities

Core entities:

User

CustomerProfile

WorkerProfile

ContractorProfile

WorkerDocument

WorkerSkill

ServiceCategory

Service

ServiceArea

Availability

Job

JobAssignment

Booking

Quotation

QuotationItem

AdditionalWorkRequest

MaterialItem

Attendance

Project

Milestone

Payment

Transaction

Commission

Settlement

Payout

Refund

Invoice

Review

Dispute

Chat

Message

Notification

Address

PromoCode

AuditLog

PlatformSetting

---

# 44. Security Requirements

The system must implement:

* Server-side authorization
* Role-based access control
* Input validation
* Rate limiting
* Secure authentication
* Payment signature verification
* Webhook verification
* Secure document access
* Encryption in transit
* Sensitive-data protection
* Audit logs
* Fraud controls
* API authorization
* Database indexes
* Idempotent payment endpoints

Never trust:

* Client-calculated prices
* Client commission values
* Client payment status
* Client role data
* Client payout status

All financial calculations must happen on the backend.

---

# 45. Job Audit Trail

Every important job event should be recorded.

Example:

Job created

Worker notified

Worker accepted

Worker arrived

Start OTP verified

Additional charge submitted

Additional charge approved

Work completion requested

Completion OTP verified

Payment completed

Invoice generated

Settlement initiated

Review submitted

This is important for disputes and support.

---

# 46. Admin Configuration

Admin should control platform settings without code changes.

Examples:

* Commission percentage
* Minimum job amount
* Cancellation fee
* Worker radius
* Number of workers notified
* Visit charges
* Taxes
* Platform fees
* Settlement policy
* Service availability
* Supported cities/areas
* Category status

---

# 47. Analytics

Admin dashboard should provide:

### Jobs

* Total jobs
* Completed jobs
* Cancelled jobs
* Active jobs
* Completion rate

### Workers

* Total workers
* Verified workers
* Active workers
* Jobs per worker

### Financial

* Gross job value
* Platform revenue
* Commission
* Refunds
* Settlements
* Payouts

### Service Performance

* Popular services
* Popular locations
* Average job value
* Average completion time

---

# 48. MVP

The first version should focus on the essential marketplace.

### MVP Roles

Customer

Worker

Admin

### MVP Functions

* Authentication
* Worker registration
* Worker verification
* Service categories
* Service search
* Create job
* Worker matching
* Accept/reject job
* Start OTP
* Work status
* Additional charge approval
* Completion OTP
* Payment
* Commission calculation
* Settlement/payout record
* Invoice
* Rating
* Notifications
* Admin dashboard

Avoid building every advanced feature before validating the core workflow.

---

# 49. Phase 2

Add:

* Contractor accounts
* Multiple workers
* Labor hiring
* Attendance
* Quotations
* Milestone projects
* Advanced disputes
* Promotions
* Subscription plans

---

# 50. Phase 3

Add:

* Corporate accounts
* Property maintenance
* Housing society accounts
* Office maintenance
* Business contracts
* Workforce management
* Recurring services
* Annual maintenance contracts
* Advanced analytics
* Intelligent worker matching
* Fraud detection
* Multi-city operations

---

# 51. Revenue Model

KaamDo can generate revenue through:

### Job Commission

Example:

10% of completed transaction.

### Worker Subscription

Workers pay monthly for premium benefits.

### Lead Fees

Workers pay for premium/high-value leads.

### Contractor Subscription

Contractors pay for project management features.

### Featured Listings

Verified professionals can promote profiles.

### Business Contracts

Recurring B2B service management.

The initial version should preferably keep monetization straightforward and transparent.

---

# 52. Example End-to-End Scenario

Customer needs electrician.

Customer opens KaamDo.

↓

Selects:

Electrical → Fan Repair

↓

Adds:

Problem description

Photo

Address

Preferred time

↓

System creates job.

↓

Suitable electricians receive request.

↓

Worker accepts.

↓

Customer receives worker details.

↓

Worker travels to customer.

↓

Customer provides Start OTP.

↓

Work begins.

↓

Worker finds capacitor issue.

↓

Worker adds:

Capacitor replacement — ₹450

↓

Customer approves.

↓

Worker replaces capacitor.

↓

Worker requests completion.

↓

Customer verifies work.

↓

Completion OTP entered.

↓

System calculates total.

Service charge — ₹300

Part — ₹450

Total — ₹750

↓

Customer pays.

↓

Platform records commission.

↓

Worker settlement becomes eligible.

↓

Invoice generated.

↓

Customer gives rating.

↓

Job closed.

---

# 53. Product Vision

KaamDo should evolve from a simple service-booking application into a complete local work ecosystem where:

**Customers find trusted people.**

**Workers find genuine jobs.**

**Contractors manage projects.**

**Businesses manage service workforces.**

The long-term product positioning is:

**One platform for getting local work done.**
