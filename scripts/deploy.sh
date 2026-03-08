#!/bin/bash
# Production Deployment Script
# Zero-downtime deployment script with version tracking

set -eo pipefail

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
PRODUCTION_PATH="/home/phplemos/uniespacos/app"
COMPOSE_FILE="compose.prod.yml"
VERSION_DIR="docker/production"
VERSION_FILE="$VERSION_DIR/versions.txt"
BACKUP_DIR="storage/backups"
BACKUP_FILENAME="$BACKUP_DIR/backup_production_$(date +%F_%H-%M-%S).sql"

# Ensure .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        log ".env file missing on host. Creating it from .env.example..."
        cp .env.example .env
        chmod 600 .env
    else
        echo "Error: Neither .env nor .env.example found on host server at $PRODUCTION_PATH"
        exit 1
    fi
fi

# Source environment variables for backup and versioning
set -a
source .env
set +a

# Ensure necessary directories exist
log "Ensuring necessary directories exist..."
mkdir -p "$VERSION_DIR"
mkdir -p "$BACKUP_DIR"
touch "$VERSION_FILE"
mkdir -p storage/logs bootstrap/cache

# 1. Database Backup (Production Pattern)
log "Creating database backup..."
tmp_backup_file="$(mktemp "$BACKUP_DIR/backup_tmp_XXXXXX.sql")"
if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "${DB_USERNAME}" -d "${DB_DATABASE}" > "$tmp_backup_file"; then
  mv "$tmp_backup_file" "$BACKUP_FILENAME"
else
  log "Warning: Database backup failed. Proceeding anyway..."
  rm -f "$tmp_backup_file"
fi
# 2. Version Tracking (Production Pattern)
log "Configuring version tracking to update on successful deploy..."
ORIGINAL_TAG=$(grep "CURRENT_TAG" "$VERSION_FILE" | cut -d'=' -f2 || echo "")
trap 'status=$?; if [ "$status" -eq 0 ]; then
  log "Updating version tracking..."
  tmp_file="${VERSION_FILE}.tmp"
  {
    echo "PREVIOUS_TAG=$ORIGINAL_TAG"
    echo "CURRENT_TAG=$NEW_TAG"
    echo "BACKUP_FILE=$BACKUP_FILENAME"
  } > "$tmp_file"
  mv "$tmp_file" "$VERSION_FILE"
else
  log "Deployment failed (exit code $status); leaving version tracking unchanged."
fi' EXIT

# 3. Pull Images
log "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" pull

# 4. Maintenance Mode
log "Enabling maintenance mode..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan down || log "Application not running or already down."

# 5. Pre-flight Migrations (Zero-Downtime Improvement)
log "Running pre-flight database migrations in ephemeral container..."
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" run --rm -T app /usr/local/bin/php /var/www/artisan migrate --force

# 6. Rolling Update (Zero-Downtime Improvement)
log "Applying changes via rolling update (docker compose up -d)..."
# Unlike production's 'down' + 'up', this only recreates changed containers
IMAGE_TAG=$NEW_TAG docker compose -f "$COMPOSE_FILE" up -d

log "Waiting for application container to be running..."
RETRIES=15
while [ $RETRIES -gt 0 ]; do
    CONTAINER_ID=$(docker compose -f "$COMPOSE_FILE" ps -q app 2>/dev/null || echo "")
    if [ -n "$CONTAINER_ID" ]; then
        STATE=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_ID" 2>/dev/null || echo "not-found")
    else
        STATE="not-found"
    fi
    if [ "$STATE" == "running" ]; then
        log "Application container is running."
        break
    fi
    echo "Waiting for container (current state: $STATE, $((RETRIES -1)) retries left)..."
    sleep 3
    RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
    echo "Error: Application container failed to start."
    docker compose -f "$COMPOSE_FILE" logs app
    exit 1
fi

# 7. Post-deployment Optimization
log "Ensuring correct permissions..."
docker compose -f "$COMPOSE_FILE" exec -T -u root app chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
docker compose -f "$COMPOSE_FILE" exec -T -u root app chmod -R 775 /var/www/storage /var/www/bootstrap/cache

log "Clearing all caches..."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php /var/www/artisan optimize:clear

log "Refreshing application cache..."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php /var/www/artisan config:cache
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php /var/www/artisan route:cache
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php /var/www/artisan view:cache

# 8. Disable Maintenance Mode
log "Bringing application out of maintenance mode..."
docker compose -f "$COMPOSE_FILE" exec -T -u www-data app php /var/www/artisan up

log "Cleaning up old Docker images..."
docker image prune -f

log "Production deployment finished successfully!"
