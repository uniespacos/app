#!/bin/sh
set -e

# If the command is 'php-fpm', it means we're starting the main server.
# In this case, wait for the database to be ready before proceeding.
if [ "$1" = 'php-fpm' ]; then
    echo "Waiting for database to be ready..."
    # Use a loop to wait for the db:monitor command to succeed.
    # The command will fail with a non-zero exit code if it can't connect.
    while ! php artisan db:monitor --quiet; do
      sleep 2
    done
    echo "Database is ready."

    # Initialize storage directory if empty
    if [ ! "$(ls -A /var/www/storage/app)" ]; then
      echo "Initializing storage directory from storage-init..."
      cp -R /var/www/storage-init/. /var/www/storage
      chown -R www-data:www-data /var/www/storage
      echo "Storage directory initialized."
    fi
fi

# Cleanup the init directory regardless, as it's not needed after startup
rm -rf /var/www/storage-init

# Execute the command passed to the container (e.g., "php-fpm" or "php artisan migrate")
exec "$@"
