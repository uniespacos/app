#!/bin/sh
set -e

# Diagnostic: Print current state if it's failing
if [ ! -f "/var/www/artisan" ]; then
    echo "ERROR: artisan file not found in /var/www"
    echo "Current directory: $(pwd)"
    echo "Contents of /var/www:"
    ls -la /var/www
fi

# If the command is 'php-fpm', it means we're starting the main server.
if [ "$1" = 'php-fpm' ]; then
    echo "Waiting for database to be ready..."
    # Try to use absolute path to artisan for the check
    while ! php /var/www/artisan db:monitor --quiet; do
      sleep 2
    done
    echo "Database is ready."

    # Initialize storage directory if empty
    if [ ! "$(ls -A /var/www/storage/app 2>/dev/null)" ]; then
      echo "Initializing storage directory from storage-init..."
      if [ -d "/var/www/storage-init" ]; then
          cp -R /var/www/storage-init/. /var/www/storage
          chown -R www-data:www-data /var/www/storage
          echo "Storage directory initialized."
      else
          echo "Warning: storage-init directory not found."
      fi
    fi
fi

# Cleanup the init directory regardless
rm -rf /var/www/storage-init

# Execute the command
exec "$@"
