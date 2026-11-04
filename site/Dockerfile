# syntax=docker/dockerfile:1

# Imagem glibc (bookworm) e não alpine: o package-lock.json foi gerado em
# glibc, então só traz os binários opcionais @img/sharp-linux-*. Num alpine o
# `npm ci` não instalaria o @img/sharp-linuxmusl-x64 e o sharp quebraria nos
# scripts de geração de arte.
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# --------------------------------------------------------------------------
# deps — dependências instaladas a partir do lockfile, numa camada própria
# para não reinstalar tudo a cada alteração de código.
# --------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------------------------------
# dev — servidor de desenvolvimento do Astro, com hot reload.
# O código chega por bind mount declarado no compose; o que a imagem carrega
# é só o node_modules, que o compose preserva num volume nomeado.
# --------------------------------------------------------------------------
FROM base AS dev
ENV NODE_ENV=development
# python3 é o que roda 4 das 7 verificações do scripts/verify-build.sh (JSON-LD,
# canonical, links externos e internos). Sem ele o `npm run verify` dentro do
# container falha com "python3: command not found", e a verificação passaria a
# exigir Python instalado no host — justo o que o docker-first evita.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 \
 && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4321"]
