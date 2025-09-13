# Stage 1: Build assets
FROM debian AS builder

ARG PUSHER_APP_KEY
ARG PUSHER_APP_CLUSTER
ENV VITE_PUSHER_APP_KEY=$PUSHER_APP_KEY
ENV VITE_PUSHER_APP_CLUSTER=$PUSHER_APP_CLUSTER

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nodejs \
    npm \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/www
COPY . /var/www
RUN npm install && npm run build

# Stage 2: NGINX with HTTPS support
FROM nginx:alpine

ARG UNAME=www-data
ARG UGROUP=www-data
ARG UID=1000
ARG GID=1001

RUN delgroup www-data && \
    addgroup -g ${GID} ${UGROUP} && \
    adduser -u ${UID} -G ${UGROUP} -S -D ${UNAME}

# Copia certificado SSL e chave privada
#COPY ./docker/production/nginx/uesb2025fullchain.pem /etc/ssl/certs/uesb2025fullchain.pem
#COPY ./docker/production/nginx/uesb2025privkey.pem /etc/ssl/private/uesb2025privkey.pem

# Substitui a configuração padrão do NGINX com o nosso default.conf
COPY ./docker/production/nginx/app.conf /etc/nginx/conf.d/default.conf
COPY ./docker/production/nginx/nginx.conf /etc/nginx/nginx.conf

RUN touch /var/run/nginx.pid \
    && chown -Rf www-data:www-data \
    /var/run/nginx.pid \
    /var/cache/nginx \
    /var/log/nginx

# Copia os assets gerados no builder
COPY --from=builder /var/www/public /var/www/public

WORKDIR /var/www/public
USER www-data

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
