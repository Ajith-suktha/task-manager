# Task Management Application — Claude Code Instructions

## Project Overview

A web-based task management application for teams: project management, task assignment, workflow tracking, manual time tracking, reporting, and audit history.

## About the Developer (read this first)

- The developer is an experienced **Flutter/Dart** developer and is **new to Angular and the web stack**. Java/Spring experience should not be assumed either unless stated in the conversation.
- When introducing an Angular concept for the first time, explain it briefly with a Flutter analogy, then move on. Do not repeat explanations already given.
- Prefer **modern, idiomatic Angular** and say why a pattern is idiomatic. Do not teach legacy patterns.
- Keep code simple and readable. Add short comments where Angular or Spring behaviour is non-obvious, not on everything.
- When there are several valid approaches, recommend one, state the trade-off in one or two sentences, and proceed. Do not present long menus of options.

### Flutter → Angular mental model

| Flutter | Angular |
|---|---|
| Widget | Component (TypeScript class + HTML template + CSS) |
| `StatefulWidget` / `setState` | Signals (`signal()`, `computed()`, `effect()`) |
| `Provider` / `Riverpod` / `get_it` | Services with dependency injection (`inject()`) |
| `Navigator` / `go_router` | Angular Router (`provideRouter`, route guards, lazy routes) |
| `Future` / `Stream` | `Promise` / RxJS `Observable` (used by `HttpClient`) |
| `FutureBuilder` / `StreamBuilder` | `async` pipe, or `toSignal()` |
| `Form` / `TextEditingController` | Reactive Forms (`FormGroup`, `FormControl`) |
| `Dio` interceptors | `HttpClient` interceptors |
| `pubspec.yaml` | `package.json` |
| `flutter pub get` | `npm install` |
| `flutter run` / hot reload | `ng serve` (live reload) |
| `flutter test` | `ng test` |
| Material widgets | Angular Material components |

## Technology Stack

- **Frontend:** Angular + TypeScript (strict mode), Angular Material/CDK
- **Backend:** Java + Spring Boot REST API, Spring Security
- **Database:** MySQL 8, migrations with Flyway
- **API documentation:** OpenAPI / Swagger (springdoc)
- **Version control:** Git

### Pinned versions

Do not guess versions. Confirm compatibility first, then record the result here.

- Java: 21 LTS (currently the JDK bundled with Android Studio, `D:\Softwares\Android Studio\jbr`; set per terminal session, do not change global `JAVA_HOME`)
- Spring Boot: 4.1.2 (Spring Framework 7)
- Build tool: Maven, wrapper (`mvnw`) committed to the repo
- Node.js: 24 LTS (Angular 22 requires `^22.22.3 || ^24.15.0 || ^26`)
- Angular / Angular CLI: 22.x, TypeScript 6.0.x
- MySQL: 8.4 LTS via Docker (image `mysql:8.4`, verified running 8.4.13)

Checked against the official Angular, Spring Boot and Node.js docs on 2026-10-27.

## Repository Structure

- `frontend/` — Angular application
- `backend/` — Spring Boot application
- `docs/` — architecture, database design, API conventions, roadmap, technical decisions

## Commands

Fill in and keep these accurate. Run them from the directory shown.

**Frontend (`frontend/`)**
- `ng` is not installed globally; use `npx ng ...` (or the `npm` scripts)
- Install dependencies: `npm install`
- Dev server: `npx ng serve` (http://localhost:4200). It proxies `/api` and `/actuator` to the backend on port 8080 (`proxy.conf.json`), so the browser sees one origin and no CORS setup is needed. Start the backend (and MySQL) first.
- Unit tests: `npx ng test` (Vitest; add `--watch=false` for a single run)
- Production build: `npx ng build`
- Lint: `npx ng lint`

**Backend (`backend/`)**
- First, in each new terminal (repo root): `. .\scripts\dev-env.ps1` (sets JDK 21 for that session only)
- Run: `.\mvnw.cmd spring-boot:run` (needs the MySQL container running; serves http://localhost:8080)
- Test: `.\mvnw.cmd test` (needs Docker running; Testcontainers starts its own MySQL)
- Build: `.\mvnw.cmd package`
- Health: http://localhost:8080/actuator/health · API docs: http://localhost:8080/swagger-ui/index.html

**Database**
- First time: copy `.env.example` to `.env` and set passwords (`.env` is gitignored)
- Start local MySQL: `docker compose up -d mysql` (repo root; host port 3307, because another MySQL already uses 3306 on this machine)
- Stop: `docker compose stop mysql`
- Migrations run automatically via Flyway on backend startup.

## Architecture Rules

- Backend is a **modular monolith**. Do not introduce microservices.
- Keep frontend, backend, and database responsibilities separate.
- The frontend talks to the backend only through documented REST APIs.
- **Business rules and authorization are enforced by the backend**, never only by the frontend. Frontend guards are for UX, not security.
- All schema changes go through Flyway migrations. Never edit an applied migration; add a new one.
- Keep API contracts consistent and documented. Update OpenAPI annotations when endpoints change.
- Avoid unnecessary dependencies and premature complexity.

## Backend Conventions

- Package by module/feature (e.g. `users`, `projects`, `tasks`, `timetracking`, `audit`), not by technical layer at the top level. Inside each module: `api` (controllers, DTOs), `domain`/`service`, `persistence`.
- Controllers are thin. Logic lives in services.
- Never expose JPA entities through the API. Use DTOs and map explicitly.
- Validate input with Bean Validation (`@Valid`) at the API boundary.
- Use one consistent error response format for all API errors (a global `@ControllerAdvice`). Document it in `docs/api-conventions.md`.
- Use proper HTTP status codes and plural resource names (`/api/projects`, `/api/tasks`).
- Flyway migration names: `V<number>__<short_description>.sql`, one logical change per migration.
- Authorization checks use Spring Security (method security and/or explicit membership checks), and each endpoint must state who may call it.
- Audit-relevant changes (task status, assignment, time entries) must be recorded in audit history.

## Frontend Conventions (Angular)

- Use **standalone components** only. No NgModules.
- Use **signals** for component and local state. Use RxJS only where streams are genuinely needed (e.g. HTTP, debounced search).
- Use the built-in control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`/`*ngFor`.
- Use `inject()` for dependency injection.
- Use `ChangeDetectionStrategy.OnPush` on components.
- Use Reactive Forms for forms.
- Structure by feature: `src/app/features/<feature>/` (components, routes, services for that feature) plus `src/app/core/` (auth, interceptors, guards, API client) and `src/app/shared/` (reusable UI).
- Lazy-load feature routes.
- All HTTP calls go through services, never directly from components. Use an interceptor for auth headers and error handling.
- Strict TypeScript: no `any`. Define interfaces for API models, ideally generated from or kept in sync with the OpenAPI spec.
- Use Angular Material components before building custom UI.
- Do not store tokens in `localStorage` unless the auth design in `docs/` explicitly says so. Decide the token strategy in the authentication step and document it.

## Development Workflow

- Inspect existing files before modifying them.
- Work on **one small, clearly defined feature at a time**. Never generate the whole application in one step.
- For anything substantial, first explain the plan (files to change, approach) and wait for approval before implementing. Plan mode is appropriate here.
- Never overwrite or delete existing work without explaining why and getting approval.
- Add tests for new business logic and important edge cases:
  - Backend: JUnit 5, Spring Boot Test, Testcontainers (MySQL) for integration tests
  - Frontend: the Angular default test runner for components and services
- Run relevant tests and builds after changes. Report failures honestly, including ones you could not fix.
- Update `docs/` when architecture or API contracts change.
- Do not introduce new frameworks, libraries, or architectural patterns without explaining the reason first.
- Commit in small, focused commits with clear messages. Do not commit unless asked.

## Security Rules

- Never commit passwords, tokens, API keys, or other secrets.
- Use environment-specific configuration for credentials (environment variables or untracked local config files). Provide an `.example` file with placeholder values.
- Hash passwords with a strong adaptive algorithm (e.g. BCrypt via Spring Security). Never log secrets or personal data.
- Validate and authorize on the server for every request.

## Environment Constraints

- This is a **new, standalone project**. Do not modify unrelated Flutter projects on this machine.
- Do not change system-wide Java, Flutter, Android SDK, Node, or Gradle settings without explicit approval.
- Ask before any destructive operation (deleting files, dropping databases, force-pushing, resetting history) or changing shared configuration.

## Development Roadmap

The detailed, current roadmap lives in `docs/roadmap.md`. Rough order:

1. Architecture and local development setup
2. Database model and API conventions
3. Authentication and authorization
4. Users, projects, and project membership
5. Task management and workflow
6. Time tracking, audit history, reporting, notifications
7. Integration tests, deployment configuration, operational documentation

Always check `docs/roadmap.md` for the current step instead of assuming.
