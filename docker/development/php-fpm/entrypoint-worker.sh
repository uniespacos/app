#!/bin/sh
set -e

# Check if $UID and $GID are set, else fallback to default (1000:1000)
USER_ID=${UID:-1000}
GROUP_ID=${GID:-1000}

# Fix file ownership and permissions - SKIP for performance in dev
# chown -R on bind mounts is extremely slow. 
# echo "Fixing file permissions with UID=${USER_ID} and GID=${GROUP_ID}..."
# chown -R ${USER_ID}:${GROUP_ID} /var/www || echo "Some files could not be changed"

# Clear configurations to avoid caching issues in development
echo "Clearing configurations..."

cd /var/www || exit 1

# Run the default command (e.g., php-fpm or bash)
exec "$@"
