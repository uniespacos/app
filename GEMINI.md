# GEMINI.md: UniEspaços Project Context & Master Router

## Technology Stack
- **Backend:** Laravel (PHP 12.x) - API focused
- **Frontend:** React (v18) + Inertia.js (SPA)
- **Database:** PostgreSQL (v16)
- **Real-time:** Laravel Reverb (WebSockets)
- **Styling:** Tailwind CSS
- **Tooling:** Vite, Docker & Docker Compose
- **CI/CD:** GitHub Actions (Release-Please, Lint, Test, Deploy)

## Cross-References / Skill Router
To keep AI context lean and focused, use the `activate_skill` tool to load specific rules when working on different parts of the stack. **Only activate what you need.**

- **General/Full-Stack Features:** `activate_skill("uniespacos-fullstack-dev")`
  - *Use for:* General development principles, component creation, and tasks spanning frontend and backend.
- **Backend Architecture & APIs:** `activate_skill("laravel-backend-architect")`
  - *Use for:* Controllers, Services, Eloquent Models, Form Requests, API Resources.
- **Laravel Framework Core:** `activate_skill("02-php-laravel")`
  - *Use for:* General Laravel questions, Blade, Artisan, Queue jobs, testing patterns.
- **Frontend Build & Vite:** `activate_skill("laravel-vite")`
  - *Use for:* Vite config, Tailwind config, asset bundling, HMR issues.
- **Security & Vulnerabilities:** `activate_skill("uniespacos-secdev-specialist")`
  - *Use for:* Code review, route protection, data leakage, OWASP standards.
- **DevOps, Docker & CI/CD:** `activate_skill("uniespacos-devops-specialist")`
  - *Use for:* Modifying `compose.*.yml`, Dockerfiles, GitHub Actions, Nginx configurations, deployments.
- **Documentation:** `activate_skill("uniespacos-doc-updater")`
  - *Use for:* Updating `docs/`, `ROADMAP.md`, `CHANGELOG.md`, `data-model.dbml`.

## Core Project Rules

### 1. Development Environment (Docker)
- Always run commands inside the `workspace` container: `docker compose -f compose.dev.yml exec workspace <command>`
- **Starting:** `docker compose -f compose.dev.yml up -d`

### 2. Testing (Mandatory)
- **Test Isolation:** **NEVER** use the `RefreshDatabase` trait. ALWAYS use `DatabaseTransactions`.
- **PHPUnit Environment:** Pass `-e APP_ENV=testing` to prevent CSRF errors during feature tests: `docker compose -f compose.dev.yml exec -e APP_ENV=testing workspace php artisan test`.

### 3. Asynchronous & Real-time
- **Resilient Notifications:** All notifications must implement `ShouldQueue`.
- **Job Safety:** Wrap `notify()` calls in `try-catch` inside critical jobs (e.g., reservation creation) to prevent external failures (like Mailtrap) from crashing core logic.
- **Reverb (Local):** `REVERB_SCHEME` must strictly be `http` on port `9000` for internal Docker broadcasting. External WSS runs on port `443`.

### 4. Continuous Integration
- All code must pass the project's automated quality checks before merging.
- Commits must follow **Conventional Commits** (e.g., `feat:`, `fix:`, `docs:`) to pass CI and trigger `release-please`.

### 5. Third-party APIs & Docs
- Use **Context7 MCP** (`query-docs` tool) to fetch up-to-date documentation before implementing new packages or updating major versions.
