#!/bin/sh
set -e

# Check if $UID and $GID are set, else fallback to default (1000:1000)
USER_ID=${UID:-1000}
GROUP_ID=${GID:-1000}

# Fix file ownership and permissions using the passed UID and GID
echo "Fixing file permissions with UID=${USER_ID} and GID=${GROUP_ID}..."
chown -R ${USER_ID}:${GROUP_ID} /var/www || echo "Some files could not be changed"

# Verifica se a APP_KEY está definida
if grep -q "^APP_KEY=$" .env || ! grep -q "^APP_KEY=" .env; then
    echo "Gerando APP_KEY..."
    php artisan key:generate
else
    echo "APP_KEY já definida."
fi
# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

echo "Verificando se o banco precisa de seeds..."
# Executa um comando PHP rápido para contar registros na tabela 'users' (ou outra principal)
# O comando retorna apenas o número de registros
RECORD_COUNT=$(php artisan tinker --execute "echo \DB::table('users')->count()")
# Se a contagem for igual a 0, roda os seeds
if [ "$RECORD_COUNT" -eq "0" ]; then
    echo "Banco vazio detectado. Rodando db:seed..."
    php artisan db:seed 
else
    echo "Banco já populado ($RECORD_COUNT registros encontrados). Pulando seeds."
fi

php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run the default command (e.g., php-fpm or bash)
exec "$@"
