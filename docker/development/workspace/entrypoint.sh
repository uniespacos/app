#!/bin/bash
set -e

# Check if $UID and $GID are set, else fallback to default (1000:1000)
USER_ID=${UID:-1000}
GROUP_ID=${GID:-1000}

# Fix file ownership and permissions using the passed UID and GID
echo "Fixing file permissions with UID=${USER_ID} and GID=${GROUP_ID}..."
chown -R ${USER_ID}:${GROUP_ID} /var/www || echo "Some files could not be changed"

# Install NVM and Node.js
export NVM_DIR="/home/www/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  mkdir -p "$NVM_DIR"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  source "$NVM_DIR/nvm.sh"
  nvm install 22.0.0
fi

export PATH="$NVM_DIR/versions/node/v22.0.0/bin:$PATH"

# Execute the original command
exec "$@"

