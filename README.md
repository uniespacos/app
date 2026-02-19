# UniEspaços

**UniEspaços** is a centralized space management system designed to solve the challenge of decentralized resource allocation in universities.

## 🎓 Project Origin & Context

Born from a Software Engineering course project, UniEspaços addresses a real-world problem: university spaces are often managed in a decentralized manner, leading to inefficiencies and a lack of visibility.

**The Goal:** Create a unified platform where:
*   **Sectors** maintain autonomy over their specific spaces.
*   **University Management** gains a centralized, macro view of all resources.
*   **Efficiency** is maximized through better allocation and data-driven insights.

## 🚀 Key Features

*   **Centralized Dashboard:** View and manage spaces across different sectors.
*   **Sector Autonomy:** Granular permissions for sector managers.
*   **Real-time Notifications:** Instant updates on reservation statuses via WebSockets.
*   **Automated Deployment:** CI/CD pipeline for reliable, zero-downtime deployments.
*   **Future Vision:** Check out our detailed [Roadmap](docs/ROADMAP.md).

## 🛠️ Tech Stack

*   **Backend:** Laravel 12.x (PHP 8.4) with Laravel Reverb for WebSockets.
*   **Frontend:** React 18 with Inertia.js & TypeScript.
*   **Styling:** Tailwind CSS.
*   **Database:** PostgreSQL 16.
*   **Infrastructure:** Docker & Docker Compose.
*   **CI/CD:** GitHub Actions for automated testing and deployment.
*   **Deployment:** Secure SSH deployments orchestrated via Cloudflare Tunnel.

## 🏛️ System Architecture

The entire stack is containerized for portability and scalability. For a visual representation of the services and request flow, see our **[Architecture & Deployment Diagrams](docs/diagrams.md)**.

## 🏁 Getting Started (Development)

The development environment is fully containerized.

### Prerequisites
*   Docker & Docker Compose
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:uniespacos/app.git
    cd app
    ```

2.  **Set up the environment:**
    ```bash
    cp .env.dev .env
    ```

3.  **Start the containers:**
    ```bash
    docker compose -f compose.dev.yml up -d
    ```

4.  **Install dependencies & setup the application:**
    Enter the workspace container:
    ```bash
    docker compose -f compose.dev.yml exec workspace bash
    ```
    Inside the container, run:
    ```bash
    composer install
    npm install
    php artisan key:generate
    php artisan storage:link
    php artisan migrate --seed
    ```

5.  **Run the Vite development server:**
    ```bash
    npm run dev
    ```

The application is now accessible at `https://localhost` (the environment is configured for SSL by default).

## 🚀 Deployment (CI/CD)

Deployment is fully automated using GitHub Actions.

### Deployment Triggers
*   **Staging:** A push to the `development` branch deploys to the staging environment.
*   **Production:** A push or merge to the `main` branch deploys to the production server.

### The Pipeline
The CI/CD pipeline performs the following steps automatically:
1.  **Lint & Static Analysis:** Checks PHP and JavaScript code for style issues.
2.  **Run Tests:** Executes the full PHPUnit and Jest test suites.
3.  **Build Images:** Builds and pushes versioned Docker images for the `app` (PHP-FPM) and `web` (Nginx) services to GitHub Container Registry.
4.  **Deploy:** Connects to the production server via a secure **Cloudflare Tunnel** and runs the `deploy.sh` script.

### Deployment Script (`deploy.sh`)
The remote script handles the final steps:
1.  Creates a database backup.
2.  Stops the running application and removes old frontend asset volumes to prevent stale-asset issues.
3.  Pulls the new Docker images from the registry.
4.  Starts the application with the new images.
5.  Runs database migrations.

### Required GitHub Secrets
For CI/CD to function, the following secrets must be configured in the GitHub repository settings:

*   `SSH_PRIVATE_KEY_PRODUCTION`: Private SSH key to access the production server.
*   `SSH_HOST_PRODUCTION`: The hostname of the production server.
*   `SSH_USER_PRODUCTION`: The user for the SSH connection.
*   `CF_ACCESS_CLIENT_ID_PRODUCTION`: Cloudflare Access client ID.
*   `CF_ACCESS_CLIENT_SECRET_PRODUCTION`: Cloudflare Access client secret.
*   `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`: Reverb configuration passed to the frontend build.

## 🤝 Contributing

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the **CC BY-NC-SA 4.0**. See the [LICENSE](LICENSE) file for details.
