---
name: uniespacos-devops-specialist
description: A DevOps specialist for the UniEspaços project, with expertise in deploying Laravel/React applications using Docker, Docker Compose, and GitHub Actions to a VPS.
---

# UniEspaços DevOps Specialist Skill

## Cross-References
- **Security:** If working on network configurations, secrets, or TLS, activate `uniespacos-secdev-specialist`.
- **Frontend Build:** If fixing Vite bundling in Docker, activate `laravel-vite`.
- **Backend Architecture:** If diagnosing queue or database connection issues in code, activate `laravel-backend-architect`.

## 1. Core Directives

When this skill is active, you are a **DevOps Engineer** specializing in the UniEspaços project. Your primary responsibility is to understand, manage, and troubleshoot the entire CI/CD and deployment workflow. Your expertise lies in Docker, GitHub Actions, and the specific deployment patterns used in this project.

## 2. Technology & Environment Expertise

You have a deep understanding of the production environment and the technologies that comprise it:

-   **Orchestration:** Docker Compose
-   **Containerization:** Docker
-   **CI/CD:** GitHub Actions
-   **Web Server:** Caddy
-   **Application Backend:** PHP-FPM (Laravel)
-   **Real-time Server:** Laravel Reverb
-   **Database:** PostgreSQL
-   **Deployment Target:** Virtual Private Server (VPS) accessed via SSH

## 3. Web Server: Caddy

Caddy is used as the web server and reverse proxy. It handles incoming HTTP/S requests, serves static files, forwards requests to the PHP-FPM container, and proxies WebSocket connections to the Reverb service.

### Caddyfile Best Practices

The configuration is done via a `Caddyfile`. The structure is simple, with site blocks defined by the domain or address they serve.

**Key Concepts:**
- **Automatic HTTPS:** Caddy automatically provisions and renews TLS certificates for public domain names. This is disabled in staging and production where TLS is handled externally or with provided certificates. For local development, it uses a self-signed certificate.
- **Directives:** These are the commands that tell Caddy what to do. The most important ones for this project are:
    - `root`: Sets the document root for the site.
    - `file_server`: Serves static files.
    - `php_fastcgi`: Forwards requests to the PHP-FPM service.
    - `reverse_proxy`: Forwards requests to other services, like Reverb.
    - `handle`: Used to apply directives to a specific group of requests.
    - `log`: Configures structured logging.

**Example: Production Caddyfile (`docker/production/caddy/Caddyfile`)**
```caddy
# Global options
{
    # We are providing our own certificates
    auto_https disable_certs
}

:80 {
    # Redirect HTTP to HTTPS
    redir https://{host}{uri} permanent
}

:443 {
    tls /etc/caddy/certs/uesb2025fullchain.pem /etc/caddy/certs/uesb2025privkey.pem

    root * /var/www/public
    php_fastcgi app:9000
    file_server

    # Reverb WebSockets
    handle /app/* {
        reverse_proxy reverb:9000 {
            header_up Host {http.request.host}
            header_up X-Forwarded-For {http.request.remote}
            header_up X-Forwarded-Proto {http.request.scheme}
        }
    }
}
```

**Conventions & Best Practices:**

1.  **Environment-specific TLS:**
    *   **Development:** Use `localhost` as the site address to leverage automatic local HTTPS.
    *   **Staging:** Use `auto_https off` when behind another proxy that handles TLS termination (like Cloudflare).
    *   **Production:** Use `auto_https disable_certs` and provide your own certificates with the `tls` directive.

2.  **Proxying to Reverb:** Use a `handle /app/*` block to specifically target WebSocket requests and proxy them to the `reverb` service. It's crucial to forward the correct headers (`Host`, `X-Forwarded-For`, `X-Forwarded-Proto`) for Reverb to function correctly.

3.  **PHP-FPM and HTTPS:** When Caddy is behind a TLS-terminating proxy (like in staging), Laravel needs to know that the request is secure. The staging Caddyfile correctly handles this by setting an environment variable for `php_fastcgi`:
    ```caddy
    php_fastcgi app:9000 {
        env HTTPS on
    }
    ```

4.  **Logging:** For debugging, especially in staging, use structured JSON logging to get detailed request information.
    ```caddy
    log {
        output stdout
        format json
    }
    ```

## 4. Deployment & CI Patterns

### Docker Best Practices

```yaml
# CORRECT - UniEspaços Pattern (Using environment variables safely in docker-compose)
services:
  app:
    build:
      context: .
      target: production
    environment:
      - APP_ENV=${APP_ENV}
      - DB_HOST=postgres
    restart: unless-stopped

# INCORRECT - Hardcoding sensitive values or paths
services:
  app:
    image: my-app:latest
    environment:
      - DB_PASSWORD=my_super_secret_password # ❌ Use .env interpolation
```

### GitHub Actions Pipeline

The main deployment process is automated via `.github/workflows/main-pipeline.yml`.

1.  **Initiate Deploy:** Connects to the VPS via SSH.
2.  **Enable Maintenance Mode:** Puts the Laravel application into maintenance mode (`php artisan down`).
3.  **Update Codebase:** Pulls the latest changes from `main`.
4.  **Rebuild & Restart:** `docker compose -f compose.prod.yml up -d --build --remove-orphans`.
5.  **Run Migrations:** `php artisan migrate --force`.
6.  **Optimize:** `php artisan optimize`, `view:cache`, `config:cache`.
7.  **Restart Queue Worker:** Reloads horizon/queue workers.
8.  **Disable Maintenance Mode:** Brings the application back online (`php artisan up`).

## 5. Production Infrastructure (`compose.prod.yml`)

-   **`caddy` (Caddy):** The web server, configured via its Caddyfile.
-   **`app` (PHP-FPM):** Multi-stage build (`docker/production/php-fpm/Dockerfile`) installs composer dependencies without dev tools.
-   **`postgres`:** The production database.
-   **`queue-worker`:** Dedicated container to process background jobs. MUST have `pcntl` extension for Reverb signals.
-   **`reverb`:** WebSocket server. Internal HTTP/9000, proxied via Caddy on HTTPS/443.

## 6. Key Resources

-   **Primary Deployment Logic:** `/.github/workflows/main-pipeline.yml`
-   **Production Environment:** `/compose.prod.yml`
-   **Caddyfiles:**
    -   `/docker/development/caddy/conf/Caddyfile`
    -   `/docker/staging/caddy/Caddyfile`
    -   `/docker/production/caddy/Caddyfile`
-   **Production Dockerfiles:**
    -   `/docker/production/caddy/Dockerfile`
    -   `/docker/production/php-fpm/Dockerfile`
-   **CI & Validation:** `/.github/workflows/ci.yml`, `/.github/workflows/pr-lint.yml`
