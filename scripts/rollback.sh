#!/bin/bash
set -e

VERSION_FILE="docker/production/versions.txt"
BACKUP_DIR="storage/backups"

# 1. Pega a tag da imagem anterior
PREVIOUS_TAG=$(grep "PREVIOUS_TAG" $VERSION_FILE | cut -d'=' -f2)

if [ -z "$PREVIOUS_TAG" ]; then
    echo "No previous version found to roll back to."
    exit 1
fi

# 2. Para os containers atuais
echo "Stopping current application..."
docker compose -f compose.prod.yml down

# 3. Sobe a aplicação com a tag anterior
echo "Starting application with tag: $PREVIOUS_TAG..."
IMAGE_TAG=$PREVIOUS_TAG docker compose -f compose.prod.yml up -d

# 4. Restaura o banco de dados
echo "Restoring database from latest backup..."
LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup_*.sql | head -n 1)
docker compose -f compose.prod.yml exec -T postgres psql -U "${DB_USERNAME}" -d "${DB_DATABASE}" < $LATEST_BACKUP

# 5. Atualiza o arquivo de versões
CURRENT_TAG=$(grep "CURRENT_TAG" $VERSION_FILE | cut -d'=' -f2)
echo "PREVIOUS_TAG=" > $VERSION_FILE
echo "CURRENT_TAG=$PREVIOUS_TAG" >> $VERSION_FILE

echo "Rollback finished successfully!"
