# UniEspaços Roadmap

This document outlines the strategic development plan for UniEspaços, organized by version milestones.

## ✅ Completed (v1.x)
*   **Real-time Notifications:** Migrated from Pusher to Laravel Reverb for self-hosted WebSockets.
*   **Automated CI/CD:** Implemented a full GitHub Actions pipeline for linting, testing, and automated deployments to staging and production.
*   **Deployment Reliability:** Stabilized the deployment process by introducing health checks, graceful shutdowns, and automated clearing of stale assets.
*   **Database Optimization:** Added necessary indexes to improve query performance.
*   **Core MVP Functionality:** Delivered the initial product for pilot testing.

## 🎯 v1.x: Stabilization & Pilot Consolidation
*Focus: Turning the MVP into a robust, reliable product for the initial campus pilot and gathering user feedback.*

*   **🛡️ Quality & User Experience**
    *   [ ] **Bug Squashing Campaign:** Prioritize and fix bugs reported from the pilot test.
    *   [/] **Test Coverage:** Continue improving frontend (Jest/RTL) and backend (PHPUnit) test coverage.
    *   [/] **Admin Dashboard 2.0:** Enhance tools for campus/sector managers based on feedback (better tables, filters, quick actions).
    *   [ ] **UX Refinements:** Improve the reservation flow, calendar interaction, and feedback messages.
    *   [ ] **Comprehensive Documentation:** Finalize user and administrator guides.

---

## 🚀 v2.x: Expansion & Intelligence
*Focus: Integrating with the ecosystem and providing data-driven insights.*

*   **🔌 Integration & API**
    *   [ ] **RESTful API:** Build a secure API to expose space/reservation data to other university systems (Academic, HR).
    *   [ ] **Calendar Sync:** Integration with Google Calendar and Outlook for personal schedule synchronization.

*   **📊 Data & Analytics**
    *   [/] **Manager Analytics:** Create dashboards showing occupancy rates, idle times, and peak usage hours to inform resource allocation.
    *   [ ] **Data Model Refactoring:** Optimize the database schema based on v1 learnings to support scale and new features.

---

## 🔭 v3.x: Innovation & Automation
*Focus: Advanced features and intelligent resource management.*

*   **🧠 Intelligent Allocation**
    *   [ ] **Smart Distribution:** Automatically suggest or allocate spaces based on sector needs (class hours, capacity) and defined rules.

*   **📱 Mobile Experience**
    *   [ ] **Mobile App (PWA/Native):** A dedicated mobile interface for quick reservations and checking schedules on the go.

*   **🔮 Predictive Modeling**
    *   [ ] **Demand Forecasting:** Use Machine Learning on historical data to predict future space needs and optimize long-term planning.

---
*Last updated: February 18, 2026*
