# syntax=docker/dockerfile:1
# Контекст сборки — корень проекта (см. docker-compose.yml)
FROM node:20-slim

# Prisma требует OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=2000 --fetch-timeout=60000

COPY backend/ ./
RUN npx prisma generate

EXPOSE 5000
CMD ["node", "src/server.js"]
