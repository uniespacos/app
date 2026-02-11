#!/bin/sh
set -e

# Function to check if the database is ready
is_db_ready() {
    php artisan db:monitor --quiet
}

# Wait for the database
echo "Waiting for database to be ready..."
while ! is_db_ready; do
  sleep 2
done
echo "Database is ready."

# Initialize storage directory if empty
# -----------------------------------------------------------
# If the storage directory is empty, copy the initial contents
# and set the correct permissions.
# -----------------------------------------------------------
if [ ! "$(ls -A /var/www/storage)" ]; then
  echo "Initializing storage directory..."
  cp -R /var/www/storage-init/. /var/www/storage
  chown -R www-data:www-data /var/www/storage
fi

# Remove storage-init directory
rm -rf /var/www/storage-init

# Run the default command
exec "$@"
