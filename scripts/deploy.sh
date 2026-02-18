#!/bin/bash
set -e

# Verifica se a tag da imagem foi fornecida
if [ -z "$1" ]; then
    echo "Usage: $0 <image-tag>"
    exit 1
fi

NEW_TAG=$1
VERSION_FILE="docker/production/versions.txt"

# 1. Faz o backup do banco de dados
echo "Creating database backup..."
docker compose -f compose.prod.yml exec -T postgres_production pg_dump -U "${DB_USERNAME}" -d "${DB_DATABASE}" > "storage/backups/backup_$(date +%F_%H-%M-%S).sql"

# 2. Salva a tag da imagem atual para o rollback
CURRENT_TAG=$(grep "CURRENT_TAG" $VERSION_FILE | cut -d'=' -f2)
echo "PREVIOUS_TAG=$CURRENT_TAG" > $VERSION_FILE
echo "CURRENT_TAG=$NEW_TAG" >> $VERSION_FILE

# 3. Faz o pull da nova imagem
echo "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f compose.prod.yml pull

# 4. Sobe a aplicação com a nova tag
echo "Starting application with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f compose.prod.yml up -d

# 5. Roda as migrations
echo "Running database migrations..."
docker compose -f compose.prod.yml exec -T app_production php artisan migrate --force

echo "Deployment finished successfully!"
