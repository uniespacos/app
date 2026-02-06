# GEMINI.md: UniEspaços Project Guide

This document provides a comprehensive overview of the UniEspaços project, its structure, and key development workflows.

## Project Overview

UniEspaços is a full-stack web application designed for managing space reservations.

-   **Backend:** A robust API built with **Laravel (PHP 12.x)**.
-   **Frontend:** A modern, single-page application (SPA) using **React (v18)** and **Inertia.js**.
-   **Database:** **PostgreSQL (v16)** is the primary data store.
-   **Development Environment:** The entire stack is containerized using **Docker** and orchestrated with **Docker Compose**.
-   **Frontend Tooling:** **Vite** is used for fast frontend development and bundling, with **Tailwind CSS** for styling.
-   **CI/CD:** The project uses **GitHub Actions** for automated linting, testing, and deployment.

## Getting Started: Development Environment

The project is designed to run within a Dockerized environment.

### Prerequisites

-   Docker and Docker Compose
-   PHP >= 8.2 (for local tooling if needed)
-   Composer (for local tooling if needed)
-   Node.js/npm (for local tooling if needed)

### Initial Setup

1.  **Clone the Repository:**
    ```bash
    git clone git@github.com:uniespacos/app.git
    cd app
    ```

2.  **Configure Environment:** Copy the development environment file.
    ```bash
    cp .env.dev .env
    ```

3.  **Start Services:** Launch the Docker containers in detached mode.
    ```bash
    docker compose -f compose.dev.yml up -d
    ```

4.  **Access the Workspace Container:** Most subsequent commands should be run inside the `workspace` container, which contains all the necessary tools like Composer, NPM, and Artisan.
    ```bash
    docker compose -f compose.dev.yml exec workspace bash
    ```

5.  **Install Dependencies:**
    ```bash
    # Inside the workspace container
    composer install
    npm install
    ```

6.  **Prepare the Application:**
    ```bash
    # Inside the workspace container
    php artisan key:generate
    php artisan storage:link
    php artisan migrate --seed
    ```

7.  **Run the Dev Server:** Start the Vite development server for hot-reloading.
    ```bash
    # Inside the workspace container
    npm run dev
    ```

The application should now be accessible at `http://localhost`. The Adminer database interface is at `http://localhost:8080`.

## Key Commands

All commands below are intended to be run from the host machine unless specified to be run inside the `workspace` container.

-   **Start Environment:** `docker compose -f compose.dev.yml up -d`
-   **Stop Environment:** `docker compose -f compose.dev.yml down`
-   **Enter Workspace:** `docker compose -f compose.dev.yml exec workspace bash`
-   **Run Artisan Commands:** `docker compose -f compose.dev.yml exec workspace php artisan <command>`
-   **Run Composer:** `docker compose -f compose.dev.yml exec workspace composer <command>`
-   **Run NPM/Vite:** `docker compose -f compose.dev.yml exec workspace npm <command>`

## Development Conventions

### Code Style & Linting

-   **PHP:** [Laravel Pint](https://laravel.com/docs/pint) is used for enforcing code style.
    -   Check for issues: `docker compose -f compose.dev.yml exec workspace vendor/bin/pint --test`
    -   Fix issues: `docker compose -f compose.dev.yml exec workspace vendor/bin/pint`

-   **JavaScript/TypeScript/React:** ESLint and Prettier are used.
    -   Check formatting: `npm run format:check`
    -   Fix formatting: `npm run format`
    -   Run linter: `npm run lint`

### Testing

-   **Backend (PHPUnit):** The backend has both unit and feature tests, configured in `phpunit.xml`.
    -   Run all tests: `docker compose -f compose.dev.yml exec workspace php artisan test`
    -   Alternatively: `docker compose -f compose.dev.yml exec workspace ./vendor/bin/phpunit`

-   **Frontend:** There are currently no automated frontend tests configured.

### CI/CD Pipeline (`.github/workflows/main-pipeline.yml`)

The pipeline automates quality checks and deployment:
1.  **Lint & Static Analysis:** Runs `vendor/bin/pint --test`.
2.  **PHPUnit Tests:** Runs `php artisan test`.
3.  **Docker Build Check:** Ensures the production Docker image builds successfully.
4.  **Deploy to Production:** On a push to the `main` branch, automatically deploys the application to the production server via SSH.
