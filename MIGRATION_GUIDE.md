# Manual Migration Guide to Latest Development

You have successfully merged the latest changes from `development` into the `deploy_development_production` branch.

## 1. Environment Configuration (.env.prod)

Your `.env.prod` file has been updated with new keys. You **MUST** review and update the following values:

- **Reverb Configuration (Replaces Pusher):**
  - `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`: Generate new credentials or set arbitrary values if running locally.
  - `BROADCAST_CONNECTION=reverb`
  - `BROADCAST_DRIVER=reverb`

- **GitHub/Watchtower (Optional):**
  - `GITHUB_USER`, `GITHUB_TOKEN`: Required if you use `watchtower` to auto-update images from GHCR.

- **Web Server:**
  - `WEB_PORT`: Default 80.
  - `WEB_PORT_SSL`: Default 443.
  - `SSL_CERT_PATH`, `SSL_KEY_PATH`: Path to your SSL certificates on the host machine.

## 2. Deployment Method

The project has switched to a Docker Image-based deployment (pulling from GitHub Container Registry).

### Simplified Deployment (Recommended)

To deploy a new version of the application, use the `deploy.sh` script. This script will handle database backups, pull the new images, and restart the application.

1.  **Run the Deployment Script:**
    ```bash
    ./scripts/deploy.sh <image-tag>
    ```
    Replace `<image-tag>` with the specific version you want to deploy (e.g., `sha-20384df`).

### Rollback

If you need to revert to the previous version, use the `rollback.sh` script. This will restore the previous Docker images and the database.

1.  **Run the Rollback Script:**
    ```bash
    ./scripts/rollback.sh
    ```

## 3. Troubleshooting
- If Nginx fails to start, check `SSL_CERT_PATH` in `.env.prod`.
- If Reverb fails, ensure port `9000` is open and keys are set.
