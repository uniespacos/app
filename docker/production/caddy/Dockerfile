FROM caddy:alpine

# Set the working directory
WORKDIR /var/www

# Copy the built public assets from the CI/CD build stage
# We copy the entire public directory to ensure index.php and build/ are present
COPY public /var/www/public
