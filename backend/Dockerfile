# Imagem de produção do backend (Node 22, sem watch)
FROM node:22-alpine

WORKDIR /app

# Instala as dependências (inclui drizzle-kit, usado para migrations em prod)
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

EXPOSE 3001

# Sobe o servidor lendo as variáveis do ambiente do container (não do .env)
CMD ["node", "index.ts"]
