# Design Spec: Multi-Environment CI/CD Workflows (Staging and Production)

This document specifies the design for setting up isolated GitHub Actions workflows for the **Staging** and **Production** environments in the UniEspaços project.

## 1. Objectives

- Establish separate CI/CD workflows for the staging environment (triggered by the `develop` branch) and the production environment (triggered by the `main` branch and `v*` tags).
- Ensure linting and tests run automatically for pull requests targeting their respective branch.
- Securely deploy to each environment using distinct sets of secrets and environments on GitHub.

## 2. Environments & Workflows Mapping

| Environment | Source Branch | Triggers | Deploy Secret Prefix | Target VPS Path Secret | GitHub Environment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Staging** | `develop` | Push to `develop`, PR to `develop`, Manual | `_STAGING` | `PATH_TO_APP_FOLDER_STAGING` | `staging` |
| **Production** | `main` | Push to `main`, Push tags `v*`, PR to `main`, Manual | `_PRODUCTION` | `PATH_TO_APP_FOLDER_PRODUCTION` | `production` |

---

## 3. Workflow Specifications

### A. Production Workflow (`cicd-production.yml`)

- **Name**: `CI/CD - Production`
- **Triggers**:
  - `push` on branch `main`
  - `push` on tags `v*`
  - `pull_request` on branch `main`
  - `workflow_dispatch` (manual)
- **Deployment Behavior**:
  - Deploys on pushes to `main` and pushes of tags `v*`.
  - Uses the `production` GitHub Environment.
  - Sourced from production secrets (e.g. `SSH_HOST_PRODUCTION`, `CF_ACCESS_CLIENT_ID_PRODUCTION`, etc.).
  - Runs `./deploy.production.sh` on the VPS.

### B. Staging Workflow (`cicd-staging.yml`)

- **Name**: `CI/CD - Staging`
- **Triggers**:
  - `push` on branch `develop`
  - `pull_request` on branch `develop`
  - `workflow_dispatch` (manual)
- **Deployment Behavior**:
  - Deploys on pushes to `develop`.
  - Uses the `staging` GitHub Environment.
  - Sourced from staging secrets (e.g. `SSH_HOST_STAGING`, `CF_ACCESS_CLIENT_ID_STAGING`, etc.).
  - Sourced from staging-specific Reverb environment variables (`VITE_REVERB_APP_KEY_STAGING`, etc.).
  - Runs `./deploy.staging.sh` on the VPS.

---

## 4. Verification Plan

### Automated Check
- Validate GitHub Actions YAML syntax using the parser or offline linter check.

### Manual Check
- Push changes to `develop` branch to trigger the staging workflow, verifying that building, testing, and deployment to the staging environment succeeds.
- Push changes to `main` (or trigger via tag) to verify the production workflow execution and deployment to the production environment.
