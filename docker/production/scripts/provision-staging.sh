#!/bin/bash
# Idempotently provisions a staging-only Caddy folder so compose.prod.yml's
# PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER can be satisfied without needing the
# real production certs.

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <staging-path>"
    exit 1
fi

STAGING_PATH="$1"
CADDY_DIR="$STAGING_PATH/docker/production/caddy"

mkdir -p "$CADDY_DIR/certs"
touch "$CADDY_DIR/certs/uesb2025fullchain.pem" "$CADDY_DIR/certs/uesb2025privkey.pem"

cd "$STAGING_PATH"
touch .env
if grep -q '^PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER=' .env; then
    sed -i "s#^PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER=.*#PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER=$CADDY_DIR#" .env
else
    echo "PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER=$CADDY_DIR" >> .env
fi
