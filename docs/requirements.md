# Task Management App — MVP Requirements

Source of truth for **what** the product does. For **how** and **in what order**, see `roadmap.md` and `decisions.md`.

**Version:** Consolidated requirements baseline
**Initial team:** ~10 people and one manager; multiple projects
**Working principle:** Build a practical internal task-management product first. Keep the code organised so future commercialisation remains possible, but defer SaaS-specific decisions.

> Note: Section 12 (database) and Section 13 (architecture) are recommendations. Where they conflict with `CLAUDE.md` or `decisions.md` (e.g. PostgreSQL vs MySQL), those two files win.

---

## 1. Product goal

Build a simple, fast task-management app that helps a small team work across multiple projects while giving the manager reliable visibility into progress, blockers, bugs, rework, deadlines, and where time is spent.

The product should make the daily workflow straightforward:

1. Create a task quickly and place it in a project.
2. Assign one accountable primary owner and, when needed, additional collaborators.
3. Move work through a clear status workflow.
4. Record each person's time against the work they actually performed.
5. Link bugs, rework, subtasks, and dependencies to the relevant work.
6. Make blocked, overdue, waiting-for-review, and at-risk work easy to find.
7. Generate useful daily updates from existing task activity and time entries, while allowing people to add context.
8. Give the manager an accurate team-wide view without exposing individual information to people who are not authorised to see it.

### Product principles

- **Quick daily use beats feature density.** The common actions must be fast and predictable.
- **One accountable owner.** Each task has exactly one primary owner, even when several people contribute.
- **Preserve history.** Reassignment, edits, status changes, time edits, archive/restore, approvals, and administrative actions must remain auditable.
- **Don't silently change responsibility.** Deactivation, project access removal, or reactivation must not silently rewrite assignments or historical records.
- **Time tracking is per person.** A shared task can have a combined actual-time total, but individual entries remain attributable to the person who performed the work.
- **Use one consistent task engine.** Tasks, bugs, rework, features, improvements, research, and maintenance share the same core model and workflow wherever applicable.
- **Permissions are enforced in the backend.** Hiding a button is not a security boundary.
- **No offline mode in the initial version.** The first release is an online web app/PWA.

---

## 2. MVP scope and boundaries

### Included in the initial product

- Web app/PWA with responsive desktop and mobile layouts; online-only.
- Email/password sign-in, Google sign-in, password reset, active/deactivated account handling.
- Fixed roles: Manager, Project Owner, Team Member, plus explicitly granted additional permissions where needed.
- Multiple projects, project membership, project ownership, project settings, project dates, milestones, and project closure/reopening.
- Tasks with primary owner, collaborators, status, priority, estimate, deadline, labels, comments, attachments, subtasks, dependencies, and activity history.
- Task types: Task, Bug, Rework, Feature, Improvement, Research, Maintenance, and other manager-configurable types.
- Dedicated links and reporting for bugs and rework.
- Manual time entries; no live timer.
- Table, Kanban, and Calendar task views, with per-project view preferences.
- Personal dashboard and manager/team dashboard.
- Global search with permission-aware filters and paginated results.
- In-app, email, and browser-push notifications where supported; user notification preferences.
- Daily updates and daily summaries, including missing-update reminders on working days.
- Review and testing workflow stages, blockers, task dependencies, access requests, and manager review queues.
- CSV/Excel import and export, scheduled backups, and recovery procedures.
- Archive and restore; no permanent delete in the initial version.

### Explicitly deferred or excluded

- Temporary coverage / temporary-cover arrangements.
- Organisation onboarding flows, multi-organisation account switching, SaaS billing, subscriptions, and full commercial tenant administration. Revisit organisation architecture before commercial launch.
- Native mobile apps and offline editing/synchronisation.
- Live timers and start/end time tracking; manual duration entries only.
- Recurring tasks.
- Story points, skills profiles, workload-based automatic assignment recommendations, and advanced capacity planning.
- Custom fields and project-specific custom field configuration.
- Advanced custom roles; the initial product uses the fixed role model with limited explicit extra permissions.
- Automatic duplicate detection; duplicates are linked manually.
- Advanced templates with default assignees, subtask trees, or dependencies.
- Saved search filters and a custom query-builder.
- Advanced charts/trend analytics and automated weekly time summaries.
- PDF/print/custom-format exports.
- Permanent deletion as a routine action; consider a controlled retention/data-management process later.
- Extra two-factor authentication in the first release; revisit before external SaaS launch.

---

## 3. Roles and permission model

### 3.1 Roles

**Manager**

- Organisation-wide view and control for the current company.
- Create, edit, deactivate, and reactivate user accounts.
- Manage project owners, organisation settings, working days, holidays, and daily-update deadline.
- View all projects, dashboards, reports, tasks, bugs, rework, and individual time reports.
- Manage project ownership, project closure/reopening, access-request overrides, and user offboarding follow-up.
- Grant narrowly defined extra permissions to selected users; all changes are audited.

**Project Owner**

- Manage settings and memberships for their own project(s).
- Add/remove project members, manage project-specific settings, and manage work in those projects within their permitted actions.
- View individual and combined time reports for their own projects.
- Decide access requests for their own project; the manager can override.
- Can close/reopen their project under the project lifecycle rules.
- Cannot manage other projects unless explicitly authorised.
- Cannot appoint or replace project owners; only the manager can do this.

**Team Member**

- Work within projects they belong to.
- Create tasks, assign tasks, collaborate, update task details, comments, files, status, reviews/testing, dependencies, labels, and time entries within the rules below.
- View their own time entries and combined task/project actual-time totals for accessible projects, but not other members' individual time breakdowns.
- Request access to a project they cannot access.

**Explicit extra permissions**

- Manager may grant selected additional permissions without creating custom roles.
- Extra permissions must be individually identifiable, auditable, and scoped as narrowly as possible.
- Do not create a general-purpose permission editor in the MVP.

### 3.2 Permission matrix

| Action | Manager | Project Owner | Team Member |
| --- | --- | --- | --- |
| View all projects | Yes | No; only own projects unless separately authorised | No; only member projects |
| Create tasks | Yes | Yes, in own projects | Yes, in accessible projects |
| Assign primary owner/collaborators | Yes | Yes, in own projects | Yes, in accessible projects |
| Edit task details after work starts | Yes | Yes, within project access | Yes, if assigned to the task |
| Log/edit own time | Yes | Yes | Yes |
| View all individual time reports | Yes | Own projects only | No; own entries only |
| Manage project settings/members | Yes | Own projects only | No |
| Appoint/replace project owner | Yes | No | No |
| Manage user accounts | Yes | No | No |
| Archive tasks | Any task | Tasks they created, subject to project access | Tasks they created, subject to project access |
| Restore archived tasks | Yes | Based on project permissions granted for restore | Based on project permissions granted for restore; manager-controlled policy should be finalised in implementation |
| Close/reopen project | Yes | Own projects | No |
| Approve/reject review/testing | Any authorised role with access, subject to workflow permissions | Yes, with access | Any assigned member, including a contributor |
| Export reports | All data within manager authority | Own projects and permitted reports | Own permitted data only |

**Implementation note:** Some actions need a resource-specific check in addition to the role. For example, task edits depend on project membership and task assignment; time-report access depends on the report permissions; and project-owner permissions must never grant access to unrelated projects.

### 3.3 Account lifecycle

- The manager can create, edit, deactivate, and reactivate accounts.
- Before deactivation, show the person's open tasks, primary ownership, pending reviews, project memberships, and outstanding responsibilities.
- Deactivation blocks sign-in but preserves tasks, assignments, comments, attachments, time entries, and history.
- Deactivation does not automatically reassign work. Flag outstanding tasks/reviews for manager follow-up.
- The manager review queue supports individual or bulk reassignment of outstanding responsibilities. Original assignments remain visible in history.
- Reactivation restores the account only. Project memberships and permissions must be reviewed and explicitly restored. Historical records and assignments remain preserved.
- If a project owner becomes inactive, preserve the existing ownership record, flag the project as needing an owner, keep normal work running, and notify the manager. Only the manager can appoint a replacement.

### 3.4 Project membership removal

- Project owners can remove a member's access to their project.
- Removing access does not automatically change task assignments or pending reviews.
- Flag the member's outstanding assignments and pending reviews for project-owner follow-up.
- Preserve the member's historical work and recorded actions.
- A removed member cannot access project resources unless access is restored or otherwise explicitly authorised.

### 3.5 Access requests

- A user who opens an inaccessible task link sees an access-denied message and a **Request Access** action.
- Access requests are in-app and include requester, role, project, request date, and optional reason.
- Only one pending request per user/project is allowed; the requester can update the reason instead of creating a duplicate.
- The requester can cancel their own pending request, with an audit record.
- Project owners can approve/reject requests for their projects; the manager can override.
- Approval immediately grants standard project membership and notifies the requester. It does not grant extra permissions.
- Rejection notifies the requester and includes the reason when supplied. A new request may be submitted later.
- Request history preserves requester, decision-maker, timestamps, and decision reason.
- Requesters see their own requests; managers/project owners see only requests they are authorised to decide.
- Dashboard filters: status, project, requester, and request date. Sort pending first, then requests due for reminders, then oldest pending; completed requests follow.
- Send one reminder after a few working days if a request remains pending. It remains pending until decided; there is no automatic expiry and no repeated reminder loop.

---

## 4. Core task model

### 4.1 Task fields

Required on quick create:

- Title
- Project

Defaults:

- Creator becomes primary owner unless deliberately changed.
- Priority = Medium.
- Status = Open.
- Task ID is generated by the system.

Optional at creation or editable later:

- Description
- Task type
- Primary owner
- Collaborators/assignees
- Priority
- Estimate
- Deadline
- Planned start date
- Labels
- Review requirement
- Testing requirement
- Parent task/subtasks
- Dependencies
- Attachments and comments

### 4.2 Primary owner and collaborators

- Every task has exactly one primary owner.
- Additional assignees/collaborators may be added.
- Primary owner is accountable for the task's overall progress; each assigned member contributes to the shared work.
- Any member with project access can create a task and assign it to eligible members, including themselves.
- Assignment and collaborator changes are audited.
- Changing the primary owner does not erase previous ownership history.
- Each person logs their own time. Task actual time is the sum of all valid time entries for that task.

### 4.3 Status workflow

Core statuses:

`Open → Planned → In Progress → In Review → In Testing → Done`

Additional statuses:

- `Blocked`
- `Cancelled`

Rules:

- Review and testing are configurable per task; tasks can skip stages that are not required.
- A review request notifies the assigned reviewer. Approval moves work forward; requested changes return the task to In Progress with a reason.
- Testing failure returns the task to In Progress and may result in a linked bug/rework item.
- Blocking requires a reason. The system remembers the status before the block and restores that status when unblocked.
- Block/unblock reason, actor, and timestamps are recorded and the blocked state is visible on dashboards.
- A task can be marked Done by any assigned member once required review/testing is complete. Record who completed it and when; primary owner remains accountable.
- Reopening a Done task preserves the prior completion record and history.
- Kanban drag-and-drop requests a status transition; it must run the same validation as the task detail page. If required fields or approvals are missing, do not silently apply the transition.
- Bulk status changes validate each task separately and report any failed changes and reasons.

### 4.4 Priority and deadlines

Priorities: `Critical`, `High`, `Medium`, `Low`.

- Critical tasks receive clear visual emphasis.
- Priority changes are audited.
- Overdue tasks are clearly marked and appear in relevant dashboards.
- Notify responsible members and relevant manager/project owner about upcoming deadlines and overdue tasks.
- Deadline edits preserve old values and history.
- Project owners/managers are warned if task or milestone dates fall outside project start/end dates, but may proceed after the warning.

Default task-list sort:

1. Priority: Critical → High → Medium → Low.
2. Earliest deadline first within a priority.

Users may change sorting; preferences are remembered per project.

### 4.5 Task types, bugs, and rework

Configurable task types include:

- Task
- Bug
- Rework
- Feature
- Improvement
- Research
- Maintenance
- Other types configured by authorised administrators

**Bug**

- A bug is its own task linked to the task/feature where it was found.
- It has its own owner, collaborators, priority, estimate, status, time entries, and history.
- Uses the common workflow with review/testing stages where applicable.
- Bug-fixing time is separately reportable.
- Bug history and links remain even if the original task is Done or archived.

**Rework**

- Rework is a separate task linked to the original task.
- Required reason: Bug, Changed Requirement, Missed Requirement, or Review Feedback.
- It has its own owner, collaborators, status, estimate, time entries, and history.
- Original task history and time are not overwritten.
- Reports show rework time and reason.

The task system must permit multiple bugs or rework items to link to the same original task.

### 4.6 Subtasks and parent completion

- Subtasks have their own primary owner, collaborators, status, priority, estimate, dependencies, and time entries.
- They use applicable workflow, review, testing, blocker, and completion rules.
- Parent task displays subtask progress.
- By default, all subtasks must be Done or Cancelled before the parent can be marked Done.
- Manager or project owner may override the parent-completion rule with a recorded reason.
- Do not automatically mark a parent Done while required subtasks are still incomplete.

### 4.7 Dependencies

- Support `blocked by` and `blocking` links.
- Multiple blockers and multiple downstream tasks are allowed.
- Show relationships in both directions and highlight unfinished dependencies that are delaying work.
- A dependency link does not automatically change task status.
- Preserve dependency links in activity history and reports.

### 4.8 Duplicate tasks

- Support explicit manual linking and a duplicate status/relationship.
- Retain the duplicate task and its history for audit/reporting; identify the original task.
- No automatic duplicate detection in the MVP.
- Task duplication copies title, description, type, priority, estimate, labels, and applicable review/testing requirements.
- The person duplicating chooses project and assignees.
- A duplicated task starts with a fresh status and does not copy time entries, comments, attachments, or activity history.

### 4.9 Templates and labels

**Basic reusable templates** may contain:

- Title
- Description
- Default priority
- Estimate
- Review/testing requirements

Users can edit template-derived fields after task creation. No default assignees, dependency trees, or advanced subtask templates initially.

**Labels**

- A task can have multiple labels.
- Any member with project access can create/apply labels.
- Labels are searchable/filterable across task types and projects the user can access.

### 4.10 Watchers/followers

- Any member with access to the project can follow/unfollow a task.
- Followers receive relevant task updates according to notification preferences.
- Following a task does not grant access, make someone an assignee, or change responsibility.

---

## 5. Task creation, editing, and navigation

### 5.1 Quick create

- Require only title and project.
- Use the agreed defaults for creator/primary owner, Medium priority, and Open status.
- Optional fields can be expanded before saving or edited later.
- After creation, offer **Create task** (return to list) and **Create and open** (open task detail).
- Remember the user's preferred post-create behaviour.

### 5.2 Task detail

Default to a side panel so the current list/board/calendar remains visible. Offer a full-page mode for detailed work.

At the top show key information:

- Task ID and title
- Status and priority
- Primary owner and collaborators
- Deadline/planned start date
- Project context

Organised sections/tabs:

- Details
- Subtasks
- Time
- Comments
- Attachments
- Activity

Show a small recent-activity preview in the summary; the complete searchable/filterable timeline belongs in Activity.

### 5.3 Editing and concurrent changes

- Support inline editing of permitted fields with clear save feedback.
- If save-on-leave is used, clearly indicate pending/successful/failed saves.
- Detect conflicting edits to the same field from different users; ask the user to reload or choose a value rather than silently overwriting someone else's change.
- Preserve successful changes in audit history.
- Allow optional fields to be cleared with a short-lived Undo. Required fields cannot be cleared. Clearing a field is recorded in activity history.
- In the side panel, show `Saving`, `Saved`, or `Error`.
- Prevent navigation while a save is pending or failed; offer retry.
- When closing the panel, wait for pending saves. If saving fails, keep the panel open and offer Retry or Discard Changes.
- Panel width is responsive; adjustable/resizable on desktop and adapted to small screens.
- Previous/Next navigation moves through the current filtered/sorted result set.
- Closing a task returns to the exact previous list/board/calendar state where possible, including filters, sorting, grouping, and scroll position.
- Keyboard shortcuts for essential actions: create task, search, save where applicable, close panel, and navigate between tasks. Show shortcuts in the app and avoid intercepting keystrokes inside text inputs or browser shortcuts.

---

## 6. Task views, search, and dashboards

### 6.1 Task views

Provide three views over the same underlying data:

**Table**

- Title, status, priority, primary owner, deadline, estimate, actual time.
- Default flat list; optional grouping by status, assignee, priority, or task type.
- Remember per-project grouping, sorting, filters, and last selected view.

**Kanban**

- Default columns by status.
- Optional grouping by assignee, priority, or task type.
- Drag-and-drop invokes workflow validation and logs valid status transitions.
- Remember per-project view preferences.

**Calendar**

- Show task deadlines, planned start dates, and milestone dates.
- Filters and date changes follow the user's permissions and normal validation.
- Log all date changes.

### 6.2 Global search

Search across all tasks the user is allowed to access, including titles, descriptions, labels, task IDs, and linked bug/rework information.

Filters:

- Project
- Status
- Priority
- Assignee
- Task type
- Labels
- Date range
- Overdue
- Bugs
- Rework

Rules:

- Exact title matches are prioritised, followed by broader relevance; priority/deadline can break ties between similarly relevant results.
- Show live suggestions after a short debounce. Enter opens full search results.
- Initial page: 20 results; **Load More** retrieves the next 20. Do not use infinite scrolling.
- Result fields: title, task ID, project, status, priority, primary owner, deadline, and bug/rework indicator.
- Empty state offers useful search guidance, clearing filters where relevant, and a Create Task shortcut prefilled with the search text.
- Do not store or display search history.
- Index the relevant fields and use efficient, paginated database queries from the start. Consider a dedicated search engine only if actual scale later requires it.
- Inaccessible task names/details must never appear in suggestions or results.
- Opening a search result uses the side panel by default and preserves query/filters when returning.

### 6.3 Task IDs and links

- ID format: project prefix plus sequential number, e.g. `ERP-1042`.
- Suggest a prefix from the project name; manager/project owner approves or edits it before the first task is created.
- Prefix becomes permanent once used.
- Numbers are sequential per project and never reused; gaps are acceptable.
- Task ID appears in details, task lists, search results, bug/rework links, and copy/share actions.
- Copy/share summary includes task ID, direct link, title, status, priority, and deadline.
- Direct links enforce normal permissions; links are not a way to bypass access controls.

### 6.4 Personal dashboard

Show tasks across all projects the member can access:

- Assigned tasks and tasks where they are a collaborator
- Due soon and overdue work
- Blocked tasks
- Reviews/testing awaiting action
- Recently completed work
- Relevant bugs and rework

Use a fixed layout initially; no personal dashboard customisation in the MVP.

### 6.5 Manager/team dashboard

Show a cross-project summary:

- Project progress and status breakdown
- Overdue and blocked tasks
- Open bugs and rework
- Upcoming deadlines and milestones
- Estimated versus actual time
- Team contributions, subject to reporting permissions
- Pending reviews/testing
- Ownerless projects requiring manager action
- Outstanding responsibilities for deactivated members
- Access requests awaiting decisions

The dashboard should surface operational issues first rather than overloading the first release with advanced charts.

### 6.6 Project dashboard

For each project, show:

- Task progress and status breakdown
- Overdue and blocked tasks
- Bugs and rework
- Estimated vs actual time
- Individual and combined contributions where the viewer is authorised
- Upcoming deadlines and milestones
- Project start/end dates and closure state

Advanced trend analytics are deferred.

---

## 7. Time tracking and reporting

### 7.1 Manual time entry

Each time entry stores:

- Work date
- Duration
- Short description of the work performed
- User who logged it
- Related task
- Creation/update metadata and audit history

Rules:

- Manual entries only; no live timer.
- No start/end timestamp fields in the MVP.
- Users can add/edit their own entries at any time.
- Edits preserve original values in audit history; reports use the latest saved values.
- Authorised reviewers can inspect versions. Separate permission checks are required before editing someone else's entries.
- Time entries do not require approval and count immediately in reports.
- Warn if a single entry or a person's total for a task/day looks unusually high; allow save after confirmation. Use a configurable threshold chosen during implementation; no hard cap.
- Remind members at the end of the working day to review work and add missing time. Do not assume every active task must have a time entry, and do not build a separate missing-time dashboard initially.
- No separate time-completeness confirmation step.

### 7.2 Time totals and reports

- Task actual time = sum of valid latest time-entry values across all contributing members.
- Project actual time = sum of relevant task entries, with appropriate filters to avoid double counting parent/subtask roll-ups.
- Provide task/project/member/time-period filters.
- Show estimated vs actual time.
- Report bug and rework time separately and include it in relevant task/project totals.
- Manager can inspect all individual contributions.
- Project owners can inspect individual and combined entries in their own projects.
- Team members can see their own entries and combined totals for accessible tasks/projects, not other members' individual breakdowns.
- Reports are on demand. No automatic weekly time summary in the MVP.
- CSV and Excel exports respect the same permissions as the in-app report.

**Important reporting rule:** Agree a single aggregation model before implementation. Parent tasks that display child totals must not also double-count the same entries in project-wide totals.

---

## 8. Comments, files, history, and archive

### 8.1 Comments

- Comments are linked to tasks.
- Members can edit their own comments.
- Preserve old comment versions/edit history.
- Only authorised users can delete comments; deletion is recorded. Deleted comments are hidden in normal view but retained for audit purposes.

### 8.2 Attachments

- Allow attachments on tasks and comments, including screenshots, design files, and documents.
- Enforce project permissions on both metadata and downloads.
- Define file-size/type limits, storage location, and malware-scanning policy during implementation.
- Retain attachment relationships in task history and restore/archive operations.

### 8.3 Activity timeline and audit history

Record at minimum:

- Task creation and archival/restoration
- Title, description, type, priority, estimate, deadline, and status changes
- Owner, collaborator, project membership, and assignment changes
- Comment creation/edit/delete
- Time-entry create/edit and old/new values
- Review/testing requests, approvals, rejections, and reasons
- Block/unblock events and reasons
- Dependency, parent/subtask, duplicate, bug, and rework links
- Attachments and watcher changes
- Project closure/reopening and ownership changes
- Access-request creation, updates, cancellation, approval/rejection
- Account deactivation/reactivation and relevant administrative actions

Each event should include actor, timestamp, target record, event type, and old/new values where applicable.

Access to history follows project/resource access. The manager sees all history; project owners see their projects; members see accessible task history. Individual time details still follow the stricter time-report permissions.

The task page shows a short recent-activity preview and a full Activity tab with filters by activity type, person, and date, plus a separate important-changes view. Previous versions are viewable, but restoring any previous version is out of scope initially.

### 8.4 Archive/restore

- Archive rather than permanently delete tasks in the MVP.
- Members can archive tasks they created, subject to access rules; manager can archive any task.
- Archiving does not erase comments, assignments, time entries, links, attachments, or history.
- Restore is supported and audited.
- Archived tasks and their links remain available to authorised users.
- Permanent deletion should be addressed later through a controlled retention/data-management process, not ordinary task actions.

---

## 9. Notifications, daily updates, and working calendar

### 9.1 Notification channels and preferences

Channels:

- In-app notifications
- Email
- Browser push where supported

Users can enable/disable email and browser push and choose event categories. Important in-app notifications remain available.

Notify relevant people about:

- Task assignment/reassignment
- Mentions
- Status changes
- Review/testing requests and decisions
- Blocking/unblocking
- Upcoming deadlines and overdue work
- Bug/rework assignment
- Access requests and decisions
- Pending access-request reminder

Notification processing must retry failed email/push deliveries where appropriate, track delivery status, and prevent duplicates where possible. In-app notifications must be stored reliably.

### 9.2 Notification history

- Keep in-app notification history for 90 days.
- Maintain read/unread state and mark-as-read action.
- Important task events remain in permanent task activity history even after notification history expires.

### 9.3 Due dates and escalation

- Upcoming deadline, due-date, and overdue notifications use sensible defaults and configurable event categories.
- Blocked tasks produce notifications. If a block remains unresolved beyond a sensible default period, send a follow-up that includes reason and duration. Notify relevant people on unblock. Do not build an advanced escalation-rule editor initially.
- Pending review/testing triggers a reminder after a sensible default period. Stop reminders when approved/rejected or no longer pending. No advanced reminder configuration UI initially.

### 9.4 Daily updates and summaries

- Automatically draft daily updates using task activity and time entries.
- Members can review/edit the draft and add plans, context, or blockers, then submit in one click.
- Submitted updates feed personal and team summaries.
- Personal daily summaries and the combined manager team summary are available in-app and delivered by email.
- Summaries include completed/ongoing work, time entries, blockers, and carryovers.
- A missing-update indicator should distinguish "no update submitted" from "no work done".
- Remind members by the end of their working day if no daily update has been submitted. Do not infer that no activity means no work.
- Company working days, holidays, and the daily-update deadline are manager-configurable. Holidays/non-working days do not trigger the normal daily-update reminder.
- No advanced project-specific scheduled reporting in the MVP.

---

## 10. Project planning and lifecycle

### 10.1 Project setup

A project includes:

- Name and description
- Project owner
- Project members
- Task ID prefix
- Start date and target end date
- Milestones
- Active/closed state
- Standard project settings needed for the initial product

Project owners manage their own project settings and membership. The manager has organisation-wide oversight and can override where needed.

### 10.2 Milestones and timeline

- Support named milestones with target dates and linked tasks.
- Display milestone progress and completion status.
- Show project start/end dates and timeline warnings.
- Warn if task or milestone dates fall outside the project timeline; do not hard-block the change.
- Record date changes in history.
- Advanced milestone dependencies and milestone approval flows are not included.

### 10.3 Project closure and reopening

- Manager or project owner can close a project.
- Before closure, warn about open tasks, blocked tasks, incomplete milestones, unresolved bugs, and rework.
- Allow closure after the user records a reason.
- Preserve closure state and history.
- Closed projects are read-only for normal work.
- Manager/project owner can reopen a project with a recorded reason; normal work resumes.
- Record who closed/reopened it, when, and why.

---

## 11. Import, export, backup, and recovery

### 11.1 Export

Authorised users can export:

- Tasks and project information
- Time entries
- Estimated vs actual reports
- Bug and rework reports
- Project reports

Formats: CSV and Excel. Respect all permissions and project-access rules. PDF/print/custom exports are deferred.

### 11.2 Import

Authorised users can bulk-import projects/tasks from CSV or Excel through a guided process:

1. Upload file.
2. Map spreadsheet columns to supported fields.
3. Validate required fields, types, references, project membership, and duplicates where feasible.
4. Show an error report and preview.
5. Require confirmation before creating records.
6. Return a summary of successful and failed rows.

No broad third-party migration/integration framework in the MVP.

### 11.3 Backup and recovery

- Automated scheduled backups.
- Defined retention periods.
- Documented restore procedure.
- Periodic restore tests.
- Exact frequency, retention, and recovery-point/recovery-time objectives to be decided based on hosting and business needs before production release.

---

## 12. Proposed logical database design

This section is an **implementation recommendation**, not a verbatim product decision. A relational database is the right fit because the model has many linked entities, permission-sensitive reports, and audit requirements. (The original draft suggested PostgreSQL; the project uses **MySQL 8** — see `decisions.md`.) Exact column types and indexes are finalised during technical design.

### 12.1 Core tables

**users**

- `id` (UUID/PK)
- `name`, `email` (unique), `password_hash` (nullable when identity provider is used)
- `auth_provider` / external provider identifiers as needed
- `account_status` (active/deactivated)
- `created_at`, `updated_at`, `deactivated_at`

**roles** / **user_role_assignments** or equivalent fixed-role model

- Fixed role keys: manager, project_owner, team_member
- Additional explicit permissions stored as individual grants, not a free-form role builder
- Grant scope, grantor, creation/expiry if applicable, revocation metadata

**projects**

- `id`, `name`, `description`
- `owner_user_id`
- `task_prefix`, `next_task_number`
- `start_date`, `target_end_date`
- `status` (active/closed)
- `closed_at`, `closed_by`, `closure_reason`
- `reopened_at`, `reopened_by`, `reopen_reason`
- timestamps

**project_memberships**

- `project_id`, `user_id`
- membership status and added/removed metadata
- unique constraint on project/user according to the desired membership lifecycle
- preserve membership change history in audit events even after access removal

**tasks**

- `id` (internal PK)
- `task_key` (human-readable project-prefix + sequential number; unique and permanent)
- `project_id`, `parent_task_id` (nullable)
- `title`, `description`, `task_type`
- `status`, `priority`
- `primary_owner_user_id`, `created_by_user_id`
- `estimate_value`, `estimate_unit` (hours/days)
- `planned_start_date`, `deadline`
- `is_archived`, `archived_at`, `archived_by`, `restored_at`, `restored_by`
- review/testing requirement flags and current workflow metadata as needed
- created/updated timestamps and optimistic concurrency/version field

**task_assignees**

- `task_id`, `user_id`, assignment type (collaborator/assignee as defined in UI)
- added by/at, removed by/at or a history-preserving assignment table
- primary ownership stays on the task or is modelled distinctly; enforce exactly one primary owner

**task_status_events** or workflow events

- `task_id`, from/to status, actor, timestamp, reason, transition metadata

**task_relationships**

- `source_task_id`, `target_task_id`, relationship type
- relationship types include blocks/blocked_by, duplicate_of/duplicate, bug_of, rework_of, and other explicit links
- enforce rules preventing invalid self-links and duplicate link rows

**task_labels** and **labels**

- label definitions and task-label join table
- label creation metadata and appropriate uniqueness scope

**task_comments**

- `id`, `task_id`, `author_user_id`, current body, timestamps, deleted metadata
- comment edit versions in `comment_versions`

**attachments**

- `id`, task/comment relationship, uploader, storage key/path, original filename, content type, size, upload timestamp, deletion/archive metadata as needed
- store file bytes in object/file storage rather than large database blobs unless hosting constraints require otherwise

**time_entries**

- `id`, `task_id`, `user_id`, `work_date`, `duration_minutes` (or another consistent unit), `description`
- created/updated timestamps
- use a single canonical duration unit internally and convert for UI/reporting
- time edit versions in audit/version records

**task_templates**

- title, description, default priority, estimate, review/testing flags, creator/scope metadata

**milestones** and **milestone_tasks**

- project, name, target date, status, description
- link table to tasks

**task_watchers**

- `task_id`, `user_id`, created/removed metadata

### 12.2 Workflow, activity, and notifications

**task_activity_events / audit_events**

- actor, timestamp, action type, entity type/id, project scope, old/new values, reason, request/correlation ID where useful
- append-only for normal application workflows; avoid updating old audit events
- access to activity detail must be permission-checked

**notification_preferences**

- user-level channel settings and event-category preferences

**notifications**

- recipient, event reference, channel, status, read state, created/sent/delivered/failed timestamps, retry metadata
- ensure reliable in-app storage and duplicate prevention keys where feasible

**daily_updates**

- user, work date, generated draft/content, additional plans/context/blockers, submitted status/timestamp
- preserve relevant edit/submission history if required for audit

**access_requests**

- requester, project, optional reason, status, created/updated/cancelled timestamps
- decision-maker, decision timestamp, rejection/decision reason
- enforce only one pending request per requester/project

**working_calendar_settings / holidays**

- working weekdays, holiday dates, daily update deadline, organisation-level configuration for the initial company deployment

**import_jobs / import_row_results**

- uploader, file metadata, mapping, validation summary, row results, final status, timestamps

### 12.3 Consistency and indexing rules

- Use foreign keys for relational integrity.
- Add indexes for common project/task filters: `project_id`, `status`, `priority`, `primary_owner_user_id`, `deadline`, `task_type`, `parent_task_id`, and relevant relationship joins.
- Add indexes for time reports by user/date/task and for activity timeline lookups by entity/time.
- Ensure `task_key` is unique and permanent. Allocate per-project numbers transactionally so concurrent task creation cannot duplicate an ID; gaps are allowed.
- Add indexes/full-text search support for task title, description, labels, IDs, and searchable linked bug/rework content.
- Use pagination for large task lists, search results, activity, and reports.
- Use transactions for multi-record operations such as bulk reassignment, status changes that create events, archive/restore, and project closure.
- Do not calculate project totals by naively summing both a parent task and its subtasks if that double-counts the same logged time.
- Keep audit records append-only and separately secured from ordinary task edits.
- Design future organisation isolation only after the user revisits the decision. Avoid building SaaS billing or multi-organisation switching now.

---

## 13. Recommended application architecture

This is a recommended implementation structure. The concrete stack is recorded in `CLAUDE.md` and `decisions.md`.

### Frontend

- Responsive web app/PWA; online-only.
- Reusable task list, task detail panel, status controls, filters, forms, notification centre, dashboards, and report components.
- Central route/access guards for user experience, backed by server-side authorisation.
- Shared validation rules/messages for forms and workflow transitions.
- Explicit loading, empty, saving, saved, conflict, and error states.

### Backend

Use a layered backend (or equivalent clean separation):

1. **API/controllers:** input validation, auth context, HTTP contracts.
2. **Application/services:** use cases, permissions, workflow transitions, bulk actions, notification triggers.
3. **Domain/model:** task/status rules, task relationships, time totals, parent-completion rules.
4. **Repositories/data access:** database transactions, filtered queries, pagination, reporting queries.
5. **Background jobs:** deadline reminders, blocked/review follow-ups, daily summaries, email/push retries, scheduled backups coordination as appropriate.

Critical workflow validation must be shared by all entry points: task page, Kanban drag/drop, bulk updates, import, and API calls.

### Files and background processing

- Store attachment bytes in controlled file/object storage, with permission checks at download time.
- Use a reliable background-job mechanism for scheduled reminders and delivery retries; exact vendor/tool can be selected during technical design.
- Make notification jobs idempotent where possible so retries do not send duplicate messages.

### Security basics

- Hash passwords with a recognised password-hashing approach; never store plaintext passwords.
- Use secure session/token handling and server-side account-status checks.
- Verify Google sign-in tokens on the backend.
- Rate-limit sign-in and password-reset endpoints.
- Validate uploads and restrict file access.
- Enforce project/resource permissions in every API query and mutation.
- Do not leak restricted task data through search suggestions, counts, notifications, exports, error messages, or attachment URLs.
- Record security-sensitive account and permission actions in the audit log.
- Include automated permission tests and cross-project access tests.

---

## 14. Acceptance checklist

### Task management

- [ ] Quick create requires only title and project.
- [ ] Every task has exactly one primary owner; additional collaborators are supported.
- [ ] Status transitions are validated consistently across task details, Kanban, bulk actions, and imports.
- [ ] Blocked tasks require a reason and return to their prior working status when unblocked.
- [ ] Review/testing requirements are enforced before Done.
- [ ] Done tasks can be reopened without losing completion history.
- [ ] Bugs and rework have separate links, ownership, time, and reporting.
- [ ] Subtasks, dependencies, duplicate links, templates, labels, and watchers work as specified.

### Time and reports

- [ ] Users can add/edit their own manual time entries.
- [ ] Time edits preserve before/after audit history.
- [ ] Task/project totals reconcile and avoid parent/subtask double-counting.
- [ ] Reports and exports obey individual-time visibility permissions.
- [ ] High-time warning can be confirmed and bypassed with a recorded action if desired by implementation.

### Access and audit

- [ ] Access is checked server-side for every task, project, file, report, notification, and export.
- [ ] Search suggestions and result counts do not leak inaccessible data.
- [ ] Account deactivation blocks sign-in but preserves history.
- [ ] Reactivation requires project membership/permissions to be explicitly reviewed/restored.
- [ ] Access requests support approve/reject/cancel, history, and one reminder.
- [ ] Ownership, assignment, permission, project closure, and account actions are audited.

### Daily operations

- [ ] Personal and manager dashboards show the agreed operational information.
- [ ] In-app/email/browser-push notifications obey preferences and event relevance.
- [ ] Daily updates can be generated as drafts, edited, and submitted.
- [ ] Working-day/holiday settings control daily update reminders.
- [ ] The manager can identify blocked, overdue, review-pending, bug, rework, and outstanding-offboarding work.

### Project lifecycle and operations

- [ ] Milestones and project timeline warnings work.
- [ ] Closed projects are read-only; reopening requires a reason.
- [ ] CSV/Excel import previews validation errors before writes.
- [ ] CSV/Excel exports respect permissions.
- [ ] Backup and restore procedures have been tested.

---

## 15. Open implementation decisions

Not fully specified as product requirements; settle before or during the relevant phase. Early-blocking ones are tracked in `decisions.md`.

1. **Technology stack and hosting:** file storage, email provider, push provider, hosting.
2. **Estimate units:** UI accepts hours or days; define conversion/display rules and whether estimate precision is decimal.
3. **Review/testing assignment:** how reviewer/tester is selected; one or multiple approvals per stage.
4. **Status edge cases:** the precise allowed transition map for each combination of review/testing requirements and task type.
5. **Time warning threshold:** initial configurable threshold for a single entry/day total.
6. **Project report formulas:** whether cancelled/archived tasks contribute to every KPI; no double counting.
7. **File limits and safety:** accepted file types, max sizes, retention, upload scanning.
8. **Notification defaults:** reminder intervals for upcoming/overdue deadlines, blockers, pending reviews.
9. **Backup policy:** frequency, retention, recovery objectives, ownership of restore tests.
10. **Import mapping:** supported columns and reference-resolution behaviour for users, projects, parent tasks, and task links.
11. **Restore permissions:** which roles can restore archived tasks in each project context.
12. **Organisation architecture:** deferred by explicit user preference. Revisit before SaaS or multiple-organisation support.
13. **Permanent manager succession:** a separately authorised platform/organisation administrator verifies and approves a transfer if the primary manager is permanently unavailable, with evidence, reason, approver, and timestamp recorded permanently. Deferred until the organisation/SaaS model is revisited.

---

## 16. Final product baseline

The initial product is an online internal task-management app for a team of roughly 10 people working across multiple projects. Its central value is reliable execution visibility: who owns each task, who contributed, how long it took, what is blocked, what is overdue, what bugs/rework came from it, and what needs managerial attention.

Keep the first release focused on the core workflow, consistent permission enforcement, complete audit history, accurate manual time tracking, useful dashboards, and predictable daily updates. Treat commercial SaaS and organisation-model choices as a later design checkpoint. Temporary coverage is excluded from the plan.
