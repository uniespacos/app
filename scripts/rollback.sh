#!/bin/bash
# Production Rollback Script
# Rollback to the previous version tracked in docker/production/versions.txt

set -eo pipefail

log() {
  echo "------------------------------------------------"
  echo "INFO: $1"
  echo "------------------------------------------------"
}

VERSION_FILE="docker/production/versions.txt"
COMPOSE_FILE="compose.production.yml"
RESTORE_DB=false

# Parse arguments
for arg in "$@"
do
    if [ "$arg" == "--restore-db" ]
    then
        RESTORE_DB=true
    fi
done

# 1. Get the previous image tag
PREVIOUS_TAG=$(grep "PREVIOUS_TAG" "$VERSION_FILE" | cut -d'=' -f2 || echo "")

if [ -z "$PREVIOUS_TAG" ]; then
    log "Error: No previous version found in $VERSION_FILE to roll back to."
    exit 1
fi

# 2. Get environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

log "Rolling back to version: $PREVIOUS_TAG..."

# 3. Apply rolling update with previous tag
IMAGE_TAG=$PREVIOUS_TAG docker compose -f "$COMPOSE_FILE" up -d

# 4. Restore database if requested
if [ "$RESTORE_DB" = true ]; then
    BACKUP_FILE=$(grep "BACKUP_FILE" "$VERSION_FILE" | cut -d'=' -f2 || echo "")
    if [ -f "$BACKUP_FILE" ]; then
        log "WARNING: Restoring database from $BACKUP_FILE."
        docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${DB_USERNAME}" -d "${DB_DATABASE}" < "$BACKUP_FILE"
        log "Database restored successfully."
    else
        log "Warning: Backup file $BACKUP_FILE not found. Skipping database restore."
    fi
else
    log "INFO: To restore the database, run this script with --restore-db"
    log "Warning: Database has not been rolled back automatically."
fi

# 5. Update version file
CURRENT_TAG=$(grep "CURRENT_TAG" "$VERSION_FILE" | cut -d'=' -f2 || echo "")
echo "PREVIOUS_TAG=" > "$VERSION_FILE"
echo "CURRENT_TAG=$PREVIOUS_TAG" >> "$VERSION_FILE"
echo "BACKUP_FILE=" >> "$VERSION_FILE"

log "Rollback finished successfully!"
