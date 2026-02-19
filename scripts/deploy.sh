#!/bin/bash
set -e

# Source environment variables from .env file
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Verifica se a tag da imagem foi fornecida
if [ -z "$1" ]; then
    echo "Usage: $0 <image-tag>"
    exit 1
fi

NEW_TAG=$1
VERSION_FILE="docker/production/versions.txt"

# 1. Faz o backup do banco de dados
echo "Creating database backup..."
docker compose -f compose.prod.yml exec -T postgres pg_dump -U "${DB_USERNAME}" -d "${DB_DATABASE}" > "storage/backups/backup_$(date +%F_%H-%M-%S).sql"

# 2. Salva a tag da imagem atual para o rollback
CURRENT_TAG=$(grep "CURRENT_TAG" "$VERSION_FILE" | cut -d'=' -f2)
echo "PREVIOUS_TAG=$CURRENT_TAG" > "$VERSION_FILE"
echo "CURRENT_TAG=$NEW_TAG" >> "$VERSION_FILE"

# 3. Para a aplicação para limpar os volumes de assets
echo "Stopping application to clear asset volumes..."
docker compose -f compose.prod.yml down

# 4. Remove os volumes de assets antigos para garantir uma atualização limpa
echo "Removing old asset volumes..."
docker volume rm app_uniespacos-public-assets-v2 app_uniespacos-public-production-v2 || true

# 5. Faz o pull da nova imagem
echo "Pulling new images with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f compose.prod.yml pull

# 6. Sobe a aplicação com a nova tag
echo "Starting application with tag: $NEW_TAG..."
IMAGE_TAG=$NEW_TAG docker compose -f compose.prod.yml up -d

# 7. Roda as migrations
echo "Running database migrations..."
docker compose -f compose.prod.yml exec -T app php artisan migrate --force

echo "Deployment finished successfully!"
