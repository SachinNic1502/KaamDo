# Performance and dependency audit

No load test, bundle-size measurement, React profile, mobile memory profile or database explain was run. Findings are source-backed risks and correctness issues requiring measurement, not fabricated benchmarks.

| Area / evidence | Risk | Recommended validation/fix / task |
| --- | --- | --- |
| List screens derive totals/filter first response page | Misleading totals and invisible records, even on a fast server | Server aggregates and full server filters; multi-page fixtures. 017,021 |
| workers GET User.find(...).distinct followed by `$in` | Matching ID list unbounded before profile page | Index/query redesign after explain with representative data; bounded literal search. 025 |
| Many GETs use raw `$regex` strings | Expensive patterns/collection scans | Length bounds, escaped literal search, deliberate indexed search design; don't add indexes blindly. 010,025 |
| analytics GET runs 16 counts/aggregations every 30s per dashboard client | Repeated aggregation cost | Profile first; aggregate matching financial sums together, short scoped cache/materialized summary if justified. 025 |
| countDocuments then paged find/populate | Multiple round trips and changing snapshots | Test stable sort/tie-breaker; compound participant/status/time indexes. Populate is not automatically an N+1 per row; measure generated queries. 024,025 |
| Redis helpers use KEYS plus per-key loop | Blocking scans at scale | Use bounded scan/TTL/key design; helpers currently unused except OTP class. 025 |
| Query clients use static identity-free keys | Cross-session stale data and incorrect refresh | Include identity or clear/cancel all sensitive cache; invalidation graph for jobs/payments/analytics/earnings. 022,026 |
| Search queries on each keystroke | Repeated network/database work | Debounce and cancel stale GETs; retain previous page while fetching where safe. 021 |
| Mobile lists map in ScrollView | Rendering/memory cost as pagination expands | Virtualize long job/search/earnings lists, page load, measured image sizes. 021,025 |
| Upload multiple images uses unrestricted Promise.all | Memory/network contention and large files | Bound count/dimensions/concurrency; compress deliberately and validate server-side. 018,025 |
| Mobile location setInterval invokes async GPS/request | Overlap, battery/network waste, leak on unmount | One in-flight update, AppState/permission lifecycle, stop on logout/blur. 022 |
| web Providers calls makeStore on render; both apps duplicate derived fields | Avoidable identity/state churn | Stable provider state and server-data ownership; profile before memoizing. 026 |

## Dependencies

`npm.cmd audit --package-lock-only --json` on 2026-09-21 returned exit 0 and **0 advisories** for both lockfiles. Web audit metadata: 834 total dependencies; mobile: 572. This checks registry advisory data for the lockfiles, not runtime reachability, native compatibility, all upstream advisories or licensing. No major/minor upgrades were performed.

Manifests differ intentionally by app: web React 19.2.8/TS ^5 versus mobile React 19.2.3/TS ~6.0.3; framework constraints must drive alignment, not a blind deduplication. Separate lockfiles are not duplicate libraries within a single app. Mobile sharp is a dev dependency for icon generation. Web `@types/bcryptjs` is a production placement candidate; confirm whether needed by current bcryptjs before moving/removing.

No source imports found for web firebase, cloudinary, @react-google-maps/api, react-hook-form or @hookform/resolvers in the inspected source search; mobile form/resolver libraries likewise appear unintegrated. They may be planned integrations; verify assets/build/tooling before removal. `cn` is actively used throughout UI and must not be removed as an assumed typo. `shadcn` is imported from globals.css, so do not blindly move it to dev-only or remove it. Redux is actively provided even though web reducer is placeholder. TASK-032.

Lockfile metadata includes a deprecated transitive ESLint entry in web and a deprecated transitive uuid entry in mobile. The root web ESLint is ^9; do not confuse the transitive entry with the declared root version. Trace parent dependencies and compatibility, update the narrow owner package if supported, then rerun lint/build/native checks. Deprecation alone does not mean a known vulnerability. TASK-030/032.

Performance acceptance: record baseline p50/p95/error rate with representative data; establish budgets from product traffic/device requirements; compare proposed indexes with explain; measure route bundle sizes after successful build; profile list scroll/startup on a lower-end Android device and iPhone. No arbitrary 100ms startup or 90% coverage target is justified by current evidence.
