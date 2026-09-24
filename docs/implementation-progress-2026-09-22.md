# Implementation and activation notes — 2026-09-22

This follows the audit and the first security-containment batch. The user chose openWA for WhatsApp OTP delivery, Razorpay and Cashfree for collection, and **manual worker transfers with reconciliation**. No messages, payments, bank transfers, production deployment or live database changes were performed during development.

## Implemented

- Web imports/types repaired; custom server scripts now load Next environment configuration and TypeScript explicitly. Production start sets production mode. Mobile OTP resend/countdown and settings controls compile; settings persist through the authenticated users API.
- Admin password sign-in at `/login`, current-account check before rendering admin content, and logout with cache cleanup. Admin provisioning reads environment credentials and never prints passwords.
- Socket handshake and each sensitive event check the current active account. Job membership is required for joins, typing and messages. Delivery rechecks recipients, so revoked/reassigned subscribers do not retain access. Sender and recipient IDs come from the account/job. Requests and room counts are bounded. Global presence broadcasts removed. Mobile event names match the server. Chat persistence/read receipts remain outside this batch.
- openWA delivery checks its response before reporting success. OTP values are HMAC-hashed in Redis, consumed with an atomic Lua script, expire without attempt-based TTL extension, and allow three guesses. Send reservation enforces a 60-second cooldown and five sends/hour per normalized phone. Password login also has a Redis counter. India national/+91 variants share one identity for new requests.
- OTP enrollment is customer-only, atomic, and passwordless; client-supplied privilege/password values cannot grant access. Current user responses use `_id` consistently. Disabled users cannot log in. Existing phone formats in a populated database need a duplicate-aware migration review before normalization is deployed.
- Session checks use current account role/status, password-change timestamp and session version. Logout revokes all account sessions. Mobile bootstrap verifies the saved token; logout clears credentials, socket, location timers and query cache. Offline logout clears local state; remote revocation cannot be guaranteed when the server is unreachable.
- Booking payloads now use real subcategory IDs, address/state, ISO schedule and uploaded image URLs. Server category pricing overrides client estimates. A verified active online worker matching skill and exact service-area city is assigned when available; otherwise the job remains searching for admin assignment.
- Worker acceptance → travel → arrival → start-code verification → completion request → customer confirmation is role/state constrained. Codes are consumed and exposed only in the owning customer's single-job detail response. Start-code attempts are bounded. Optimistic concurrency rejects stale saves. Mobile fetches a single job, refreshes its state, and reports mutation errors.
- Gateway orders use server amounts in paise and a configured platform fee. One order per job prevents switching gateways or creating another order while the first is unresolved. Provider timeout leaves an explicit recovery state. Razorpay proof checks use the stored order ID and provider capture status. Cashfree uses server-to-server payment/refund lookups. Client callbacks alone cannot record success.
- Payment finalization atomically records the payment, marks the job paid, and creates one payout obligation. Duplicate callbacks are idempotent. Payment creation checks Mongo transaction support and creates required unique indexes without dropping existing indexes.
- Signed webhook endpoint: `/api/payments/webhook?provider=razorpay` or `cashfree`. Admin recovery UI: `/admin/payments/reconciliation`. Recovery queries the provider and checks the saved order reference/amount; it never fabricates a second order after an ambiguous timeout.
- Manual payout UI: `/admin/payments/payouts`. Admin records exact amount, unique bank reference, transfer date, statement reference and explicit verification. The API rechecks the customer payment with the gateway and records the reviewing admin. This is a manual attestation against a bank statement, not an automatic bank-statement integration, and never initiates a transfer.

## Required local/staging configuration

Copy the variable names from `web/.env.example` into local deployment settings; do not commit secrets. There is no configured local `.env` in this workspace.

1. Set `MONGODB_URI` to a replica set/Atlas deployment, `REDIS_URL`, and strong JWT secrets. Review duplicate legacy payments/accounts before creating indexes; code does not delete or rewrite existing records to resolve duplicates.
2. Run and link an openWA session separately. Set the exact `OPENWA_SEND_TEXT_URL`, `OPENWA_API_KEY`, and version (`4` default; `5` uses its different payload). Validate a consented test number. New-number conversations may require an openWA license. No WhatsApp session was started by this task.
3. Configure both gateway sandbox credentials, webhook secrets/URLs and the approved `PLATFORM_FEE_BPS` (100 = 1%). Set the public HTTPS host and allowlist the Cashfree checkout domain. Keep `PAYMENTS_ENABLED=false` until database concurrency and gateway sandbox acceptance tests pass.
4. Set `EXPO_PUBLIC_API_URL` to a device-reachable API host. `localhost` on a phone is the phone. For Cashfree this host also serves `/checkout/cashfree`; payment session IDs travel in the URL fragment, not request logs. Razorpay requires a native development/release build, not Expo Go.
5. If no administrator exists, provide `ADMIN_NAME`, `ADMIN_PHONE`, `ADMIN_PASSWORD` securely and run `npm run seed:admin` in `web`. The script never overwrites an existing administrator.

## Scope limits and release checks

- Collection is intentionally disabled by default. Live provider delivery, webhook retries, database rollback/concurrent callbacks and real bank references have not been exercised here because credentials and backing services are absent.
- The complete payable booking path currently covers fixed/visit jobs with a category base price and no material/additional-charge lines. Hourly/daily/quotation pricing and charge approval still need approved pricing rules and UI; these jobs cannot be charged using an arbitrary client total.
- Worker KYC/onboarding and admin assignment must supply valid profiles/service areas; searching jobs are not automatically redistributed in the background. Admin reassignments are restricted to pre-work states.
- Mobile export verifies JS/Hermes bundles and assets, not signed Android/iOS binaries or an on-device payment SDK round trip.
- Existing milestone payments remain disabled. Other historical audit findings remain tracked in `DEVELOPMENT_PLAN.md`; this batch is not a claim that the entire product is production-ready.

## Provider references used

- [openWA v4 client/middleware contract](https://docs.openwa.dev/docs/reference/api/Client/classes/Client)
- [openWA quick start and v5 contract](https://openwa.dev/docs/getting-started/quickstart/)
- [Razorpay secure integration checklist](https://security.razorpay.com/security/checklist/)
- [Cashfree create order](https://www.cashfree.com/docs/api-reference/payments/latest/orders/create-order)
- [Cashfree payment lookup](https://www.cashfree.com/docs/api-reference/payments/latest/payments/get-payments-for-an-order)
- [Cashfree refunds lookup](https://www.cashfree.com/docs/api-reference/payments/latest/refunds/get-all-refunds-for-an-order)
- [Cashfree hosted checkout](https://www.cashfree.com/docs/payments/online/web/redirect)

Validation results are appended after the final checks below.

## Validation results

- Web `npm run build`: passed, including all new login, checkout and reconciliation routes. The final shared-auth extraction also passed.
- Mobile TypeScript: passed. Expo Android and iOS export: passed, each producing a Hermes bundle plus assets in ignored `.export-check/`.
- `node --test tests/security-routes.test.cjs`: 60/60 passed, including the final shared-auth extraction. Tests execute real route/service code with isolated persistence/provider boundaries, not live MongoDB/Redis or gateway accounts.
- Targeted ESLint for new/changed security, payment and admin code: passed without warnings.
- Production custom-server smoke check: passed after separating transport-independent account validation from Next HTTP imports. Landing/login/Cashfree pages return 200; anonymous auth returns 401; anonymous websocket connection is rejected. The temporary server was stopped.

No signed native binaries, live WhatsApp messages, real provider orders, bank transfers or production data migrations were produced.
