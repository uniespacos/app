#!/bin/bash
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

