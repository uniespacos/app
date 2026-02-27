#!/bin/bash
set -e

VERSION_FILE="docker/production/versions.txt"
RESTORE_DB=false

# Analisa os argumentos da linha de comando
for arg in "$@"
do
    if [ "$arg" == "--restore-db" ]
    then
        RESTORE_DB=true
    fi
done

# 1. Pega a tag da imagem anterior
PREVIOUS_TAG=$(grep "PREVIOUS_TAG" "$VERSION_FILE" | cut -d'=' -f2)

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

# 4. Restaura o banco de dados se a flag --restore-db for fornecida
if [ "$RESTORE_DB" = true ]; then
    BACKUP_FILE=$(grep "BACKUP_FILE" "$VERSION_FILE" | cut -d'=' -f2)
    if [ -f "$BACKUP_FILE" ]; then
        echo "----------------------------------------------------------------"
        echo "WARNING: Restoring database from $BACKUP_FILE."
        echo "All data created after this backup will be lost."
        echo "----------------------------------------------------------------"
        docker compose exec -T postgres-production psql -U "${DB_USERNAME}" -d "${DB_DATABASE}" < "$BACKUP_FILE"
        echo "Database restored successfully."
    else
        echo "WARNING: Backup file $BACKUP_FILE not found. Skipping database restore."
    fi
else
    echo "----------------------------------------------------------------"
    echo "INFO: To restore the database, run this script with --restore-db"
    echo "WARNING: Database has not been rolled back."
    echo "If the previous code version requires a different database schema,"
    echo "you may need to run migrations rollback manually."
    echo "Example: docker compose -f compose.prod.yml exec -T app php artisan migrate:rollback --step=1"
    echo "----------------------------------------------------------------"
fi

# 5. Atualiza o arquivo de versões
CURRENT_TAG=$(grep "CURRENT_TAG" "$VERSION_FILE" | cut -d'=' -f2)
echo "PREVIOUS_TAG=" > "$VERSION_FILE"
echo "CURRENT_TAG=$PREVIOUS_TAG" >> "$VERSION_FILE"
# Limpa o arquivo de backup para evitar restaurações acidentais no futuro
echo "BACKUP_FILE=" >> "$VERSION_FILE"


echo "Rollback finished successfully!"
