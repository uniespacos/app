# Stage 1: Build frontend assets
FROM node:20-alpine AS builder

# Set build arguments for Vite
ARG PUSHER_APP_KEY
ARG PUSHER_APP_CLUSTER
ENV VITE_PUSHER_APP_KEY=$PUSHER_APP_KEY
ENV VITE_PUSHER_APP_CLUSTER=$PUSHER_APP_CLUSTER

WORKDIR /var/www

# Copy only necessary files for npm install to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend-related source code
COPY vite.config.ts .
COPY tsconfig.json .

COPY tailwind.config.js .
COPY eslint.config.js .
COPY resources/ ./resources

# Build the frontend assets
RUN npm run build

# Stage 2: Production NGINX server
FROM nginx:alpine

# Copy the custom Nginx configuration files
COPY ./docker/production/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/production/nginx/default.ssl.conf /etc/nginx/conf.d/default.ssl.conf

# Copy the built assets from the builder stage
COPY --from=builder /var/www/public /var/www/public

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
