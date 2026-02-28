# Docker & Nginx Security Guidelines

## 1. Docker Security
- **Rootless/Non-Root:** Containers should run as a non-root user whenever possible. In the Dockerfile, switch to a specific user (e.g., `USER www-data` or `USER node`) after setup.
- **Minimal Base Images:** Use Alpine or slim variants for production images to reduce the attack surface.
- **Secrets Management:** Never hardcode secrets in Dockerfiles or commit `.env` files. Use Docker Compose environments, secrets, or a vault.
- **Read-Only Volumes:** Mount volumes as read-only (`:ro`) if the container does not need to write to them.
- **Network Isolation:** Do not expose internal ports (like database 5432 or Redis 6379) directly to the host unless necessary. Only expose the Nginx/Traefik ports.

## 2. Nginx Security
- **Security Headers:** Add headers like `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and a basic `Content-Security-Policy` (CSP).
- **Hide Server Info:** Ensure `server_tokens off;` is set to prevent exposing the Nginx version.
- **Rate Limiting:** Implement basic rate limiting (`limit_req`) on login or API endpoints to mitigate brute force or DoS attacks.
- **TLS Configuration:** Enforce modern TLS (1.2 or 1.3 only) and strong ciphers. If Traefik is handling TLS termination, ensure Nginx is only accepting internal traffic.
- **File Access:** Explicitly block access to hidden files (e.g., `.git`, `.env`) and sensitive directories.
