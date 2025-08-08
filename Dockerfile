FROM nginx:alpine

# Install dependencies and build fancyindex module
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    libc-dev \
    make \
    openssl-dev \
    pcre-dev \
    zlib-dev \
    linux-headers \
    curl \
    gnupg \
    libxslt-dev \
    gd-dev \
    geoip-dev \
    git

# Get nginx version
RUN NGINX_VERSION=$(nginx -v 2>&1 | grep -o '[0-9.]*') && \
    echo "Building for nginx version: $NGINX_VERSION"

# Download and build fancyindex module
WORKDIR /tmp
RUN git clone https://github.com/aperezdc/ngx-fancyindex.git
RUN curl -fSL https://nginx.org/download/nginx-$(nginx -v 2>&1 | grep -o '[0-9.]*').tar.gz -o nginx.tar.gz && \
    tar -xzf nginx.tar.gz && \
    cd nginx-$(nginx -v 2>&1 | grep -o '[0-9.]*') && \
    ./configure --with-compat --add-dynamic-module=/tmp/ngx-fancyindex && \
    make modules && \
    cp objs/ngx_http_fancyindex_module.so /etc/nginx/modules/

# Clean up build dependencies
RUN apk del .build-deps && \
    rm -rf /tmp/*

# Copy nginx configuration
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

# Add module loading to nginx.conf
RUN sed -i '1i load_module modules/ngx_http_fancyindex_module.so;' /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 