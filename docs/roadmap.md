# Roadmap

Current step: **Phase 0 — Environment and project setup**, next slice **0.8** (slices 0.1–0.7 done; 0.8 needs the repository hosted on a remote).

Full feature spec: `requirements.md`. Technical decisions: `decisions.md`. Quality bar for every slice: `engineering-standards.md` (section 8, definition of done).

How we work: one **slice** at a time. Each slice = plan → approval → Flyway migration → backend (service, controller, tests) → frontend (service, components) → run tests and app → commit when asked. Tick the box when a slice is done.

Milestone **★ Usable core** = Phases 0–3 (sign in, projects, tasks, workflow, time tracking). Aim to put this in front of the team before building the rest.

---

## Phase 0 — Environment and project setup

- [x] 0.1 Audit the machine: Java, Node, npm, Docker, Git versions already installed
- [x] 0.2 Choose and record pinned versions (Java LTS, Spring Boot, build tool, Node, Angular) in `CLAUDE.md`
- [x] 0.3 Local MySQL 8 via `docker compose` + `.env.example`
- [x] 0.4 Create the Spring Boot project in `backend/` (Flyway, Spring Security, springdoc, Testcontainers); health endpoint; first empty migration
- [x] 0.5 Create the Angular project in `frontend/` (standalone, strict, Material); app shell with routing
- [x] 0.6 Connect them: frontend calls backend health endpoint (dev proxy instead of CORS); fill in the Commands section of `CLAUDE.md`
- [x] 0.7 `.gitignore`, README with run instructions, first commit
- [ ] 0.8 CI pipeline: on every push and pull request, build and test both apps (backend `./mvnw verify` on JDK 21; frontend `npm ci`, `ng lint`, `ng test --watch=false`, `ng build` on Node 24), plus a dependency vulnerability report and secret scan. Needs the repository hosted on a remote (platform chosen then; GitHub Actions if it is GitHub). Details in `engineering-standards.md` section 4.2

**Done when:** both apps start from the documented commands and the frontend shows the backend's health status; once the repository is hosted, CI runs green on push.

## Phase 1 — Foundation and access control

- [ ] 1.1 API conventions: error response format, `@ControllerAdvice`, `docs/api-conventions.md`
- [ ] 1.2 Audit event foundation: append-only table + a service other modules call
- [ ] 1.3 Users table, BCrypt password hashing, create-first-manager mechanism (seed/CLI)
- [ ] 1.4 Email/password sign-in with session cookie; logout; current-user endpoint
- [ ] 1.5 Frontend: login page, auth service, route guard, HTTP interceptor, app layout/nav
- [ ] 1.6 Fixed roles + method security; deactivated users cannot sign in
- [ ] 1.7 Manager: user management (create/edit/deactivate/reactivate) — backend then UI
- [ ] 1.8 Password reset (email sending can be a logged stub until Phase 6)

**Done when:** deactivated users can't sign in; role checks are enforced server-side; account changes appear in the audit table.

## Phase 2 — Projects and core task workflow

- [ ] 2.1 Projects: create/edit, owner, dates, task prefix
- [ ] 2.2 Project membership: add/remove, server-side membership check used everywhere
- [ ] 2.3 Tasks: table, create (quick create), task key allocation (transactional counter)
- [ ] 2.4 Task list UI (table view) + create dialog
- [ ] 2.5 Task detail side panel; inline editing with Saving/Saved/Error; version column for optimistic locking
- [ ] 2.6 Primary owner + collaborators
- [ ] 2.7 Status workflow: transition map in one backend class, used by every entry point; block/unblock with reason
- [ ] 2.8 Review/testing stages
- [ ] 2.9 Labels
- [ ] 2.10 Activity timeline (reads the audit table)
- [ ] 2.11 Archive/restore
- [ ] 2.12 Conflict-handling UI (reload-or-choose)

**Done when:** a task can be created and worked through valid transitions; invalid transitions are rejected consistently; changes show in history; cross-project access is blocked.

## Phase 3 — Manual time tracking and reports

- [ ] 3.1 Time entries: create/edit own, with version history
- [ ] 3.2 Time tab in task detail + high-time warning
- [ ] 3.3 Aggregation rule implemented once (task and project totals, no double counting)
- [ ] 3.4 Estimated vs actual; role-aware report access
- [ ] 3.5 Time report page with filters

**Done when:** totals reconcile with entries; members can't see others' individual time.

> ★ **Usable core reached.** Try it with the team before continuing.

## Phase 4 — Bugs, rework, subtasks, dependencies, templates

- [ ] 4.1 Bug and rework as linked tasks (with rework reason)
- [ ] 4.2 Bug/rework time in reports
- [ ] 4.3 Subtasks + parent-completion rule and override
- [ ] 4.4 Dependencies (blocked by / blocking)
- [ ] 4.5 Duplicate link and duplicate-task action
- [ ] 4.6 Basic templates
- [ ] 4.7 Watchers/followers
- [ ] 4.8 Comments (with edit history) and attachments (limits decided at this point)

## Phase 5 — Views, search, dashboards

- [ ] 5.1 Personal dashboard
- [ ] 5.2 Kanban view (same transition validation)
- [ ] 5.3 Calendar view
- [ ] 5.4 Per-project view preferences
- [ ] 5.5 Global search (permission-aware, paginated, suggestions)
- [ ] 5.6 Manager/team dashboard and project dashboard
- [ ] 5.7 Copy/share links, access-denied page, keyboard shortcuts, previous/next navigation, view-state restore

## Phase 6 — Notifications, daily updates, access requests

- [ ] 6.1 In-app notifications + preferences
- [ ] 6.2 Email delivery with retry and dedupe
- [ ] 6.3 Background jobs: deadline, blocked, review reminders
- [ ] 6.4 Working calendar (days, holidays, update deadline)
- [ ] 6.5 Daily update draft → edit → submit; manager summary
- [ ] 6.6 Access requests (request, approve/reject/cancel, one reminder)
- [ ] 6.7 Browser push / PWA (last, optional for first release)

## Phase 7 — Lifecycle, admin, import/export, operations

- [ ] 7.1 Milestones and timeline warnings
- [ ] 7.2 Project close/reopen
- [ ] 7.3 Offboarding queue: outstanding work, bulk reassign; ownerless-project alert
- [ ] 7.4 CSV/Excel export
- [ ] 7.5 Guided import with preview
- [ ] 7.6 Backup + restore procedure and test
- [ ] 7.7 Google sign-in (can move earlier if wanted)

## Phase 8 — Stabilisation and pilot

- [ ] 8.1 Permission-boundary and cross-project tests
- [ ] 8.2 Workflow, aggregation, notification tests
- [ ] 8.3 Performance checks (lists, search, reports): seed data and load test, measured against the targets in `engineering-standards.md` section 1
- [ ] 8.4 Accessibility and responsive pass
- [ ] 8.5 Deployment configuration and operational docs
- [ ] 8.6 Pilot with the team; fix and release

---

## Differences from the original phase plan

- Added **Phase 0** (environment) — required before any feature work.
- **Time tracking moved before bugs/rework/subtasks** (original Section 17 order), so the usable core arrives sooner.
- **Google sign-in and browser push** moved later within their areas; email/password and in-app/email notifications come first.
- **Optimistic-locking version column** is built in Phase 2; the conflict-resolution UI follows as a separate slice.
