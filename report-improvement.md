# Staging CI/CD & Docker Architecture: Analysis & Improvement Plan

Based on the review of the current GitHub Actions workflows, deployment scripts, Docker configurations (`@docker/**`), `compose.staging.yml`, and `.env-dev.example`, here is a comprehensive analysis of the infrastructure architecture, its alignment with requirements, and an actionable plan backed by industry best practices.

## 1. Architectural Analysis

**Current Architecture:**
The application follows a modern, decoupled architecture using Docker:
- **Web Server (`web`):** Caddy acts as the reverse proxy, handling static files and routing traffic to PHP-FPM and WebSockets.
- **Application (`app`):** PHP-FPM runs the core Laravel API and web routes.
- **Background Processing (`queue-worker`):** A dedicated container running `php artisan queue:work` handles asynchronous tasks.
- **Real-time Server (`reverb`):** A dedicated container running Laravel Reverb for WebSockets.
- **Database (`postgres`):** PostgreSQL 16 container.

**Strengths:**
- **Separation of Concerns:** Splitting the web server, application, queue, and websocket server into separate containers is an excellent practice for scalability and stability.
- **Single Source of Truth:** `app`, `queue-worker`, and `reverb` all use the exact same Docker image (`ghcr.io/uniespacos/app/app`). This guarantees version consistency across all Laravel components during a deployment.
- **Multi-stage Production Build:** The `docker/production/php-fpm/Dockerfile` correctly utilizes multi-stage builds (`frontend-builder`, `builder`, `production`) to compile Node assets and Composer dependencies, resulting in a lean final image.

## 2. Identified Issues & Industry Best Practice Solutions

Despite the strong architectural foundation, several critical flaws exist. Here are the issues identified and the corresponding best practice solutions.

### A. The "Shared Volume" Anti-Pattern for Static Assets
**Current State:** In `compose.staging.yml`, the `web` (Caddy) container uses the default `caddy:alpine` image and relies on shared volumes (`uniespacos-public-assets-v2-staging`, `uniespacos-public-staging-v2`) to access the `public/` directory containing Vite build assets.
**The Problem:** Caddy depends entirely on the `app` container to populate these volumes. This creates a race condition on deployment: Caddy might start serving before the `app` container finishes copying the new assets to the volume, leading to broken styles or 404s. Furthermore, stateful volumes make rollbacks unreliable.
**Best Practice Validation:** According to the **12-Factor App methodology (Build, release, run)** and Docker immutable infrastructure principles, a container image should contain all the static assets it needs to run. 
**The Solution (Phase 1): Immutable Web Server Image**
During the GitHub Actions CI process, we will build a custom Caddy image (`docker/production/caddy/Dockerfile`) that copies the `public/` directory directly into the image from the Laravel builder stage. This makes the `web` container fully self-sufficient and perfectly versioned.

### B. Unnecessary Port Exposure (Security Risk)
**Current State:** In `compose.staging.yml`, the `reverb` service exposes port `9000:9000` to the host machine via the `ports` mapping.
**The Problem:** Exposing a port binds it to the host network interface. Since Caddy is already acting as the reverse proxy and routing WebSocket traffic internally via the Docker network, exposing the port to the host bypasses Caddy's security, rate limiting, and TLS termination.
**Best Practice Validation:** Docker security benchmarks and network isolation principles dictate that backend services should only communicate over isolated internal Docker networks (`networks:`). Only edge routers (like Caddy/Nginx) should bind host ports.
**The Solution (Phase 3): Network Isolation**
Remove the `ports` mapping from the `reverb` service in `compose.staging.yml`. It will still be accessible to Caddy via the internal `uniespacos-staging` network.

### C. Deployment Downtime & Fragile Scripts
**Current State:** The `scripts/deploy.staging.sh` script executes `docker compose down` followed by `docker compose up -d`, causing hard downtime. It also runs `php artisan migrate` on the live container.
**The Problem:** `docker compose down` destroys the network and stops all containers, resulting in a full outage. Running migrations on the live container means that if the migration fails halfway through, the app is left in a broken, half-migrated state while serving active traffic.
**Best Practice Validation:** Zero-downtime deployment patterns with Docker Compose rely on `docker compose up -d` recreating only changed containers (rolling updates). Furthermore, pre-flight migrations on an ephemeral container (`run --rm`) ensure that the schema is validated before new code starts serving requests.
**The Solution (Phase 2): Zero-Downtime Deployment Script**
1. Enter maintenance mode: `docker compose exec -T app php artisan down`.
2. Pre-flight migration: `docker compose run --rm -T app php artisan migrate --force`.
3. Graceful update: `docker compose up -d` (Docker automatically manages the swap of changed containers).
4. Exit maintenance mode: `docker compose exec -T app php artisan up`.

### D. CI Pipeline Optimization
**Current State:** The `test` job in `.github/workflows/deploy-staging.yml` runs a massive sequence of both frontend (`npm test`) and backend (`php artisan test`) tests within a single bloated workspace container.
**The Problem:** Sequential execution increases the total CI execution time and creates a massive monolith that is hard to debug.
**Best Practice Validation:** Modern CI/CD pipelines (GitHub Actions, GitLab CI) encourage parallelizing independent tasks using Matrix builds or separate concurrent jobs.
**The Solution (Phase 4): Parallel CI Jobs**
Split the `test` job into `test-frontend` and `test-backend` jobs that run in parallel on GitHub Actions.

## 4. Implementation Steps 

If we initiate the plan, we will execute the following steps in order:

1. **Create `docker/production/caddy/Dockerfile`:** A multi-stage build that copies assets from the `ghcr.io/uniespacos/app/app` image.
2. **Refactor `compose.staging.yml`:** Remove the shared asset volumes and the exposed `reverb` port.
3. **Rewrite `scripts/deploy.staging.sh`:** Implement the pre-flight migration and zero-downtime `docker compose up -d` process.
4. **Update `.github/workflows/deploy-staging.yml`:** Add the step to build and push the new `caddy` image to GHCR, and split the tests into parallel jobs.

Would you like me to begin implementing Step 1 and Step 2?