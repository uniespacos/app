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

### Option A: Use Pre-built Images (Standard)
If you have set up CI/CD to push images to GHCR:
1. Ensure `compose.prod.yml` references the correct image tags.
2. Run:
   ```bash
   docker compose -f compose.prod.yml pull
   docker compose -f compose.prod.yml up -d
   ```

### Option B: Build Locally (Manual Migration)
If you do not have images on GHCR, use the newly created `compose.prod.build.yml` to build locally on the server.

1. **Build Frontend Assets:**
   ```bash
   npm ci
   npm run build
   ```

2. **Build and Start Containers:**
   ```bash
   docker compose -f compose.prod.build.yml up -d --build
   ```

3. **Run Migrations:**
   ```bash
   docker compose -f compose.prod.build.yml exec app php artisan migrate --force
   ```

4. **Optimize:**
   ```bash
   docker compose -f compose.prod.build.yml exec app php artisan optimize
   ```

## 3. Troubleshooting
- If Nginx fails to start, check `SSL_CERT_PATH` in `.env.prod`.
- If Reverb fails, ensure port `9000` is open and keys are set.
