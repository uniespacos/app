#!/bin/bash
set -e

# Source environment variables from .env file
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Check if the image tag was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <image-tag>"
    exit 1
fi

NEW_TAG=$1
VERSION_FILE="docker/staging/versions.txt"
BACKUP_FILENAME="storage/backups/backup_staging_$(date +%F_%H-%M-%S).sql"

# 1. Backup the database
echo "Creating database backup..."
docker compose -f compose.staging.yml exec -T postgres pg_dump -U "${DB_USERNAME}" -d "${DB_DATABASE}" > "$BACKUP_FILENAME"

# 2. Save the current image tag and backup name for rollback
CURRENT_TAG=$(grep "CURRENT_TAG" "$VERSION_FILE" | cut -d'=' -f2 || echo "")
echo "PREVIOUS_TAG=$CURRENT_TAG" > "$VERSION_FILE"
echo "CURRENT_TAG=$NEW_TAG" >> "$VERSION_FILE"
echo "BACKUP_FILE=$BACKUP_FILENAME" >> "$VERSION_FILE"

# 3. Stop the application to clear asset volumes
echo "Stopping application to clear asset volumes..."
docker compose -f compose.staging.yml down --timeout 30

# 4. Remove old asset volumes to ensure a clean update
echo "Removing old asset volumes..."
docker volume rm app_uniespacos-public-assets-v2-staging app_uniespacos-public-staging-v2 || true

# 5. Pull the new image
echo "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f compose.staging.yml pull

# 6. Start the application with the new tag
echo "Starting application with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f compose.staging.yml up -d

# 7. Run migrations
echo "Running database migrations..."
docker compose -f compose.staging.yml exec -T app php artisan migrate --force

echo "Staging deployment finished successfully!"
