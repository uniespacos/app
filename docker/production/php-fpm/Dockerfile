# Stage 1: Build environment and Composer dependencies
FROM php:8.4-fpm AS builder

# Install system dependencies and PHP extensions required for Laravel
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    libpq-dev \
    libonig-dev \
    libssl-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    opcache \
    intl \
    zip \
    bcmath \
    soap \
    pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/www

# Copy composer.json and composer.lock first
COPY composer.json composer.lock ./

# Install Composer and dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist --no-scripts

# Copy the rest of the application code
COPY . /var/www

# Generate autoloader
RUN composer dump-autoload --optimize


# Stage 2: Production environment
FROM php:8.4-fpm as production

# Install only runtime libraries needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    libfcgi-bin \
    procps \
    && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Overwrite default config
RUN printf "[global]\ndaemonize = no\n\n[www]\nlisten = 9000\n" > /usr/local/etc/php-fpm.d/zz-docker.conf

# Install health check script
RUN curl -o /usr/local/bin/php-fpm-healthcheck \
    https://raw.githubusercontent.com/renatomefi/php-fpm-healthcheck/master/php-fpm-healthcheck \
    && chmod +x /usr/local/bin/php-fpm-healthcheck

# Entrypoint
COPY ./docker/production/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Initial storage structure
COPY ./storage /var/www/storage-init

# Copy PHP extensions from builder
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=builder /usr/local/bin/docker-php-ext-* /usr/local/bin/

# Use production PHP configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copy the application code from builder
COPY --from=builder /var/www /var/www

# IMPORTANT: Copy the public directory EXPLICITLY from the context
# This ensures that even if it was ignored in the builder stage, it's included here.
COPY public /var/www/public

# Ensure correct permissions
RUN chown -R www-data:www-data /var/www

USER www-data

WORKDIR /var/www

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 9000
CMD ["php-fpm"]
