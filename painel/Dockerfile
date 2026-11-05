# syntax=docker/dockerfile:1

# Mesma imagem do site (node:24-bookworm-slim, glibc) para o monorepo não ter
# duas bases de Node diferentes.
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# --------------------------------------------------------------------------
# deps — dependências a partir do lockfile, em camada própria.
# --------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------------------------------
# dev — servidor do Vite com hot reload. O código chega por bind mount do
# compose; a imagem carrega só o node_modules.
# --------------------------------------------------------------------------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
# Roda como `node` (uid 1000) pelo mesmo motivo do site: /app é bind mount, e
# arquivo escrito como root aqui quebra o build no host com EACCES.
USER node
EXPOSE 5173
CMD ["npm", "run", "dev"]
