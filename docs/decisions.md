# Technical Decisions

Status: **Proposed** = recommended, awaiting your approval. **Accepted** = approved. **Open** = to decide later in the named phase.

---

## Accepted (from `CLAUDE.md`)

- Angular + TypeScript (strict), Angular Material; standalone components, signals, OnPush.
- Java + Spring Boot REST API, Spring Security; modular monolith.
- MySQL 8 with Flyway migrations.
- OpenAPI/Swagger via springdoc.

## Proposed

### D1. MySQL, not PostgreSQL
The requirements draft suggested PostgreSQL; `CLAUDE.md` specifies MySQL 8. Keep MySQL. Trade-off: PostgreSQL has richer full-text search, but MySQL's `FULLTEXT` indexes are enough for ~10 users. Revisit only if search quality becomes a real problem.

### D2. Authentication: HttpOnly session cookie
Spring Security session cookie (`HttpOnly`, `Secure` in production, `SameSite=Lax`) plus CSRF protection. Trade-off: simplest and safest for a single web app because JavaScript never touches the credential; JWTs would add complexity (refresh, revocation) we don't need. It also makes "deactivated users are blocked immediately" easy — the account status is checked server-side on every request. Rules out `localStorage` tokens, consistent with `CLAUDE.md`.

### D3. Audit events: one generic append-only table
A single `audit_events` table (actor, timestamp, action type, entity type/id, project scope, old/new values as JSON, reason) written through one `AuditService`. The task Activity tab reads from it. Trade-off: generic table is simpler than one history table per entity; JSON old/new values keep it flexible. Rows are never updated or deleted by the application.

### D4. Task keys from a per-project counter
`projects.next_task_number` incremented inside the same database transaction that inserts the task, using a row lock (`SELECT ... FOR UPDATE`). Guarantees no duplicate keys under concurrent creation; gaps are acceptable (per requirements).

### D5. Status transitions live in one backend class
A single `TaskWorkflow` class holds the transition map and validation. Task detail, Kanban, bulk changes, and import all call it. The frontend only asks for a transition and shows the backend's reason if refused. Exact map is defined in slice 2.7.

### D6. Time stored as integer minutes
`time_entries.duration_minutes` is the canonical unit. UI converts to/from hours. Estimates use the same internal unit with hours/days as display units (final rule: Open, Phase 2).

### D7. Time aggregation: sum entries, never roll up totals
Project and task totals are computed by summing `time_entries` over a set of task IDs (the task alone, or the task plus its descendants for a "with subtasks" view). Parent totals are never stored or added on top of children, so double counting cannot occur.

### D8. Optimistic locking from day one
`tasks` gets a `version` column (JPA `@Version`). The conflict-resolution UI is built later (slice 2.12), but retrofitting the column is painful.

### D9. Identifiers
Internal primary keys are UUIDs for users and numeric auto-increment for others only if there is a clear reason; default to UUIDs stored as `BINARY(16)`. Task keys (`ERP-1042`) are separate and human-facing.

### D10. Repository layout and package-by-feature
As in `CLAUDE.md`: `backend/` packages `users`, `projects`, `tasks`, `timetracking`, `audit`, etc., each with `api`, `service`/`domain`, `persistence`.

## Open (decide when reached)

| Topic | Decide in |
|---|---|
| Pinned versions of Java, Spring Boot, Node, Angular, build tool (Maven vs Gradle) | Phase 0, slice 0.2 — after checking what's installed |
| Status transition map details, reviewer/tester assignment | Phase 2, slices 2.7–2.8 |
| Estimate units and precision | Phase 2 |
| Restore-permission policy for archived tasks | Phase 2, slice 2.11 |
| Time-warning threshold | Phase 3 |
| Report formulas for cancelled/archived tasks | Phase 3 |
| File limits, types, storage location, malware scanning | Phase 4, slice 4.8 |
| Notification defaults and email provider | Phase 6 |
| Backup frequency, retention, hosting | Phase 7–8 |
| Import column mapping | Phase 7 |
| Organisation / SaaS architecture, manager succession | After internal MVP |
