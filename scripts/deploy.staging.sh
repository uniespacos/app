#!/bin/bash
# Staging Deployment Script
# This script is designed to be idempotent and safe to run on new or existing environments.

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error when substituting.
# Pipestatus is non-zero if any command in a pipeline fails.
set -eo pipefail

# --- Helper Functions ---
log() {
  echo "------------------------------------------------"
  echo "INFO: $1"
  echo "------------------------------------------------"
}

# --- Environment and Variables ---
log "Setting up environment and variables..."

# Source environment variables from .env file if it exists
if [ -f .env ]; then
    set -a
    # shellcheck source=/dev/null
    source .env
    set +a
else
    log "Warning: .env file not found. Relying on environment variables."
fi

# Check if the image tag was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <image-tag>"
    exit 1
fi

NEW_TAG=$1
STAGING_PATH="/home/phplemos/uniespacos/app"
VERSION_DIR="docker/staging"
VERSION_FILE="$VERSION_DIR/versions.txt"
BACKUP_DIR="storage/backups"
BACKUP_FILENAME="$BACKUP_DIR/backup_staging_$(date +%F_%H-%M-%S).sql"
COMPOSE_FILE="compose.staging.yml"

# Ensure necessary directories exist
log "Ensuring necessary directories exist..."
mkdir -p "$VERSION_DIR"
mkdir -p "$BACKUP_DIR"
touch "$VERSION_FILE"
mkdir -p storage/logs bootstrap/cache

log "Setting correct permissions for storage and cache directories..."
# Set ownership to www-data (UID 33) and group to www-data (GID 33)
docker compose -f "$COMPOSE_FILE" run --rm -u root app chown -R www-data:www-data storage bootstrap/cache
docker compose -f "$COMPOSE_FILE" run --rm -u root app chmod -R 775 storage bootstrap/cache

# --- Deployment Steps ---

log "Putting application into maintenance mode..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan down || true

log "Backing up the database..."
if docker compose -f "$COMPOSE_FILE" ps | grep -q postgres; then
    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "${DB_USERNAME}" -d "${DB_DATABASE}" > "$BACKUP_FILENAME" || echo "Warning: Database backup failed. Continuing deployment."
else
    echo "Warning: Postgres container is not running. Skipping database backup."
fi

log "Saving version information for rollback..."
CURRENT_TAG=$(grep "CURRENT_TAG" "$VERSION_FILE" | cut -d'=' -f2 || echo "initial")
{
    echo "PREVIOUS_TAG=$CURRENT_TAG"
    echo "CURRENT_TAG=$NEW_TAG"
    echo "BACKUP_FILE=$BACKUP_FILENAME"
} > "$VERSION_FILE"

log "Stopping application to clear asset volumes..."
docker compose -f "$COMPOSE_FILE" down --timeout 30

log "Removing old asset volumes to ensure a clean update..."
PROJECT_NAME=$(docker compose -f "$COMPOSE_FILE" config | grep "name:" | head -n 1 | awk '{print $2}' || echo "app")
docker volume rm "${PROJECT_NAME}_uniespacos-public-assets-v2-staging" "${PROJECT_NAME}_uniespacos-public-staging-v2" 2>/dev/null || log "Volumes not found or already removed."

log "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" pull

log "Starting application with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" up -d

log "Waiting for application container to be ready..."
RETRIES=10
while [ $RETRIES -gt 0 ]; do
    if docker compose -f "$COMPOSE_FILE" exec -T app php -v > /dev/null 2>&1; then
        log "Application container is ready."
        break
    fi
    echo "Waiting for container initialization ($RETRIES retries left)..."
    sleep 3
    RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
    echo "Error: Application container failed to become ready in time."
    exit 1
fi

log "Ensuring .env file is present and APP_KEY is set..."
# Use docker cp to definitively get the .env file into the container
if ! docker compose -f "$COMPOSE_FILE" exec -T app [ -f /var/www/.env ]; then
    log "No .env file found in container. Copying .env.staging from host..."
    docker cp "$STAGING_PATH/.env.staging" app-staging:/var/www/.env
fi

# Check if APP_KEY is set in .env inside the container
if ! docker compose -f "$COMPOSE_FILE" exec -T app grep -q "^APP_KEY=$" /var/www/.env; then
    log "APP_KEY is empty in .env. Generating one..."
    docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan key:generate
fi

log "Running post-deployment Laravel commands..."
# Clear caches before attempting to cache again to avoid permission issues
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan config:clear
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan route:clear
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan view:clear

docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan migrate --force
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan config:cache || log "Warning: config:cache failed."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan route:cache || log "Warning: route:cache failed."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan view:cache || log "Warning: view:cache failed."

log "Bringing application out of maintenance mode..."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php artisan up || log "Warning: artisan up failed (maybe it was already up)."

log "Cleaning up old Docker images..."
docker image prune -f

log "Staging deployment finished successfully!"
