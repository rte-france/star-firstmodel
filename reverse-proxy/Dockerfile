# Copyright (C) 2020, RTE (http://www.rte-france.com)
# SPDX-License-Identifier: Apache-2.0

FROM cicnl/nginx:1.13.10-alpine

RUN apk add --update libintl && \
    apk add --virtual build_deps gettext &&  \
    cp /usr/bin/envsubst /usr/local/bin/envsubst && \
    apk del build_deps

ENTRYPOINT /bin/sh -c \
           "envsubst '\$CLIENT_NAME \$SERVER_NAME \$SERVER_PORT' < \
           /etc/nginx/nginx.template > /etc/nginx/nginx.conf && \
           exec nginx -g 'daemon off;'"

COPY nginx.template /etc/nginx/nginx.conf

EXPOSE 5000:5000
