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
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4321"]

# --------------------------------------------------------------------------
# build — gera o site estático em /app/dist.
# --------------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --------------------------------------------------------------------------
# prod — nginx servindo o dist/, reproduzindo o que a Vercel faz em produção.
# --------------------------------------------------------------------------
FROM nginx:1.27-alpine AS prod
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Mesmo contrato do runtime de container da Vercel: o servidor escuta em $PORT.
# O FILTER limita o envsubst a essa variável — sem ele o $uri do nginx.conf
# seria substituído por vazio.
ENV PORT=80
ENV NGINX_ENVSUBST_FILTER=PORT
EXPOSE 80
