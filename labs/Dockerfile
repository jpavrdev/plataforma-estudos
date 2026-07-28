# node-pty é módulo nativo, então precisa de compilador na hora de instalar.
FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:22-alpine
RUN apk add --no-cache docker-cli
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.mjs ./
EXPOSE 8090
CMD ["node", "server.mjs"]
