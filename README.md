# sertaotech

Repositório das aplicações do Sertão Tech. Cada aplicação mora na própria
pasta e entra como um serviço no `docker-compose.yml` da raiz.

```
site/                site do evento (Astro) — ver site/README.md
vercel.json          os serviços da Vercel: uma app = um serviço
docker-compose.yml   a stack local: todas as aplicações de uma vez
```

Cada aplicação é um container, tanto no `docker compose` local quanto no
deploy. São dois arquivos por app, por exigência de cada plataforma:
`Dockerfile` (estágio `dev` com hot reload, usado pelo compose) e
`Dockerfile.vercel` (a imagem que vai pro ar).

## Subindo tudo

```bash
docker compose up -d       # site em http://localhost:4321
docker compose logs -f     # acompanha
docker compose down        # derruba
```

O serviço `site` roda o `astro dev` com hot reload sobre um bind mount de
`site/`, então editar um arquivo no host recarrega o navegador. O
`node_modules` fica num volume do container, não no host — **depois de mexer
no `site/package.json`, reconstrua**:

```bash
docker compose up -d --build --force-recreate site
```

Para conferir o build de produção servido como a Vercel serve (nginx com
`cleanUrls`, o rewrite do sitemap e os `Cache-Control` do `vercel.json`):

```bash
docker compose --profile prod up -d --build site-prod   # http://localhost:8080
```

As portas saem de `SITE_PORT` (4321) e `SITE_PROD_PORT` (8080), que podem ser
redefinidas num `.env` na raiz.

## Deploy

Um único projeto na Vercel serve todas as apps. O `vercel.json` da raiz declara
cada uma em `services` e roteia por caminho em `rewrites`:

```json
{
  "services": {
    "site": { "runtime": "container", "root": "site/", "entrypoint": "Dockerfile.vercel" }
  },
  "rewrites": [{ "source": "/(.*)", "destination": { "service": "site" } }]
}
```

`runtime: "container"` faz a Vercel buildar o `Dockerfile.vercel` e rodar a
imagem como Vercel Function. O container tem que escutar em `$PORT` — é a
Vercel que injeta o valor, por isso o nginx vem de um template com
`listen ${PORT}` e `NGINX_ENVSUBST_FILTER=PORT`.

Como o nginx do container já resolve `cleanUrls`, o rewrite do sitemap e os
`Cache-Control`, o roteamento de produção é o mesmo arquivo que o `docker
compose --profile prod` usa localmente. Para conferir um deploy antes de
mandar, suba o profile `prod` e teste em `localhost:8080`.

O **Root Directory** do projeto na Vercel tem que continuar na raiz do
repositório (`.`), que é onde mora o `vercel.json` com os `services`. Os
caminhos em `root` são relativos a ela.

## Adicionando uma aplicação nova

1. Crie a pasta dela na raiz, com `Dockerfile` (estágio `dev`) e
   `Dockerfile.vercel`.
2. Acrescente um serviço no `docker-compose.yml` apontando `build.context` pra
   essa pasta, numa porta livre.
3. Acrescente a app em `services` no `vercel.json` e uma regra em `rewrites`
   acima da regra `/(.*)` do site, que é o catch-all:

```json
"rewrites": [
  { "source": "/api/(.*)", "destination": { "service": "backend" } },
  { "source": "/(.*)",     "destination": { "service": "site" } }
]
```

A ordem importa: a Vercel usa a primeira regra que casar.
