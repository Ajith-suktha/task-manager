# Engineering Standards

Practical, checkable standards for a ~10-person internal team. They are deliberately small: each one should be something a test, a CI check or a short review can verify. Add a standard only when it can be checked.

**How to use this file**

- Every slice in `roadmap.md` is reviewed against the relevant sections before it is ticked.
- **Targets are not guarantees.** Numeric figures are goals to *validate with measurements* (see 1.1). If a measurement misses its target, we record the result, then either fix the code or change the target here with a reason. We never claim a target is met without a measurement.
- Items marked *(proposal)* are my recommended defaults and become binding once you approve them.
- "Enforced by" says how a standard is checked: **CI** (automatic on every push/PR), **test** (an automated test we write with the feature), or **review** (manual check at slice end).

Related: `CLAUDE.md` (rules), `decisions.md` (technical choices), `requirements.md` (product).

---

## 1. Performance

### 1.1 How performance is measured

A number without conditions is meaningless, so every target below assumes these conditions unless stated otherwise:

| Condition | Value |
|---|---|
| Environment | Backend and MySQL running locally via Docker on a development machine, or the staging server once it exists. Record which one. |
| Dataset | Seeded "realistic" data: 10 users, 20 projects, 10,000 tasks, 50,000 time entries, 200,000 audit events. A seed script is part of slice 8.3 (and can be created earlier). |
| Load | 10 concurrent virtual users, mixed read/write (about 90/10), for at least 5 minutes after a 1-minute warm-up. |
| Statistic | **p95** server response time (95% of requests are faster). Also record **p50** and **max**. Averages are not reported. |
| Scope | Server-side time for an authenticated request, excluding network latency to the browser. |
| Tool | A scripted load test (for example k6 or Gatling; the choice is made in slice 8.3 and added as a dev-only tool). |

Single-request timings during development are fine as a smoke check, but only the load-test result counts.

### 1.2 Backend targets (p95, conditions above)

| Request type | Target | Enforced by |
|---|---|---|
| Task/project list (one page, filtered and sorted) | ≤ 300 ms | load test (8.3) |
| Task detail with related data | ≤ 200 ms | load test |
| Create/update/status change | ≤ 300 ms | load test |
| Search (suggestions) | ≤ 300 ms | load test |
| Search (full results page) | ≤ 500 ms | load test |
| Dashboards | ≤ 800 ms | load test |
| Time/project reports (one month, one project) | ≤ 2 s | load test |
| Sign-in | ≤ 500 ms (BCrypt cost is deliberate, do not lower it to hit this) | load test |
| CSV/Excel export | starts streaming within 2 s; bounded size (see 5.4) | review |

### 1.3 Frontend targets

| Item | Target | Enforced by |
|---|---|---|
| Initial JS (transfer size, gzip/brotli) | ≤ 250 kB | CI (Angular bundle budget in `angular.json`, tuned when set) |
| Each lazy feature chunk | ≤ 100 kB transfer | CI (budget) |
| Time to interactive after sign-in, mid-range laptop, LAN to staging | ≤ 2.5 s (p75, measured with Lighthouse or browser traces) | review at 8.4 |
| Long lists (over 100 rows) | virtual scrolling or pagination, never render everything | review |
| Search box | debounced (about 300 ms), cancels in-flight requests | test |
| No change detection storms | components use `OnPush`, state in signals | lint/review |

Current baseline for reference: the skeleton's initial bundle is about 60 kB transfer.

### 1.4 Rules that keep performance honest

- No performance "optimisation" without a measurement before and after.
- No caching until a measured bottleneck needs it. The first fix is always an index or a better query.
- Slow-request logging: any request above 1 s is logged at WARN with its request ID (see 6).

---

## 2. Reliability and stability

### 2.1 Targets (proposal, to be confirmed before production, see `requirements.md` 11.3)

| Item | Target |
|---|---|
| Availability | 99.5% during agreed working hours, measured monthly from the health check. Planned maintenance excluded and announced. |
| Recovery point objective (RPO) | ≤ 24 hours of data loss (daily backups, tightened if the team needs it). |
| Recovery time objective (RTO) | ≤ 4 hours to restore from backup onto a clean machine. |
| Restore test | performed and documented at least once before first production use, then every 3 months. |

### 2.2 Rules

- **Stateless backend:** no user state in application memory. Sessions are stored in the database (`Spring Session JDBC`, to be added when slice 1.4 is planned), so a restart does not sign everyone out and a second instance could be added. *(enforced by review/test)*
- **Timeouts on every external call:** database query timeout 5 s, HTTP/email provider connect 3 s and read 10 s *(proposal)*. No unbounded waits. *(review)*
- **Bounded resources:** the database connection pool has a fixed maximum (default 10 is enough for this team); thread pools and upload sizes are bounded.
- **Retries:** only for idempotent operations, at most 3 attempts, with backoff. Email/push delivery retries are tracked in the `notifications` table (requirements 9.1).
- **Background jobs are idempotent:** running a job twice must not send two emails or create duplicates; use a dedupe key. *(test)*
- **Concurrency:** use optimistic locking (`version` column) for task edits; return a clear conflict response (HTTP 409), never overwrite silently. Unique constraints in the database back up application checks (for example `task_key`). *(test)*
- **Transactions:** each service method that changes more than one record runs in one transaction, including its audit event. *(test)*
- **Graceful shutdown** enabled so in-flight requests finish during a deploy. *(review at 8.5)*
- **Health checks:** `/actuator/health` already exists; keep a readiness check that includes the database. *(CI smoke test later)*
- **Failure of optional features must not break core work:** if email or push is down, task changes still succeed and notifications retry.

---

## 3. Security

Baseline rules already in `CLAUDE.md` still apply (secrets out of git, BCrypt, server-side authorization). Added measurable checks:

| Standard | Enforced by |
|---|---|
| Every endpoint states who may call it (annotation or documented in OpenAPI) | review |
| Every endpoint that touches project data has permission tests for: allowed role, forbidden role, and a user from another project (the cross-project case) | test |
| Search, counts, exports, notifications and error messages never reveal inaccessible data (requirements section 13) | test |
| Passwords hashed with BCrypt (or stronger), never logged | test/review |
| Sign-in and password-reset are rate-limited (proposal: 5 failed attempts per account and IP per 15 minutes, then a delay or lock) | test |
| Session cookie is `HttpOnly`, `Secure` outside local dev, `SameSite=Lax`; CSRF protection on (decision D2) | test |
| All request bodies validated with Bean Validation; unknown or oversized input rejected | test |
| File uploads: size and type limits and access checks on download (limits decided in slice 4.8) | test |
| No secrets in git; `.env` ignored; CI fails if a known secret pattern is committed (a scanner is chosen when CI is set up) | CI |
| Dependencies checked for known vulnerabilities on every PR (`npm audit` for the frontend, a Maven dependency check for the backend; tool chosen in slice 0.8) | CI (report first, then fail on high severity) |
| Dependency updates reviewed at least monthly | review |
| Security-relevant actions (login failures, role changes, deactivation, exports) are in the audit log | test |

---

## 4. Testing

### 4.1 Rules

- **Business rules get unit tests; behaviour across layers gets integration tests.** Status transitions, permission decisions, time aggregation, parent-completion rules and task-key allocation each need dedicated tests, including edge cases.
- **Backend integration tests use a real MySQL** (Testcontainers), never an in-memory substitute. *(already set up)*
- **Every new endpoint ships with tests** for success, validation failure, and each permission case in section 3.
- **Frontend:** components and services with logic have tests; trivial display-only components do not need them.
- **Bug fixes start with a failing test** that reproduces the bug.
- **No flaky tests:** a test that fails intermittently is fixed or removed within the same week, not retried until green.
- **Tests are independent:** each creates its own data and does not depend on order.
- **Coverage is a signal, not a goal.** Guideline *(proposal)*: ≥ 80% line coverage on backend service/domain code; no number for the frontend. A drop is discussed in review, not blocked mechanically.
- **Test data builders/fixtures** are shared so tests stay short.

### 4.2 What CI runs (see roadmap slice 0.8)

| Job | Commands |
|---|---|
| Backend | `./mvnw verify` (compile, unit and integration tests) on JDK 21 |
| Frontend | `npm ci`, `npx ng lint`, `npx ng test --watch=false`, `npx ng build` on Node 24 |
| Both | run on every push and every pull request; a red build must be fixed before merging |

---

## 5. Database queries and pagination

### 5.1 Schema and migrations

- Schema changes only through Flyway migrations; applied migrations are never edited.
- Foreign keys for relationships; unique constraints for business uniqueness; `NOT NULL` where a value is required.
- Dates in UTC; durations as integer minutes (decision D6).

### 5.2 Query rules

| Standard | Enforced by |
|---|---|
| Every column used in a filter, join or sort of a list query has a supporting index; the index is added in the same migration as the feature | review |
| New list or report queries are checked with `EXPLAIN`; no full table scan on tables expected to exceed 1,000 rows; the plan is noted in the PR or slice notes | review |
| No N+1 queries: list endpoints have a test asserting a maximum query count (for example ≤ 5 queries for a page of 20 tasks) | test |
| No queries inside loops; load related data with joins or one batched query | review |
| Aggregations (totals, reports) are done in SQL, not by loading rows into Java | review |
| Entities are never returned by the API (DTO projections or explicit mapping) | review (already a `CLAUDE.md` rule) |
| `open-in-view` stays off (already configured) | CI/test |
| Local MySQL `long_query_time` set to 0.5 s in development; any logged slow query is investigated before the slice is ticked | review |
| Full-text search uses MySQL `FULLTEXT` indexes for text, plus exact `task_key` lookup | review |

### 5.3 Pagination

- **Every list endpoint is paginated.** Default page size **20**, maximum **100**, enforced on the server (requests above the maximum are capped or rejected). *(test)*
- **Stable ordering:** every sort includes the primary key as the final tie-breaker, so pages never repeat or skip rows. *(test)*
- **Offset pagination** (page/size) for normal lists. For append-heavy lists that can grow large (activity timeline, audit events, notifications), use **keyset pagination** (`created_at, id` cursor). *(review)*
- **Totals** are returned only where the UI shows them; a count query is a separate, indexed query and may be skipped for large lists.
- Search results: 20 per page with "Load More" (requirements 6.2); no infinite scroll.
- Response shape for lists is defined once in `docs/api-conventions.md` (slice 1.1) and reused.

### 5.4 Exports and imports

- Exports are streamed, not built fully in memory, with a documented row limit *(proposal: 50,000 rows per export)* and the same permission checks as the in-app report.
- Imports validate and preview before writing (requirements 11.2) and run within a size limit *(proposal: 5,000 rows per file)*.

---

## 6. Logging and observability

| Standard | Enforced by |
|---|---|
| Logs are structured (key/value or JSON in non-local environments) | review (to be set up when slice 1.1 is planned) |
| Every request has a **request ID**: generated at the edge, returned in a response header, and included in every log line and in error responses | test |
| Levels: ERROR for failures needing attention, WARN for recoverable problems and slow requests (> 1 s), INFO for important business events, DEBUG off by default | review |
| **Never log** passwords, tokens, session IDs, full request bodies containing personal data, or full email addresses where avoidable | test/review |
| Logs are not the audit trail: business history lives in `audit_events` (decision D3); logs are operational and may be deleted after 30 days *(proposal)* | review |
| Actuator exposes only `health` for now; metrics (response times, connection pool, JVM) are added with Micrometer when slice 1.1 is planned, and kept internal | review |
| Frontend does not log sensitive data to the console; unexpected errors are reported through one global error handler | review |

---

## 7. Error handling

### 7.1 Backend

- **One error format** for all errors via a global `@ControllerAdvice`, documented in `docs/api-conventions.md` (slice 1.1). It always contains: HTTP status, a stable machine-readable error code, a human-readable message, the request ID, and field-level details for validation errors. *(test)*
- Correct status codes: 400 validation, 401 not signed in, 403 not allowed, 404 not found *(also used instead of 403 where revealing existence would leak data)*, 409 conflict (stale version, duplicate), 422 for business-rule violations *(proposal; consistent once chosen)*, 429 rate limited, 500 unexpected.
- **No stack traces, SQL or internal class names** in responses. *(test)*
- Unexpected exceptions are logged once with the request ID, then returned as a generic 500.
- Business-rule violations (for example an invalid status transition) return a specific error code and reason the UI can show.

### 7.2 Frontend

- All HTTP errors pass through one interceptor; components show a clear message and a retry action where it makes sense.
- Every screen has explicit loading, empty and error states (requirements section 13).
- Automatic retry only for safe GET requests, and only for network errors/timeouts, at most once.
- 401 sends the user to sign-in without losing unsaved work where possible; 409 shows the "reload or choose" conflict flow (slice 2.12).
- Save state is always visible: Saving, Saved or Error (requirements 5.3).

---

## 8. Definition of done (per slice)

A slice is ticked in `roadmap.md` only when all of these are true:

- [ ] Backend `./mvnw verify` and frontend lint, tests and build pass locally; CI is green once CI exists.
- [ ] New business logic and every new endpoint have tests, including permission and cross-project cases.
- [ ] New list/report queries: indexes added, `EXPLAIN` checked, page size capped, query-count test where relevant.
- [ ] No new secrets, no sensitive data in logs.
- [ ] Errors use the standard format; the UI shows loading, empty and error states.
- [ ] OpenAPI annotations and `docs/` updated where contracts or architecture changed.
- [ ] Performance targets in section 1 re-measured if the slice touches a measured endpoint or adds a new list.
- [ ] Anything skipped or only partly verified is written down in the slice notes.

---

## 9. Review cadence

- **Each slice:** section 8 checklist.
- **Phase end:** re-run the load test on the endpoints added in that phase once the load-test script exists (from Phase 3 onward, sooner if cheap).
- **Phase 8:** full load test against all targets in section 1, restore test, dependency and security scan, results recorded in `docs/` (for example `docs/performance-results.md`).
- **Whenever a target is missed or changed:** note the date, the measurement and the reason in this file.
