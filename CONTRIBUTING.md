# Contributing to UniEspaços

Thank you for your interest in contributing to UniEspaços! We want to make this project a collaborative effort to solve university space management challenges.

## 🌟 How to Contribute

### 1. Reporting Bugs
Found a bug? Please open an issue on GitHub describing:
*   Steps to reproduce.
*   Expected behavior vs. actual behavior.
*   Screenshots (if applicable).

### 2. Suggesting Features
Have an idea? Open an issue tagged as `enhancement` or discuss it in the existing Roadmap discussions.

### 3. Submitting Code (Pull Requests)
1.  **Fork** the repository.
2.  **Create a branch** for your feature/fix (`git checkout -b feature/amazing-feature`).
3.  **Commit** your changes following our conventions.
4.  **Push** to your branch.
5.  **Open a Pull Request** targeting the `main` branch.

## 💻 Development Guidelines

### Code Style
We enforce code standards to keep the codebase clean.

*   **PHP (Laravel):** We use [Laravel Pint](https://laravel.com/docs/pint).
    *   Run check: `vendor/bin/pint --test`
    *   Fix style: `vendor/bin/pint`
*   **JavaScript/React:** We use ESLint and Prettier.
    *   Run check: `npm run lint`
    *   Fix style: `npm run format`

### Testing
**All new features must include tests.**
*   **Backend:** PHPUnit (`php artisan test`)
*   **Frontend:** Jest/React Testing Library (`npm run test`)

### Commit Messages
Please use clear, descriptive commit messages. We encourage the [Conventional Commits](https://www.conventionalcommits.org/) style:
*   `feat: add new user profile page`
*   `fix: resolve calendar timezone issue`
*   `docs: update roadmap`
*   `chore: update dependencies`

## 💬 Community
Join our discussions on GitHub Issues or reach out to the maintainers if you have questions.

Happy Coding! 🚀
