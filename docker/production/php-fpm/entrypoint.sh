#!/bin/sh
set -e

# Corrige permissões
chown www-data:www-data /socket

# Inicializa storage se estiver vazio
if [ ! "$(ls -A /var/www/storage)" ]; then
  echo "Initializing storage directory..."
  cp -R /var/www/storage-init/. /var/www/storage
  chown -R www-data:www-data /var/www/storage
fi

rm -rf /var/www/storage-init

# Só roda migrations/config/cache se for o container principal
if [ "$1" = "php-fpm" ]; then
  echo "Running migrations and caching..."
  php artisan migrate --force
  php artisan config:cache
  php artisan route:cache
fi

# Importante: mantém o processo do PHP-FPM no foreground
exec "$@"
