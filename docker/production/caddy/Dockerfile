ARG APP_IMAGE=ghcr.io/uniespacos/app/app:latest
FROM ${APP_IMAGE} AS app-source

FROM caddy:alpine

# Set the working directory
WORKDIR /var/www

# Copy the built public assets from the EXACTLY built app image
# This ensures 100% consistency between PHP and Caddy containers
COPY --from=app-source /var/www/public /var/www/public

EXPOSE 80
EXPOSE 443