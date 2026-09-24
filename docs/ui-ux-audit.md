# Web UI/UX audit

Static source review of every observed page and shared shell. Paths in the table are under `web/src/app`. A render/interaction audit is still required after compilation is restored; contrast, actual overflow, keyboard focus and screen-reader behavior are not claimed as tested.

| Page | Data/action chain and states | Finding / task |
| --- | --- | --- |
| page.tsx | Landing → Header/FeaturesSection | Malformed closing tags/imports, absent auth reducer/constants, icon identifiers. Sign In loops to `/`; profile link has no page. 005,014 |
| admin/page.tsx | useDashboardStats → analytics → counts → cards; spinner/error | API-backed headline stats; recentJobs/pendingVerifications absent from response; approval buttons inert. 015 |
| admin/users/page.tsx | search/role/page → users → User → table | Loading/error and page controls exist; add/view/enable/suspend menu actions absent. API exposes hashes; labels/status need DTO mapping. 008,016 |
| admin/users/contractors/page.tsx | local contractors array → client filter/table | All contractor rows and headline counts static; add/view inert. 015,019 |
| admin/services/categories/page.tsx | search → categories; dialog fields → create → schema → DB → invalidate | Real create path; edit/delete/subcategory maintenance incomplete. Validation/error/success feedback needs consistent field-level behavior. 016 |
| admin/services/kyc/page.tsx | workers list → client status/search → PATCH worker | Reads w.name/w.skill/worker.id; server sends userId.name/skills/_id and expects userId for target. No stable document review or pending/error feedback per row. 016 |
| admin/jobs/page.tsx | search/status/page → jobs list → table | Real list and loading/error; create/detail/chat/cancel items inert; filter change does not consistently reset page. 012,016,021 |
| admin/jobs/projects/page.tsx | useProjects → cards/list | Create/detail inert; page-based progress/value counts; no usable pagination controls for all records. 019,021 |
| admin/jobs/quotations/page.tsx | jobs page → pricingModel filter → quote cards | Filters after pagination, totals belong to all jobs, amount field mismatched; no submit/compare/accept quote workflow. 019,021 |
| admin/payments/page.tsx | payments → page sums → transactions/payout tabs | Payouts filtered from Payment.type although separate Payout model; balance wrong; row detail/download/export controls unimplemented. 017 |
| admin/attendance/page.tsx | useAttendance → cast envelope to array → filter | `.filter` on response object fails after successful fetch; reads worker/job/customer/hours/wage instead of populated IDs/workingHours/approvedWage. Client date/search only; export inert. 016 |
| admin/disputes/page.tsx | search/status → disputes → table | Real list/loading/error; view/resolve inert; refund sum reads amount absent from model. 013,019 |
| admin/promotions/page.tsx | promotions list; create dialog | Submit just closes modal, no mutation/validation; error state missing; page cap 50 hides remaining rows. 019,021 |
| admin/analytics/page.tsx | static monthly/services/locations/workers arrays and cards | Fake financial/operational insights and no-op export; no real chart API. 015 |
| admin/settings/page.tsx | static defaults/rules/areas and controls | No save API or persistence; commission/cancellation values imply real rules without matching server source of truth. 019 |

Shell: `admin/layout.tsx` renders unguarded admin content with fixed w-64 sidebar, h-screen and padded main. Sidebar links to absent customers/workers and payment transactions/payouts/commission/refunds routes. Parent groups expand rather than navigate, making some existing parent pages less discoverable. Logout has no handler. Expanded groups lack aria-expanded; active links lack aria-current. TASK-014/020.

## Consistent design and interaction specification (TASK-020)

Retain existing Base UI wrappers in `components/ui` and current brand assets. Align mobile constants with semantic web tokens: background/surface/text/muted/border/primary/danger/success/warning; use status text with color, never color alone. Use a 4/8/16/24/32 spacing scale, shared field/button/card radii and a restrained heading/body hierarchy. Keep shadows for overlays, not every dashboard card. Existing logo gradients are legitimate branding, not dummy data to remove indiscriminately.

Create reusable loading/error/empty panels, field-error presentation and submit feedback using existing primitives. Idle → pending (disabled submit) → success (server response + invalidation + feedback) or error (retained inputs + retry). Modal forms need labels linked to inputs, focus on first invalid field, error summary, focus restoration and confirmation for destructive/financial changes. Toast infrastructure exists but must be wired to actual outcomes. Do not close a dialog and imply success without a successful response.

For tables, keep searchable/filterable server pagination, stable row keys and accessible header/selection semantics. Mobile-size web layouts can horizontally scroll only the table region or show essential fields with an accessible details view; page navigation and modals must remain in viewport. Use debounced searches and reset page on filter changes. Show aggregate summaries from the server, not from visible records.

Use an off-canvas sidebar below the chosen tablet breakpoint with menu button, focus trap and Escape/backdrop close. Add min-width handling to main content and wrap filter rows. Keep existing useful cards; remove unsupported recent-activity/widgets until their API is connected. Implement visible control outcomes or explicitly present unavailable features without fake success.

## Responsive/accessibility acceptance matrix

Test 360/390px mobile, 768px tablet, 1024px laptop, 1440px desktop and 1920px large desktop; include zoom 200%, keyboard only and screen reader. Pages: login, dashboard, users, jobs, category dialog, KYC review, payments, attendance, settings. Verify no whole-page horizontal overflow, reachable pagination, fixed/sidebar scroll, dialogs within viewport, visible focus, labelled icon buttons, text contrast, semantic headings and form labels. On native, verify dynamic type and practical touch targets with platform accessibility tools. Store screenshots/test evidence and mark each viewport pass/fail; this audit has not run that matrix. TASK-020/030.
