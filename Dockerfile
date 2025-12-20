FROM node:22-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .
RUN npm run build

FROM ghcr.io/static-web-server/static-web-server:2 AS runner

ENV SERVER_COMPRESSION_LEVEL=fastest \
    SERVER_FALLBACK_PAGE=index.html \
    SERVER_HEALTH=true \
    SERVER_LOG_FORWARDED_FOR=true \
    SERVER_LOG_REMOTE_ADDRESS=true \
    SERVER_PORT=8080

COPY --from=builder /app/dist /public
