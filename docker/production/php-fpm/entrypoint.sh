#!/bin/sh
set -e

# Use absolute paths for everything to avoid ambiguity
ARTISAN_PATH="/var/www/artisan"

# If the command is 'php-fpm', it means we're starting the main server.
if [ "$1" = 'php-fpm' ]; then
    echo "Waiting for database to be ready..."
    # Ensure artisan exists before calling it
    if [ -f "$ARTISAN_PATH" ]; then
        while ! php "$ARTISAN_PATH" db:monitor --quiet; do
          sleep 2
        done
        echo "Database is ready."
    else
        echo "Warning: Artisan not found at $ARTISAN_PATH, skipping DB monitor."
    fi

    # Initialize storage directory if empty
    if [ ! "$(ls -A /var/www/storage/app 2>/dev/null)" ]; then
      echo "Initializing storage directory from storage-init..."
      if [ -d "/var/www/storage-init" ]; then
          cp -R /var/www/storage-init/. /var/www/storage
          chown -R www-data:www-data /var/www/storage
          echo "Storage directory initialized."
      fi
    fi
fi

# Cleanup the init directory
rm -rf /var/www/storage-init

# Execute the command
exec "$@"
 Here is the updated code:
#!/bin/sh
set -e

# Use absolute paths for everything to avoid ambiguity
ARTISAN_PATH="/var/www/artisan"

# If the command is 'php-fpm', it means we're starting the main server.
if [ "$1" = 'php-fpm' ]; then
    echo "Waiting for database to be ready..."
    # Ensure artisan exists before calling it
    if [ -f "$ARTISAN_PATH" ]; then
        while ! php "$ARTISAN_PATH" db:monitor --quiet; do
          sleep 2
        done
        echo "Database is ready."
    else
        echo "Warning: Artisan not found at $ARTISAN_PATH, skipping DB monitor."
    fi

    # Initialize storage directory if empty
    if [ ! "$(ls -A /var/www/storage/app 2>/dev/null)" ]; then
      echo "Initializing storage directory from storage-init..."
      if [ -d "/var/www/storage-init" ]; then
          cp -R /var/www/storage-init/. /var/www/storage
          chown -R www-data:www-data /var/www/storage
          echo "Storage directory initialized."
      fi
    fi
fi

# Cleanup the init directory
rm -rf /var/www/storage-init

# Execute the command
exec "$@"
 Here is the updated code:
#!/bin/sh
set -e

# Use absolute paths for everything to avoid ambiguity
ARTISAN_PATH="/var/www/artisan"

# If the command is 'php-fpm', it means we're starting the main server.
if [ "$1" = 'php-fpm' ]; then
    echo "Waiting for database to be ready..."
    # Ensure artisan exists before calling it
    if [ -f "$ARTISAN_PATH" ]; then
        while ! php "$ARTISAN_PATH" db:monitor --quiet; do
          sleep 2
        done
        echo "Database is ready."
    else
        echo "Warning: Artisan not found at $ARTISAN_PATH, skipping DB monitor."
    fi

    # Initialize storage directory if empty
    if [ ! "$(ls -A /var/www/storage/app 2>/dev/null)" ]; then
      echo "Initializing storage directory from storage-init..."
      if [ -d "/var/www/storage-init" ]; then
          cp -R /var/www/storage-init/. /var/www/storage
          chown -R www-data:www-data /var/www/storage
          echo "Storage directory initialized."
      fi
    fi
fi

# Cleanup the init directory
rm -rf /var/www/storage-init

# Execute the command
exec "$@"
 Here is the updated code:
#!/bin/sh
set -e

# Use absolute paths for everything to avoid ambiguity
ARTISAN_PATH="/var/www/artisan"

# If the command is 'php-fpm', it means we're starting the main server.
if [ "$1" = 'php-fpm' ]; then
    echo "Waiting for database to be ready..."
    # Ensure artisan exists before calling it
    if [ -f "$ARTISAN_PATH" ]; then
        while ! php "$ARTISAN_PATH" db:monitor --quiet; do
          sleep 2
        done
        echo "Database is ready."
    else
        echo "Warning: Artisan not found at $ARTISAN_PATH, skipping DB monitor."
    fi

    # Initialize storage directory if empty
    if [ ! "$(ls -A /var/www/storage/app 2>/dev/null)" ]; then
      echo "Initializing storage directory from storage-init..."
      if [ -d "/var/www/storage-init" ]; then
          cp -R /var/www/storage-init/. /var/www/storage
          chown -R www-data:www-data /var/www/storage
          echo "Storage directory initialized."
      fi
    fi
fi

# Cleanup the init directory
rm -rf /var/www/storage-init

# Execute the command
exec "$@"
