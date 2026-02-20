# UniEspaços Roadmap

This document outlines the strategic development plan for UniEspaços, organized by version milestones.

## 🎯 v1.x: Stabilization & Pilot Consolidation
*Focus: Turning the MVP into a robust, reliable product for the initial campus pilot.*

*   **🛡️ Stability & Quality**
    *   [ ] **Bug Squashing Campaign:**
        *   [ ] Admin Page: Managers List Order Incorrect (#101)
        *   [ ] Browser Tab Title (Title Tag) Not Updating Correctly (#110)
        *   [ ] Delete Confirmation Alert Positioned Incorrectly (#111)
    *   [/] **Test Coverage:** Complete frontend (Jest/RTL) and backend (PHPUnit) test coverage.
    *   [x] **CI/CD Finalization:** Ensure GitHub Actions pipelines are 100% reliable for testing and deployment.

*   **⚡ Performance**
    *   [x] **Database Optimization:** Review slow queries and add missing indexes (Foreign Keys, search columns).

*   **👥 User Experience**
    *   [/] **Admin Dashboard 2.0:** Enhance tools for campus/sector managers (better tables, filters, quick actions).
    *   [ ] **UX Refinements:**
        *   [ ] Enhance Email and Reverb Notification Templates (#103)
        *   [ ] UI: Reservation List UI: Display Space and Module Information (#105)
        *   [ ] UI: Calendar UI: Add Day of Week to Slot Groups (#106)
        *   [ ] Improve the reservation flow, calendar interaction, and feedback messages.

---

## 🚀 v2.x: Expansion & Intelligence
*Focus: Integrating with the ecosystem and providing data-driven insights.*

*   **🔌 Integration & API**
    *   [ ] **RESTful API:**
        *   [ ] Implement robust error handling and logging mechanisms for API endpoints (#112)
        *   [ ] Build a secure API to expose space/reservation data to other university systems (Academic, HR).
    *   [ ] **Calendar Sync:** Integration with Google Calendar and Outlook for personal schedule synchronization.

*   **📊 Data & Analytics**
    *   [/] **Manager Analytics:** Dashboards showing occupancy rates, idle times, and peak usage hours.
    *   [ ] **Data Model Refactoring:** Optimize the database schema based on v1 learnings to support scale.
    *   [ ] **Advanced Management:**
        *   [ ] "Gerenciar Reservas" Page: Add Sorting Options (#102)
        *   [ ] UI: "Gerenciar Reservas" List: Implement Filter/Archive (Soft Delete) Option (#108)
        *   [ ] Optimize Notification: No Email for Self-Requested Manager Reservations (#109)

---

## 🔭 v3.x: Innovation & Automation
*Focus: Advanced features and intelligent resource management.*

*   **🧠 Intelligent Allocation**
    *   [ ] **Smart Distribution:** Automatically suggest or allocate spaces based on sector needs (class hours, capacity) and rules.
    *   [ ] **Customizable Availability:**
        *   [ ] Manager Slot Template Configuration (#104)
        *   [ ] Alert for Pending Overlapping Requests (#107)

*   **📱 Mobile Experience**
    *   [ ] **Mobile App (PWA/Native):** Dedicated mobile interface for quick reservations and checking schedules.

*   **🔮 Predictive Modeling**
    *   [ ] **Demand Forecasting:** Use Machine Learning on historical data to predict future space needs and optimize planning.

---
*Last updated: February 20, 2026*
