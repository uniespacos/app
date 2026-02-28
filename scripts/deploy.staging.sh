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
VERSION_DIR="docker/staging"
VERSION_FILE="$VERSION_DIR/versions.txt"
BACKUP_DIR="storage/backups"
BACKUP_FILENAME="$BACKUP_DIR/backup_staging_$(date +%F_%H-%M-%S).sql"
COMPOSE_FILE="compose.staging.yml"

# Ensure necessary directories exist
log "Ensuring directories exist..."
mkdir -p "$VERSION_DIR"
mkdir -p "$BACKUP_DIR"
touch "$VERSION_FILE"

# --- Deployment Steps ---

log "Putting application into maintenance mode..."
# This command can fail if the container isn't running yet, so we add || true
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

log "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" pull

log "Starting application with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" up -d

log "Running post-deployment Laravel commands..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan migrate --force
docker compose -f "$COMPOSE_FILE" exec -T app php artisan config:cache
docker compose -f "$COMPOSE_FILE" exec -T app php artisan route:cache
docker compose -f "$COMPOSE_FILE" exec -T app php artisan view:cache

log "Bringing application out of maintenance mode..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan up

log "Cleaning up old Docker images..."
docker image prune -f

log "Staging deployment finished successfully!"
