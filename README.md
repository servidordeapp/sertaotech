# sertaotech

Monorepo do evento Sertão Tech. Cada aplicação é uma pasta própria, com README
próprio; esta página é só o índice.

## Mapa do repositório

| Pasta | O que é |
|---|---|
| `docs/` | Documentação de negócio e de engenharia. Fora do deploy. |
| `site/` | Site público em Astro (saída estática). É o que está no ar. Ver [`site/README.md`](site/README.md). |
| `api/` | Serviço de backend em Laravel. Ver [`api/README.md`](api/README.md). |
| `painel/` | Painel interno (SPA Vue) em `painel.osertaotech.com.br`. Ver [`painel/README.md`](painel/README.md). |
| `docker/` | Scripts de init dos containers do `docker-compose.yml`. |
| `originais/` | Fotos e artes em alta resolução. Locais, fora do git. |

A raiz não serve mais HTML: desde 2026-11-04 o site inteiro mora em `site/`
(páginas Astro em `site/src/pages/`, decks e documentos internos em
`site/public/`), e o Root Directory do projeto na Vercel é `site/`. Os geradores
de arte e do design system são `site/scripts/`, rodados por `npm run ds`,
`npm run og` e `npm run midia-kit`.

## Como subir

O único pré-requisito na máquina é o Docker. Nada de Node, npm, PHP, composer
ou Python instalados no host.

```bash
docker compose up -d            # sobe site + painel + api + banco
docker compose logs -f          # acompanha tudo (ou `logs -f site`, `logs -f api`)
docker compose down             # derruba
```

| Serviço | URL | O que é |
|---|---|---|
| `site` | <http://localhost:4321> | Dev server do Astro, com hot reload |
| `api` | <http://localhost:8000> | Laravel. A lista de espera e as rotas `/api/painel/*` |
| `painel` | <http://localhost:5173> | Painel interno (Vue + Vite), com hot reload |
| `mysql` | — | Banco da api, sem porta no host. Acesso por `docker compose exec` |

A api sobe sozinha: no primeiro boot ela cria o `api/.env` a partir do
`.env.example` (com `key:generate`) e roda `php artisan migrate`. O site recebe
`PUBLIC_API_URL=http://localhost:8000` pelo compose — sem isso o formulário da
lista de espera cairia no fallback do código e escreveria **em produção**.

Editar um arquivo em `site/` recarrega o navegador: o código entra por bind
mount e o `node_modules` fica num volume do container, então **depois de mexer
no `package.json` reconstrua**:

```bash
docker compose up -d --build site
```

O mesmo vale para a api: o `vendor/` fica num volume do container, então
**depois de mexer no `composer.json` reconstrua** com
`docker compose up -d --build api`.

Comando pontual dentro do container (sem instalar nada no host):

```bash
docker compose exec site npm run verify        # build + as 7 verificações
docker compose exec site npm run check         # astro check
docker compose exec site npm run og caravanas  # regera uma arte de OG (sharp)
docker compose exec site npm run ds            # regera o design system

docker compose exec api composer quality       # pint + phpstan + testes
docker compose exec api php artisan migrate    # migrações
docker compose exec api php artisan tinker     # console
```

Dois detalhes medidos em 2026-11-03, não adivinhados:

- **A imagem é `node:24-bookworm-slim`, não Alpine.** O `package-lock.json` foi
  gerado em glibc e só traz os binários `@img/sharp-linux-*`; num Alpine o
  `sharp` quebraria por falta do `linuxmusl`. Conferido dentro do container:
  `sharp` 0.35.5 com libvips 8.18.7, e `npm run og` gerou a arte real.
- **O watcher roda sem polling.** O container enxergou as edições do host como
  o próprio host (repositório no ext4 do WSL). Se um dia o navegador parar de
  recarregar sozinho, há um knob comentado no `docker-compose.yml`
  (`VITE_POLLING=1`).

A api usa o `api/Dockerfile` (PHP 8.5 + composer dentro da imagem), e não a
imagem do Laravel Sail: a de Sail é construída a partir de
`api/vendor/laravel/sail/runtimes/`, que só existe depois de um `composer
install` no host. O `api/compose.yaml` continua no repositório para quem usa o
comando `sail`, mas não é incluído aqui — num clone novo ele derrubaria o
`docker compose up` do site também.

## Documentação

| Documento | Assunto |
|---|---|
| [`docs/MIGRACAO-ASTRO.md`](docs/MIGRACAO-ASTRO.md) | Decisões, diagnóstico e riscos da migração para Astro |
| [`docs/CHECKLIST-MIGRACAO-ASTRO.md`](docs/CHECKLIST-MIGRACAO-ASTRO.md) | Execução da migração, em ordem de dependência |
| [`docs/PLANO-2027.md`](docs/PLANO-2027.md) | Plano da edição 2027 |
| [`docs/ESTRATEGIA-PATROCINIO-2027.md`](docs/ESTRATEGIA-PATROCINIO-2027.md) | Estratégia de patrocínio |
| [`docs/ROTEIRO-NEGOCIOS-2027.md`](docs/ROTEIRO-NEGOCIOS-2027.md) | Trilha de negócios |
| [`docs/MIDIA-KIT-CARAVANAS-2027.md`](docs/MIDIA-KIT-CARAVANAS-2027.md) | Kit de caravanas |
| [`docs/RELATORIO-PATROCINADORES-2026.md`](docs/RELATORIO-PATROCINADORES-2026.md) | Relatório para patrocinadores de 2026 |
| [`docs/MELHORIAS-FUTURAS.md`](docs/MELHORIAS-FUTURAS.md) | Lacunas conhecidas, para depois |

`docs/` e `api/` estão no `.vercelignore` — não são site. O relatório dos
patrocinadores está em `site/public/relatorio/2026`: vai ao ar para ser mandado
por link, mas é `noindex` e não tem link em página pública.

## Edição nova

O que uma edição nova (2028) exige hoje:

1. A home vira a edição nova e a anterior é congelada em `/<ano>` com a faixa
   `<EditionBanner>` no topo (ver `site/src/pages/2026/`).
2. Deck do kit: `cp -r site/public/midia-kit/2027 site/public/midia-kit/2028`,
   editar o conteúdo das `<section>` e apontar o redirect de `/midia-kit` no
   `site/vercel.json`.
3. Dados da edição em `site/src/data/`, JSON-LD em `site/src/lib/schema.ts`.

O detalhe de cada passo está em [`site/README.md`](site/README.md).
