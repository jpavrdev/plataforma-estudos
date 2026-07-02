FROM node:22-alpine
# node:22-alpine já traz o usuário não-root "node" (uid 1000).
WORKDIR /app
COPY harness.mjs .
USER node
ENTRYPOINT ["node", "/app/harness.mjs"]
