# Development roadmap

Phase 1 produces the audit suite and task register only. Tasks in the appended section of [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) are authoritative for this audit; earlier generic claims and week estimates are retained as historical context, not verified commitments.

| Phase | Work and dependency order | Exit gate |
| --- | --- | --- |
| 1 Audit & documentation | Source/API/model/screen inventories, task evidence and known verification limits | Reports exist; business code untouched by audit; working-tree drift recorded |
| 2 Critical fixes | Contain public exposure/fake payments (001/002); restore compilation (005); active principal/session (006); enforce ownership/field permissions (003/004); OTP/privileged data (007/008) | Types/build pass; negative auth/ownership tests; no fabricated money or exposed private fields |
| 3 API refinement | 009/010 contracts/error/validation; 011 methods; 012 job state/pricing; 013 attendance/disputes/projects; prepare 024 migrations and 026 shared contracts | Both client fixtures agree with API; owner/role checks and durable invariants pass |
| 4 Web refinement | 014 login/shell; 015 real analytics/contractors; 016 operational actions; 017 finances; 019 configuration/business flows; 020 responsive/accessibility | Every visible control has a tested result; no demo business data |
| 5 Mobile refinement | 018 profile/upload/onboarding; customer/worker flows from 009/012/013/017; 022 lifecycle/network/session; 023 notification/chat if approved | Android/iOS journey tests incl. slow/offline/expired sessions; no static inbox |
| 6 State/data architecture | 026 DTO/runtime schemas, query ownership/invalidation; 024 additive integrity migrations | No cache leakage across users; server is money/status source of truth |
| 7 Performance | 021 server filters/pages/aggregates; 025 measured query/bundle/list optimization | Representative-data and device budgets established/measured |
| 8 Cleanup | 032 reference-verified dead code and dependencies | No broken imports/hidden feature removals; no major upgrades without compatibility evidence |
| 9 Testing | 029 unit/API/integration/E2E/security/concurrency; 030 builds/native/UI/perf evidence | All critical grant/deny and financial reconciliation cases pass |
| 10 Production readiness | 027 environment/CI/release config; 028 logs/audit/events; 030 staging restore/rollback/signing; 031 scope decisions closed | Checklist fully evidenced, P0/P1 closed, deployment decision reviewable |

Phases describe delivery groups, not permission to postpone security tests or infrastructure until the end. Add regression tests with each critical fix; establish disposable fixtures/CI early under 029/027. Migration planning (024) precedes financial/state implementation that needs new constraints. Final testing in phase 9 exercises the integrated journeys.

Dependency graph: 005 → testable baseline; 006 → 003/004/008/014; 001/002 containment can happen immediately. 003/004/007 + 009/010 → 011/012/013/018. 002/012/024 → 017; 009/010/024 → 019; 009/010/019 → 015/016/021. 006/009/026 → 022; 003/018/022/028 → 023. 020/021/022 → 025. 027/028/029 + all release-required feature tasks → 030; 031 determines optional scope; 032 follows verified functionality.

Financial provider integration needs configured sandbox merchant credentials and a transaction-capable staging database; push/native release needs project IDs, signing/provisioning and devices; production backups/monitoring require deployment context. Do not fake these dependencies. Use documented fixtures for local tests, never mock success in release UI. No destructive migration/deployment is authorized by completing this document.

Use small changes by module. Preserve user work, compare against a frozen commit before implementation, recheck any evolving file, and document each schema/contract compatibility change. Estimate effort after acceptance criteria and provider/release scope are agreed rather than asserting a 12-week delivery guarantee.
