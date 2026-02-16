# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-02-16

### Added
- **Manager Dashboard**: New `DashboardGestorPage` with analytics for space managers (Pending/Evaluated reservations, Total spaces).
- **Institution Dashboard**: New `DashboardInstitucionalPage` for high-level overview.
- **Database Optimization**: Added indexes to `reservas` and `horarios` tables for improved query performance.
- **Notifications**: Notification infrastructure and controller.
- **Permission Types**: Basic permission handling implementation.

### Infrastructure
- **CI/CD**: Comprehensive GitHub Actions pipeline for:
    - Linting (PHP Pint, ESLint)
    - Testing (PHPUnit, Jest - partial)
    - Docker Build & Push to GHCR
    - Automated Deployment to Staging (SSH + Cloudflare Tunnel)
- **Docker**: Optimized Dockerfile builds using pre-built assets.

### Changed
- **Dependencies**: Updated Laravel framework to v12.x and React to v18.
- **Frontend**: Migrated to Tailwind CSS v4.

### Monitoring
- **Status Checks**: Added health checks for workspace and database services in CI/CD.
