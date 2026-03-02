#!/bin/bash
# Staging Deployment Script
# This script is designed to be idempotent and safe to run on new or existing environments.

# Exit immediately if a command exits with a non-zero status.
set -eo pipefail

# --- Helper Functions ---
log() {
  echo "------------------------------------------------"
  echo "INFO: $1"
  echo "------------------------------------------------"
}

# --- Environment and Variables ---
log "Setting up environment and variables..."

# Check if the image tag was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <image-tag>"
    exit 1
fi

NEW_TAG=$1
STAGING_PATH="/home/phplemos/uniespacos/app"
COMPOSE_FILE="compose.staging.yml"
VERSION_DIR="docker/staging"
VERSION_FILE="$VERSION_DIR/versions.txt"
BACKUP_DIR="storage/backups"
BACKUP_FILENAME="$BACKUP_DIR/backup_staging_$(date +%F_%H-%M-%S).sql"

# --- Pre-deployment Check: Ensure .env exists on host ---
# This is CRITICAL because the container needs .env to start (entrypoint.sh runs artisan commands)
if [ ! -f .env ]; then
    if [ -f .env.staging ]; then
        log ".env file missing on host. Creating it from .env.staging..."
        cp .env.staging .env
        # Ensure it's readable by the current user and docker
        chmod 644 .env
    else
        echo "Error: Neither .env nor .env.staging found on host server at $STAGING_PATH"
        exit 1
    fi
fi

# Source environment variables
set -a
# shellcheck source=/dev/null
source .env
set +a

# Ensure necessary directories exist
log "Ensuring necessary directories exist..."
mkdir -p "$VERSION_DIR"
mkdir -p "$BACKUP_DIR"
touch "$VERSION_FILE"
mkdir -p storage/logs bootstrap/cache

# --- Deployment Steps ---

log "Stopping current application to ensure a clean update..."
# We use down to clear networks for a fresh start, but volumes are preserved
docker compose -f "$COMPOSE_FILE" down --timeout 10 || true

log "Removing old asset volumes to ensure a clean update..."
# These are specifically public asset volumes and can be safely removed
PROJECT_NAME=$(docker compose -f "$COMPOSE_FILE" config | grep "name:" | head -n 1 | awk '{print $2}' || echo "app")
docker volume rm "${PROJECT_NAME}_uniespacos-public-assets-v2-staging" "${PROJECT_NAME}_uniespacos-public-staging-v2" 2>/dev/null || log "Volumes not found or already removed."

log "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" pull

log "Starting application with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" up -d

log "Waiting for application container to be running..."
RETRIES=15
while [ $RETRIES -gt 0 ]; do
    STATE=$(docker inspect -f '{{.State.Status}}' app-staging 2>/dev/null || echo "not-found")
    if [ "$STATE" == "running" ]; then
        log "Application container is running."
        break
    fi
    echo "Waiting for container (current state: $STATE, $RETRIES retries left)..."
    sleep 3
    RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
    echo "Error: Application container failed to start (or is in a crash loop)."
    docker compose -f "$COMPOSE_FILE" logs app
    exit 1
fi

# --- CRITICAL: Ensure .env is in container and correctly owned BEFORE other commands ---
log "Copying .env to container and ensuring correct ownership..."
docker cp "$STAGING_PATH/.env" app-staging:/var/www/.env
docker compose -f "$COMPOSE_FILE" exec -T -u root app chown www-data:www-data /var/www/.env

log "Ensuring correct permissions for storage and cache directories inside container..."
docker compose -f "$COMPOSE_FILE" exec -T -u root app chown -R www-data:www-data storage bootstrap/cache
docker compose -f "$COMPOSE_FILE" exec -T -u root app chmod -R 775 storage bootstrap/cache

log "Checking APP_KEY..."
# Check if APP_KEY is empty or missing in the .env file inside the container
if ! docker compose -f "$COMPOSE_FILE" exec -T app grep -q "^APP_KEY=.\+$" /var/www/.env; then
    log "APP_KEY is missing or empty. Generating one..."
    docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan key:generate
fi

log "Running post-deployment Laravel commands..."
# Clear caches before attempting to cache again to avoid permission issues
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan config:clear
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan route:clear
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan view:clear

# Run database migrations
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan migrate --force

# Re-cache the application configuration and routes
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan config:cache
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan route:cache
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan view:cache

log "Bringing application out of maintenance mode..."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan up || log "Warning: artisan up failed (maybe it was already up).

log "Saving version information..."
{
    echo "CURRENT_TAG=$NEW_TAG"
    echo "DEPLOYED_AT=$(date)"
} > "$VERSION_FILE"

log "Cleaning up old Docker images..."
docker image prune -f

log "Staging deployment finished successfully!"
