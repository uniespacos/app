# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-02-26

### Added
- **Manager Dashboard**: New `DashboardGestorPage` with analytics for space managers (Pending/Evaluated reservations, Total spaces).
- **Institution Dashboard**: New `DashboardInstitucionalPage` for high-level overview.
- **Database Optimization**: Added indexes to `reservas` and `horarios` tables for improved query performance.
- **Permission Types**: Basic permission handling implementation.
- **Notifications**: Completely revamped notification infrastructure with modernized email templates, project branding, and Portuguese translations for default Laravel notifications.
- **Profile Management**: Added phone number and sector fields to user profiles for better communication and organization.
- **Deployment & CI/CD**: Enhanced deployment and rollback scripts to support safe, optional database snapshot restoration and use short SHA tags for precise version control.

### Fixed
- **Reservations**: Resolved bugs related to date selection and recurrence, ensuring smooth scheduling (#113).
- **Notifications**: Fixed Reverb timeout and "double notification" issues, stabilizing internal Docker broadcasting.
- **Notifications**: Resolved issues with blank notifications and missing reservations on the list view.
- **Notifications**: Made reservation update and cancellation flows more resilient to external notification service failures.
- **UI**: Fixed a bug where the browser tab title was not updating correctly to reflect the current page (#110, #115).
- **Profile**: Stabilized the email verification flow to prevent unexpected state changes.
- **CI/CD**: Fixed backend testing pipeline failures related to environment variable configuration (`APP_ENV=testing`).

### Changed
- **Dependencies**: Updated Laravel framework to v12.x and React to v18.
- **Frontend**: Migrated to Tailwind CSS v4.
- **Notifications**: Suppressed unnecessary email notifications for managers when they reserve their own managed spaces, reducing inbox clutter (#109).
- **Notifications**: Improved email efficiency by summarizing large reservation schedules into a single notification rather than sending multiple emails.
- **Reservations**: Enhanced the reservation request form with better validation and clear information regarding mandatory fields.
- **Infrastructure**: Updated Docker setup with a robust workspace service, NVM entrypoint scripts, and modernized environment configurations.

### Monitoring
- **Status Checks**: Added health checks for workspace and database services in CI/CD.
