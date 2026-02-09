# UniEspaços Project Roadmap

This document outlines the development roadmap for the UniEspaços project, tracking completed tasks and future goals.

## Completed Tasks

*   **Feature: Jest Testing for Frontend**
    *   Added Jest and React Testing Library for frontend testing.
    *   Created a `jest.setup.js` file to mock browser features.
    *   Established a convention for test files (`.test.tsx`).
*   **Fix: Sidebar Component Tests**
    *   Fixed failing tests for the sidebar component related to cookie handling and initial state.
    *   Refactored the sidebar component to be more robust in a testing environment.
*   **Refactor: Jest Configuration**
    *   Resolved a `ts-jest` deprecation warning by moving the `isolatedModules` option to `tsconfig.json`.
*   **Chore: Dependency Updates**
    *   Updated npm dependencies.

## Remaining Tasks

*   **Feature: Full Frontend Test Coverage**
    *   Expand test coverage for all React components.
*   **Feature: User Profile Page**
    *   Implement a user profile page where users can view and edit their information.
*   **Feature: Space Reservation Calendar**
    *   Enhance the calendar view for space reservations with more interactive features.
*   **Feature: Admin Dashboard**
    *   Improve the admin dashboard with more detailed analytics and management tools.
*   **Infrastructure: Implement CI/CD flow**
    *   Set up and refine continuous integration and continuous deployment pipelines.
*   **Maintenance: Bug Fixes and Stability Improvements**
    *   Address various bugs across the application and improve overall system stability.

---
*This roadmap was last updated on February 9, 2026.*
