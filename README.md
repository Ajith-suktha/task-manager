# Task Management

A web-based task management application for teams: projects, task assignment, workflow tracking, manual time tracking, reporting and audit history.

- **Frontend:** Angular 22 (TypeScript, Angular Material), in `frontend/`
- **Backend:** Spring Boot 4.1 (Java 21, Maven), in `backend/`
- **Database:** MySQL 8.4 in Docker, schema managed by Flyway
- **Docs:** `docs/` (requirements, roadmap, decisions, engineering standards)

## Required tools

| Tool | Version |
|---|---|
| JDK | 21 (LTS) |
| Node.js | 24 LTS |
| Docker Desktop | with Docker Compose |
| Git | any recent version |

Maven and the Angular CLI do not need to be installed: the project uses the Maven wrapper (`mvnw`) and runs the CLI through `npx`.

The exact pinned versions and the reasons are in `CLAUDE.md` and `docs/decisions.md`.

## First-time setup

Run from the repository root (PowerShell on Windows).

1. Create your local settings file and choose passwords (`.env` is never committed):

   ```powershell
   Copy-Item .env.example .env
   ```

2. Start the database:

   ```powershell
   docker compose up -d mysql
   ```

3. Install frontend dependencies:

   ```powershell
   cd frontend
   npm ci
   ```

## Run the app

Start the pieces in this order, each in its own terminal.

**1. Database** (if it is not already running): `docker compose up -d mysql`

**2. Backend** (serves http://localhost:8080):

```powershell
. .\scripts\dev-env.ps1      # sets JDK 21 for this terminal only; edit the path inside if your JDK is elsewhere
cd backend
.\mvnw.cmd spring-boot:run
```

**3. Frontend** (serves http://localhost:4200 and proxies `/api` and `/actuator` to the backend):

```powershell
cd frontend
npx ng serve
```

Open http://localhost:4200. The home page shows whether the backend and database are reachable.

Useful addresses: health check http://localhost:8080/actuator/health, API docs http://localhost:8080/swagger-ui/index.html.

## Test, lint and build

| What | Where | Command |
|---|---|---|
| Backend tests (needs Docker running) | `backend/` | `.\mvnw.cmd test` |
| Backend build | `backend/` | `.\mvnw.cmd package` |
| Frontend tests | `frontend/` | `npx ng test --watch=false` |
| Frontend lint | `frontend/` | `npx ng lint` |
| Frontend build | `frontend/` | `npx ng build` |

## Ports

| Port | Used by |
|---|---|
| 4200 | Angular dev server |
| 8080 | Spring Boot backend |
| 3307 | MySQL in Docker (host side; 3306 is left free for any MySQL already on your machine). Change `MYSQL_HOST_PORT` in `.env` if needed |

## Repository layout

```
backend/    Spring Boot application
frontend/   Angular application
docs/       requirements, roadmap, decisions, engineering standards
scripts/    local helper scripts
docker-compose.yml   local MySQL
.env.example         placeholder settings (copy to .env)
CLAUDE.md            project rules and pinned versions
```

## Documentation

- `docs/roadmap.md` – phases, current step and progress
- `docs/requirements.md` – what the product does
- `docs/decisions.md` – technical decisions and open questions
- `docs/engineering-standards.md` – performance, reliability, security, testing and database standards

## Troubleshooting

- **The backend fails to start with a database error:** make sure the MySQL container is running and healthy (`docker compose ps`). The backend cannot start without it because Flyway migrates the schema at startup.
- **Port 3306 is already used:** that is expected on some machines; this project uses 3307 for that reason.
- **`ng` or `npm` complains about the Node version:** run `node -v`; it must be 24 LTS (Angular 22 needs `^22.22.3`, `^24.15.0` or `^26`).
- **Backend tests fail with Docker errors:** start Docker Desktop first; the tests start a temporary MySQL container.
