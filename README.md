# UniEspaços

**UniEspaços** is a centralized space management system designed to solve the challenge of decentralized resource allocation in universities.

## 🎓 Project Origin & Context

Born from a Software Engineering course project, UniEspaços addresses a real-world problem: university spaces are often managed in a decentralized manner, where each sector controls its own rooms, leading to inefficiencies and lack of visibility.

**The Goal:** Create a unified platform where:

* **Sectors** maintain autonomy over their specific spaces.
* **University Management** gains a centralized, macro view of all resources.
* **Efficiency** is maximized through better allocation and data visibility.

Currently, the project is in the **MVP (Minimum Viable Product)** phase, being prepared for a pilot test in a single campus.

## 🚀 Key Features (Current & Planned)

* **Centralized Dashboard:** View and manage spaces across different sectors.
* **Sector Autonomy:** Granular permissions for sector managers.
* **Reservation System:** Conflict detection and approval workflows.
* **Future Vision:**
  * Advanced Analytics for usage optimization.
  * RESTful API for integration with other university systems.
  * Calendar Synchronization (Google/Outlook).
  * Intelligent/Automatic Allocation based on demand.

## 🛠️ Tech Stack

* **Backend:** Laravel 12.x (PHP 8.2+)
* **Frontend:** React 18 with Inertia.js
* **Styling:** Tailwind CSS
* **Database:** PostgreSQL 16
* **Infrastructure:** Docker & Docker Compose
* **CI/CD:** GitHub Actions

## 🏁 Getting Started

The entire development environment is containerized.

### Prerequisites

* Docker & Docker Compose
* Git

### Installation

1. **Clone the repository:**

    ```bash
    git clone git@github.com:uniespacos/uniespacos.git
    cd uniespacos
    ```

2. **Set up the environment:**

    ```bash
    cp .env.example .env
    ```

3. **Start the workspace container to prepare the enviroment:**

    ```bash
    docker compose -f compose.dev.yml up -d workspace
    ```

4. **Install dependencies & setup database:**
    Enter the workspace container:

    ```bash
    docker compose -f compose.dev.yml exec workspace bash
    ```

    Inside the container follow these steps:

    ```bash
    # Generate the reverb keys and replace on .env file
    php docker/production/scripts/generate_reverb_keys.php 
    # Install php and node dependencies
    composer install
    npm install
    # Run this laravel commands
    php artisan key:generate
    php artisan storage:link
    exit
    ```

    Make it all containers up

    ```bash
    docker compose -f compose.dev.yml up -d
    ```

    Run the migrations

    ```bash
    docker compose -f compose.dev.yml exec workspace php artisan migrate --seed
    ```

5. **Run the development server:**

    ```bash
    docker compose -f compose.dev.yml exec workspace bash
    npm run dev
    ```

6. **Tools to assist your develpment**
   * For trigged emails we use the mailpit: `localhost:8025`
   * You can visualize the database: `localhost:8080`

When complete all steps you canAccess the application at `https://localhost/`.

## 🗺️ Roadmap

We have a clear vision for the future of UniEspaços. Check out our [Roadmap](docs/ROADMAP.md) to see what we are working on (v1.x Stabilization) and what's coming next (v2.x Expansion & v3.x Innovation).

## 🤝 Contributing

We welcome contributions! Whether you're a student, a developer, or just interested in the project, check out our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

You are free to use, adapt, and share this software for **non-commercial purposes only**, provided you give appropriate credit and distribute your contributions under the same license. See the [LICENSE](LICENSE) file for details.
