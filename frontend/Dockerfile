# Build de produção do frontend (Vite) servido pelo Caddy
# Estágio 1: build dos arquivos estáticos
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL é injetado no build (variável de build-time do Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Estágio 2: imagem final só com os estáticos, servidos pelo Caddy
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
