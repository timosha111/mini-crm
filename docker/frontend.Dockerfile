# syntax=docker/dockerfile:1
# Этап 1: сборка React-приложения
FROM node:20-slim AS build
WORKDIR /app
# Копируем ТОЛЬКО package.json (без package-lock.json, созданного на Windows):
# так npm сам выберет правильные нативные пакеты для Linux (rollup, esbuild)
COPY frontend/package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=2000 --fetch-timeout=60000
COPY frontend/ ./
# Адрес API "вшивается" в сборку. Браузер обращается к backend через проброшенный порт хоста.
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build

# Этап 2: раздача статики через nginx
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
