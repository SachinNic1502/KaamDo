# Dead/unused code candidates

No code or dependencies deleted. References checked with rg across application source; dynamic imports, CSS/tooling and external clients need separate checks before removal. This is not a blanket dead-code claim.

| File / symbol | Reason considered unused | References | Safe to delete? / task |
| --- | --- | --- | --- |
| mobile/src/screens/worker/JobsScreen.tsx / mockJobs | Static fixture never used for allJobs/render | Definition only; actual path uses jobsRes.data | Likely yes for this constant after tests; not the screen. 032 |
| web/src/lib/auth-middleware.ts / requireRole | Routes inline their role checks | Definition only | No: reuse during centralized policy work. 003 |
| web/src/lib/auth.ts / signRefreshToken, verifyRefreshToken | No refresh endpoint/caller | Definitions only | No: resolve session design then integrate/remove. 006 |
| web/src/lib/services/redis-client.ts / CacheService, SessionStorage | Helpers unused outside module | Definition/internal references; OtpStorage actively imported by auth | No whole-file deletion; review unused classes after session work. 006,025,032 |
| web/src/lib/middleware/cors.ts / withCors | No route wrapper usage | Local definitions only | Integrate a single origin policy or remove after config migration. 027 |
| web/src/lib/middleware/sanitization.ts | No route imports | Local functions only | Candidate replacement with schema/field allowlists; don't activate destructive string stripping. 010,032 |
| web/src/lib/middleware/api-validation.ts | No provider/route callers | Local functions only | Integrate environment validation or remove after provider work; masked-key health output should not be published. 027 |
| web/src/lib/middleware/rate-limit.ts / apiRateLimit, strictRateLimit | Business routes don't import these | authRateLimit actively used | No whole-file deletion; wire deliberate limits. 007,027 |
| web/src/hooks/use-payment-methods.ts | No screen imports found | Definitions only | No: incomplete intended feature; repair contract/export then wire or explicitly de-scope. 011 |
| web/src/hooks/use-api.ts / createProject/createPromo/deleteCategory/updateDispute families | Declared hooks with no connected page actions | Definition-only for inspected exports | Not obsolete: visible controls imply required workflows. 016,019 |
| web/src/lib/api-client.ts / removeToken | Logout not wired | Definition only | Integrate logout instead of deleting. 014 |
| mobile/src/services/chat.ts / disconnectSocket | Imported in ChatScreen but not invoked there | Definition + unused import | Needed for session teardown. 022 |
| mobile/src/screens/customer/JobDetailScreen.tsx / createPayment mutation | Declared but initiatePayment used instead | Hook setup, pending flag used by wrong flow | Remove competing path only after verified gateway integration. 017 |
| web/src/store/index.ts | No-op `_` reducer; no valid auth | Providers uses store; landing/Header incorrectly expect auth | Not currently unused package; choose minimal web session implementation then remove redundant Redux. 014,026 |
| web/public default next/vercel/window/globe/file SVGs | Starter assets, no observed product usage | Verify public URL external use before removal | Candidate only. 032 |
| web/src/components/ui/* | Some wrappers not yet used by pages | Import graph/tooling may change as forms completed | Keep useful primitives until UI task completes; don't delete based on one grep. 020,032 |

ContractorProfile/Commission/Payout models are incomplete integration, not safely dead data. Public APIs may have external clients; no API is approved for deletion solely because local code lacks a caller. Brand SVG variants, manifests and generated assets can be referenced outside TypeScript. Review actual builds and documentation before cleanup.
