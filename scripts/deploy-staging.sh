#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -eo pipefail

# --- Configuration ---
# The root directory of your staging application on the server.
APP_DIR="/var/www/uniespacos-staging"
# The file to store the image tag of the last successful deployment.
STATE_FILE="$APP_DIR/deployment_state.txt"
# The new image tag passed from the GitHub Actions workflow (e.g., "development").
IMAGE_TAG_NEW="${1}"

# --- Helper Functions ---
function log() {
  echo "✅ [Deploy Staging] $1"
}

function log_error() {
  echo "❌ [Deploy Staging] $1" >&2
}

# --- Rollback Function ---
# This function is triggered by 'trap' if any command in the script fails.
function rollback() {
  log_error "Deployment failed. Rolling back to the last known good version: $IMAGE_TAG_OLD"
  # Use the old, stable image tag to bring the containers back up.
  export IMAGE_TAG=$IMAGE_TAG_OLD
  docker compose -f compose.prod.yml up -d --remove-orphans
  log "Rollback to version $IMAGE_TAG_OLD complete."
  # Exit with an error code to ensure the GitHub Action fails.
  exit 1
}

# --- Main Deployment Script ---
# Navigate to the application directory or exit if it doesn't exist.
cd "$APP_DIR" || { log_error "Deployment directory $APP_DIR not found."; exit 1; }

# Set up the trap to call the rollback function on any script error.
trap 'rollback' ERR

log "Starting staging deployment..."

# Ensure .env exists for variable substitution in docker-compose
if [ -f "stack.env" ]; then
  cp stack.env .env
  log "Copied stack.env to .env for variable substitution."
fi

# 1. Determine the current and new versions.
# Read the last successful version from our state file. Default to 'initial' if it doesn't exist.
IMAGE_TAG_OLD=$(cat "$STATE_FILE" || echo "initial")
log "Previous version: $IMAGE_TAG_OLD"
log "Deploying new version: $IMAGE_TAG_NEW"

# Exit if no new tag was provided.
if [ -z "$IMAGE_TAG_NEW" ]; then
  log_error "No new image tag provided. Aborting."
  exit 1
fi

# 2. Put the application in maintenance mode using the currently running version.
log "Enabling maintenance mode."
export IMAGE_TAG=$IMAGE_TAG_OLD
docker compose -f compose.prod.yml exec -T app php artisan down || true

# 3. Pull the new Docker images from the registry.
log "Pulling new Docker images for tag: $IMAGE_TAG_NEW"
export IMAGE_TAG=$IMAGE_TAG_NEW
docker compose -f compose.prod.yml pull

# 4. Launch the new containers.
log "Starting new containers..."
docker compose -f compose.prod.yml up -d --remove-orphans

log "Waiting for services to stabilize..."
sleep 15

# 5. Run database migrations and application optimizations.
log "Running database migrations..."
docker compose -f compose.prod.yml exec -T app php artisan migrate --force

log "Optimizing application..."
docker compose -f compose.prod.yml exec -T app php artisan optimize:clear
docker compose -f compose.prod.yml exec -T app php artisan optimize

# 6. Bring the application back online.
log "Disabling maintenance mode."
docker compose -f compose.prod.yml exec -T app php artisan up

# 7. On success, update the state file with the new version tag.
log "Deployment successful. Updating state file to $IMAGE_TAG_NEW."
echo "$IMAGE_TAG_NEW" > "$STATE_FILE"

log "🎉 Staging deployment finished successfully!"
