#!/bin/sh
set -e

# Function to check if the database is ready
is_db_ready() {
    # Using db:test as it's more direct for connection readiness
    php artisan db:test || false
}

# Wait for the database
echo "Waiting for database to be ready..."
while ! is_db_ready; do
  sleep 2
done
echo "Database is ready."

# Initialize storage directory if empty
# ----------------------------------------------------------
# If the storage directory is empty, copy the initial contents
# and set the correct permissions.
# ----------------------------------------------------------
if [ ! "$(ls -A /var/www/storage)" ]; then
  echo "Initializing storage directory from storage-init..."
  cp -R /var/www/storage-init/. /var/www/storage || { echo "Error: Failed to copy storage-init."; exit 1; }
  echo "Setting permissions for /var/www/storage..."
  chown -R www-data:www-data /var/www/storage || { echo "Error: Failed to chown /var/www/storage."; exit 1; }
  echo "Storage directory initialized and permissions set."
fi

# Remove storage-init directory (cleanup)
echo "Removing /var/www/storage-init directory..."
rm -rf /var/www/storage-init || { echo "Warning: Failed to remove storage-init directory."; }

# Run the default command (php-fpm)
echo "Starting PHP-FPM..."
exec "$@"
