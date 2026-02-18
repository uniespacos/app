# Production NGINX server
FROM nginx:alpine

# Copy the custom Nginx configuration files
COPY ./docker/production/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/production/nginx/default.ssl.conf /etc/nginx/conf.d/default.ssl.conf

# Copy the application's entrypoint
COPY public/index.php /var/www/public/index.php

# Copy the built assets directly from the build context (assumes npm run build ran before docker build)
COPY public/build /var/www/public/build

# Set the working directory
WORKDIR /var/www/public

# Ensure the nginx user owns the web root files
RUN chown -R nginx:nginx /var/www/public

# Create the storage symlink so Nginx can serve user uploads
# We create the parent directory structure to ensure the link can be created
RUN mkdir -p /var/www/storage/app/public && \
    ln -s /var/www/storage/app/public /var/www/public/storage

# Expose HTTP and HTTPS ports
EXPOSE 80
EXPOSE 443

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
