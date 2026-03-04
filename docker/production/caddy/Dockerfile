FROM caddy:alpine

# Set the working directory
WORKDIR /var/www

# Copy the built public assets from the CI/CD build stage
# Note: In GitHub Actions, the 'public' folder is populated by 'npm run build' 
# before this Docker image is built.
COPY ./public /var/www/public
