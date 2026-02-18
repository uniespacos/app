# Automated Deployment Guide

The project is configured for automated deployments to both staging and production environments via GitHub Actions.

## Environments

-   **Staging:** Deployed automatically when code is pushed to the `development` branch.
-   **Production:** Deployed automatically when code is pushed to the `main` branch.

## Deployment Process

The CI/CD pipeline, defined in `.github/workflows/ci.yml`, handles all the steps:

1.  **Lint & Test:** The code is first linted and tested.
2.  **Build & Push:** Docker images for the application and web server are built and pushed to the GitHub Container Registry (GHCR).
3.  **Deploy:** The appropriate deployment job (staging or production) is triggered. It connects to the server via SSH and executes the corresponding deployment script (`deploy-staging.sh` or `deploy-production.sh`).

The deployment script (`deploy.sh` on the server, which is a copy of the script from the repo) handles the following:

-   Backing up the database.
-   Pulling the new Docker images from GHCR.
-   Restarting the application containers with the new images.
-   Running database migrations.

## Rollback

A manual rollback can be performed by SSH'ing into the server and running the `rollback.sh` script. This will revert to the previous Docker images and restore the database from the backup.

1.  **SSH into the server:**
    ```bash
    ssh <user>@<host>
    ```
2.  **Navigate to the app directory:**
    ```bash
    cd /home/operador/app
    ```
3.  **Run the Rollback Script:**
    ```bash
    ./scripts/rollback.sh
    ```

## Required GitHub Secrets

For the automated deployment to work, the following secrets must be configured in the GitHub repository settings under `Settings > Secrets and variables > Actions`:

### Staging Environment Secrets
-   `CF_ACCESS_CLIENT_ID`
-   `CF_ACCESS_CLIENT_SECRET`
-   `SSH_HOST`
-   `SSH_USER`
-   `SSH_PRIVATE_KEY`

### Production Environment Secrets
-   `CF_ACCESS_CLIENT_ID_PRODUCTION`
-   `CF_ACCESS_CLIENT_SECRET_PRODUCTION`
-   `SSH_HOST_PRODUCTION`
-   `SSH_USER_PRODUCTION`
-   `SSH_PRIVATE_KEY_PRODUCTION`
