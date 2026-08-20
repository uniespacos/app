#!/bin/bash
# Idempotently provisions staging-only settings that compose.prod.yml
# supports via env vars, without needing the real production certs or
# port bindings:
#   - PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER: points at a staging-only Caddy
#     folder instead of the production certs directory.
#   - WEB_HTTP_PORT: staging's Cloudflare Tunnel forwards to
#     http://localhost:20211 on the host, so the web container's HTTP port
#     must be published there instead of the production default (80).

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <staging-path>"
    exit 1
fi

STAGING_PATH="$1"
CADDY_DIR="$STAGING_PATH/docker/production/caddy"
STAGING_WEB_HTTP_PORT="20211"

mkdir -p "$CADDY_DIR/certs"
touch "$CADDY_DIR/certs/uesb2025fullchain.pem" "$CADDY_DIR/certs/uesb2025privkey.pem"

cd "$STAGING_PATH"
touch .env

set_env_var() {
    local key="$1"
    local value="$2"
    if grep -q "^${key}=" .env; then
        sed -i "s#^${key}=.*#${key}=${value}#" .env
    else
        echo "${key}=${value}" >> .env
    fi
}

set_env_var "PATH_TO_PRODUCTION_ENVIRONMENT_FOLDER" "$CADDY_DIR"
set_env_var "WEB_HTTP_PORT" "$STAGING_WEB_HTTP_PORT"
