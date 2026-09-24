# Mobile application audit

There is **one** Expo app, with customer and worker tabs selected by `user.role === "worker"`. All other authenticated roles fall into customer tabs, including contractor/admin. There is no separate shop app, contractor navigation, role enrollment or onboarding stack. Source checks below do not substitute for Android/iOS device tests.

## Screen coverage

Paths below are under `mobile/src/screens`. APIs are on the same EXPO_PUBLIC_API_URL as web's Next backend.

| Screen | UI → action → API / outcome | Findings / task |
| --- | --- | --- |
| auth/Login | phone → sendOtp thunk → auth send-otp → Redis | Server never sends SMS; global isLoading removes navigation during submission; separate bootstrap/request loading needed. 007,022 |
| auth/Otp | digits → verifyOtp → auth → SecureStore/Redux | Missing resetOtpExpire and handleResendOtp; invalid disabled type. Four-digit server code; no reliable resend/countdown. New account fails password requirement. 005,007 |
| customer/Home | categories/jobs queries → cards → Search/JobDetail/CreateJob | Real data; category parameter is not a reliable end-to-end filter; first-page jobs; query errors tend to appear empty. 009,021 |
| customer/Search | input/category → useWorkers; price/rating filtered locally | Price/rating only filter the first result page; server filter implementation also lacks schema fields. Populated userId is mapped correctly here, but review count is hardcoded zero; static category chips and no worker detail route. 010,018,021 |
| customer/CreateJob | five-step form → createJob | Sends subcategory/photos/address.street/preferredDate/time instead of subcategoryId/images/address.address+state/scheduledDate/pricingModel. Local URI photos never uploaded. No mutation error callback or successful reset/navigation. 009,018 |
| customer/Jobs | GET jobs → client status tabs, refresh | Server returns default page only; no next-page UX; realtime listener needs a connection/server. Good refresh primitive exists. 021,023 |
| customer/JobDetail | useJobDetail → status/OTP/payment actions | GET returns array instead of Job. Six OTP boxes vs four-digit start OTP; in-progress vs in_progress; totals use m.cost rather than totalPrice and include unapproved charges. Payment pending flag comes from unused mutation, so doesn't protect initiatePayment. 009,012,017 |
| customer/Profile | saved user → menu and logout | Only logout wired; fake fallback email/phone/avatar; addresses/payment methods/history/invoices/help inert. Self-profile PATCH helper calls admin-only route. 018,022 |
| worker/Dashboard | two jobs queries, accept/reject, availability PATCH | Today's/weekly labels have no date predicate; sums j.price not server money fields; saved User lacks rating/isOnline; `_id` missing from auth DTO can skip mutation. Switch changes locally without rollback. 009,017,022 |
| worker/Jobs | GET jobs → mapping → WorkerJobDetail | Reads customerName/service/date instead of populated customerId/categoryId/scheduledDate; unused mockJobs array does NOT feed UI. No explicit error/loading state. 009,021,032 |
| worker/JobDetail | detail → accept/start/arrive/OTP/charge/complete, GPS | Wrong nested fields; default assigned status can imply actionability without data; latitude/longitude fall back to 0. Attendance payloads incompatible; additionalCharges number ignored (API expects additionalCharge object). Alert.prompt needs Android-safe replacement; interval cleanup lacks unmount path. 012,013,022 |
| worker/Earnings | payments → wallet/payout tabs and sums | Page-derived balances ignore paid-out/held/refunded ledger amounts; Payout data never fetched. 017,021 |
| worker/Profile | Redux user → verification/rating/skills and menus | These belong to WorkerProfile, not login User DTO; all menu/edit actions inert. 018 |
| common/Chat | connect socket + jobs?action=messages → list/send/typing | No server/socket/message model; jobs list misinterpreted as message history; text clears without server acknowledgment, errors console-only. Disconnect imported but not called on logout. 023,022 |
| common/Notifications | static array → FlatList | Demo events/currency and no read/open action or API. 023 |
| common/Rating | validate selected stars → submitRating → POST jobs action=rate | Runs job-create validation, not rating update. Worker-review action likewise unsupported. 012,019 |
| common/Dispute | reason/description/image upload → POST disputes | Sends evidence while server expects images; UI description minimum weaker; no record detail flow; upload fallback missing. 013,018 |
| common/Promo | GET promotions?active=true → list/copy | Server ignores active and uses type/value/endDate/minOrderAmount; mobile expects discountType/discountValue/validUntil/minOrder. Copy only shows alert. 019 |
| common/Settings | preference toggle/save → local thunk | View onPress invalid, value field absent and thunk call shape wrong; even repaired thunk currently returns arguments without API persistence. Registered stack screen has no working profile entry link. 005,019 |

## Session, networking and state

`loadUser` accepts saved token/user without server validation and has no rejected reducer, so corrupt storage can leave initial loading active. Login uses `id`; consumers use `_id`. Global isLoading gates the whole navigator during send/verify and can reset navigation state. No refresh endpoint is used. Logout removes storage but does not clear QueryClient, terminate sockets, cancel requests or revoke server session. Query keys are not user-scoped. TASK-006/009/022.

Fetch has no AbortController timeout, safe non-JSON response handling, error classification or 401 recovery. Queries have staleTime and disable window refocus but no mobile AppState/focus/online bridge. Offline/slow-network/reconnect behavior is unimplemented. Do not automatically retry financial mutations; use idempotency and reconcile server state. Request cancellation, capped safe GET retry, explicit offline/timeout/session-expired states and foreground refetch belong in TASK-022.

Push initialization occurs on App mount rather than authenticated session transition. POST users is unsupported, no push-token model field, no EAS projectId in app.json, and listener callbacks do nothing. Re-registration on login/token rotation and deep links are missing. Permissions denial must not prevent using the rest of the app. TASK-023.

Location uses foreground permission and repeated polling, not a validated background tracking service. Server ignores location/geofence actions. Stop tracking on blur/unmount/logout; avoid overlapping async polls and disable navigation until valid coordinates exist. Native permission text, denial recovery, background behavior and battery cost require real-device tests. TASK-013/022.

## Platform/release validation still required

App manifest declares Android/iOS IDs, light portrait UI, icons/splash, notification plugin and iPad support. No EAS profiles or native signing/release evidence found. Native Razorpay, notification and SecureStore behavior must be tested in signed/development builds; do not treat an Expo web preview as native acceptance. Check iOS/Android additional-charge entry, keyboard avoidance, safe areas, back navigation, large fonts, tablet layout, permissions, offline/foreground recovery and expired session. Both typecheck and provider contract defects must be fixed first. No emulator or physical-device QA was performed in this audit.
