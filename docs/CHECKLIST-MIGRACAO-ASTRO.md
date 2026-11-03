# Checklist de execução — migração para Astro

Decisões, diagnóstico e riscos em [`MIGRACAO-ASTRO.md`](MIGRACAO-ASTRO.md).
Este arquivo é só a execução, em ordem de dependência. Marque conforme avança e
versione junto.

Regra: **nenhuma fase começa antes da anterior fechar.** A Fase 0 em especial é
bug em produção e não espera migração.

---

## Fase 0 — Corrigir produção (não depende da migração)

- [ ] Rodar `scripts/listas-de-espera.gs` no Google Apps Script (ou recuperar as
      URLs dos 3 forms já criados) e anotar os 3 `viewform`.
- [ ] Trocar os 11 marcadores em `index.html`:
      ```bash
      sed -i 's|href="FORM_PARTICIPANTE"|href="<url-participante>"|g; \
              s|href="FORM_PALESTRANTE"|href="<url-palestrante>"|g; \
              s|href="FORM_PATROCINADOR"|href="<url-patrocinador>"|g' index.html
      ```
- [ ] Verificar que não sobrou nenhum: `grep -c 'href="FORM_' index.html` → `0`
- [ ] Atualizar o comentário de marcadores em `index.html:93-98` (não faz mais
      sentido depois da troca).
- [ ] Commit + deploy. Conferir os 11 botões na home em produção.
- [ ] Marcar a Fase 2 de `docs/PLANO-2027.md` como realmente concluída e
      registrar no Histórico dela.

---

## Fase 1 — Raiz do monorepo

- [x] Criar `docs/` e mover os planos de negócio para lá
      (`PLANO-2027`, `ESTRATEGIA-PATROCINIO-2027`, `ROTEIRO-NEGOCIOS-2027`,
      `MIDIA-KIT-CARAVANAS-2027`, `RELATORIO-PATROCINADORES-2026`).
- [x] Atualizar `.vercelignore` para `/docs`.
- [x] Atualizar as 3 referências por nome nos comentários de HTML
      (`index.html`, `midia-kit/caravanas-2027/index.html`,
      `relatorio/2026/index.html`).
- [ ] Branch nova a partir de `main`:
      ```bash
      git switch main && git pull && git switch -c feat/monorepo-astro
      ```
- [ ] Reescrever `README.md` da raiz como índice do monorepo: o que é cada pasta,
      como subir (`docker compose up`), onde está a documentação. O detalhe de
      cada aplicação vai no README dela.
- [ ] `.gitignore` da raiz: `node_modules/`, `dist/`, `.astro/`, `.vercel/`,
      mantendo `/originais/`.

---

## Fase 2 — Esqueleto Astro em `site/`

- [ ] Trazer o esqueleto da branch antiga sem merge:
      ```bash
      git checkout origin/feat/blog -- site/
      ```
- [ ] Apagar o que é deploy em container (decisão 2 e 7 do documento):
      ```bash
      git rm -r site/Dockerfile.vercel site/docker/ site/.dockerignore
      ```
      (`site/Dockerfile` **fica** — vai ser reescrito como container de dev na Fase 3.)
- [ ] Conferir que o `vercel.json` da raiz **não** tem `services` nem
      `runtime: container`. Se o checkout trouxe isso, restaurar o da `main`:
      ```bash
      git checkout main -- vercel.json
      ```
- [ ] `site/package.json`:
      - [ ] remover a chave `allowScripts`
      - [ ] mover `sharp` de `dependencies` para `devDependencies`
      - [ ] adicionar `"engines": { "node": "24.x" }`
      - [ ] revisar os scripts (`dev`, `build`, `preview`, `check`, `verify`, `ds`, `og`)
- [ ] Apagar os 8 posts de blog de `site/src/content/blog/` e as artes
      `site/public/assets/og-blog*.jpg` **se** a decisão em aberto for "portar sem
      publicar". Se for publicar, mover para a Fase 6.
- [ ] Apagar `site/src/pages/edicoes/2025.astro`, `edicoes/index.astro`,
      `src/data/edicao-2025.ts` e `src/data/edicoes.ts` — são da era em que 2025
      era o arquivo. O arquivo agora é 2026.
- [ ] Conferir que `site/astro.config.mjs` mantém
      `trailingSlash: 'never'` + `build.format: 'directory'` e o comentário que
      explica o casamento com `cleanUrls`.
- [ ] `npm install` dentro de `site/` e commitar `package-lock.json`.
- [ ] `npm run build` passa.

---

## Fase 3 — Docker-first (desenvolvimento)

Objetivo: `docker compose up` na raiz, nada mais instalado na máquina além do
Docker.

- [ ] `site/Dockerfile`, alvo de desenvolvimento, base `node:24-alpine`:
      instala dependências e roda `astro dev --host 0.0.0.0`.
- [ ] `docker-compose.yml` na raiz, serviço `site`:
      - [ ] `build: ./site`
      - [ ] porta `4321:4321`
      - [ ] bind mount `./site:/app`
      - [ ] **volume anônimo em `/app/node_modules`** (sem isso o host sobrescreve
            o que foi instalado no container)
- [ ] Subir e abrir: `docker compose up` → `http://localhost:4321`
- [ ] Testar hot reload editando um `.astro`. **Se o navegador não atualizar**
      (WSL2 não propaga eventos de arquivo por bind mount), ligar polling no
      `server.watch` do Vite em `astro.config.mjs`.
- [ ] Testar `sharp` dentro do container:
      `docker compose run --rm site npm run og`.
      **Se falhar por binário musl**, trocar a base para `node:24-slim`.
- [ ] Documentar no `README.md` da raiz: subir, parar, rodar script pontual,
      e qual dos dois knobs acima foi necessário.
- [ ] Confirmar que nada no fluxo de desenvolvimento exige Node instalado no host.

---

## Fase 4 — Porte de conteúdo

Arquivo congelado primeiro: é porte 1:1 e serve de ensaio para a home.

### 4.1 — Layout e componentes compartilhados

- [ ] `BaseLayout.astro` recebendo o `<head>`, header, footer e o `<script>` do
      `navToggle` (hoje duplicado em 5 páginas).
- [ ] `PageHead.astro` com meta, canonical, OG e Twitter por props
      (hoje 69 a 498 linhas por página).
- [ ] GA4 `G-62RC94ZH1Z` em um lugar só, dentro do layout.
- [ ] Trio Google Fonts (preload + `media="print"` swap + `noscript`) no layout,
      preservando o comportamento não-bloqueante e o porquê em
      `ds/tokens/fonts.css`.
- [ ] `Icon.astro` consumindo o sprite. Substituir os 242 SVG inline
      (55 paths únicos) — migrar os ícones usados, não os 32 do sprite de uma vez.

### 4.2 — `/2026/*` (arquivo congelado, 3.253 linhas)

- [ ] `2026/index.html` (1.422 linhas) → página Astro. O `<head>` de 498 linhas
      passa a sair de `lib/schema.ts`.
- [ ] 16 linhas de agenda → collection ou `data/evento-2026.json` (parte já existe
      na branch).
- [ ] `2026/palestrantes/index.html` (971 linhas) → collection de 19 palestrantes
      + 1 template. Cada um com 4 tamanhos de WebP.
- [ ] `2026/patrocinio/index.html` (526 linhas) → página + dados de cotas.
- [ ] `2026/caravanas/index.html` (334 linhas) → página.
- [ ] Mural de patrocinadores como componente, **preservando a convenção de
      telemetria**: nome vem do `alt` da imagem, cota vem do `aria-labelledby` do
      tier. Patrocinador novo tem que continuar sendo medido sem tocar em JS.
- [ ] Telemetria de patrocinador (~60 linhas, hoje em 3 páginas) em um script só.

### 4.3 — `/` (home 2027, 500 linhas)

- [ ] Porte manual — é a página mais nova e não existe na branch.
- [ ] Conferir que as URLs dos forms da Fase 0 vieram junto, não os marcadores.
- [ ] Galeria de fotos de 2026 (12 momentos × 3 larguras) como dado, não markup.
- [ ] Evento `waitlist_click` lendo `data-waitlist`, igual hoje.

---

## Fase 5 — Passthrough em `site/public/`

Nada aqui é migrado. São arquivos que já funcionam e cujas URLs são apresentadas
ao vivo e mandadas por WhatsApp.

- [ ] 4 decks reveal.js para `site/public/`, byte a byte:
      `midia-kit/2026`, `midia-kit/2027`, `midia-kit/caravanas-2027`, `after/2026`.
- [ ] `relatorio/2026` conforme a decisão em aberto (fora do deploy ou protegido).
- [ ] 9 páginas internas `noindex`: `apresentacoes`, `impressos`, `links`,
      `cerimonial/*`, `mesa-redonda/*`. `cerimonial/build-html.py` continua como
      está.
- [ ] `llms.txt`, `robots.txt`, `assets/`, `midia-kit/icons.svg`,
      `midia-kit/midia-kit.css`, `midia-kit/midia-kit.js`.
- [ ] Trocar os links relativos dos hubs (`../midia-kit/2026/index.html`) por
      caminho absoluto sem `.html`, para não pagar redirect extra com `cleanUrls`.
- [ ] Verificar as URLs sensíveis uma a uma, sem barra no fim e com a query:
      - [ ] `/midia-kit/2027` e `/midia-kit/2027?print-pdf`
      - [ ] `/midia-kit/caravanas-2027` e `?print-pdf`
      - [ ] `/midia-kit/2026`
      - [ ] `/after/2026`
      - [ ] `/relatorio/2026`
- [ ] Decidir o rename manual de `midia-kit.css` / `.js` (arquivo em `public/`
      não é hasheado pelo Astro) ou mover os dois para `src/`.

---

## Fase 6 — SEO e analytics

- [ ] JSON-LD saindo de `lib/schema.ts` em todas as páginas públicas:
      `Organization`, `Event` 2027 e `Event` 2026.
- [ ] `sitemap.xml` à mão **apagado**. `@astrojs/sitemap` assume.
- [ ] `filter` do sitemap excluindo **todas** as `noindex`: `/links`,
      `/relatorio`, `/apresentacoes`, `/impressos`, `/cerimonial/*`,
      `/mesa-redonda/*`, `/after/*`.
- [ ] Conferir que o sitemap gerado tem as páginas que hoje faltam:
      `/2026/palestrantes`, `/2026/patrocinio`, `/2026/caravanas`,
      `/midia-kit/2027`, `/midia-kit/caravanas-2027`.
- [ ] `llms.txt` revisado contra o conteúdo final.
- [ ] Artes OG: `npm run og` dentro do container, conferindo que `sharp` e
      `opentype.js` rodam como devDependencies.

---

## Fase 7 — Vercel

- [ ] **Root Directory = `site/`** no dashboard do projeto. Não existe no
      `vercel.json`. É a falha clássica: build passa local e quebra no deploy.
- [ ] Confirmar o preset Astro detectado e `outputDirectory` = `dist`.
- [ ] Node 24 na configuração do projeto, casando com `engines.node`.
- [ ] `package-lock.json` commitado e em sincronia (`npm ci` tem que passar).
- [ ] `vercel.json` sem `buildCommand` de `cache-bust.sh` (já removido) e sem
      `services` / `runtime: container`.
- [ ] Manter os 4 `redirects`: `/palestrantes`, `/patrocinio`, `/caravanas`
      → `/2026/*`, e `/midia-kit` → `/midia-kit/2027`, todos `permanent: false`.
- [ ] Manter `cleanUrls: true` e `trailingSlash: false`.
- [ ] Headers: manter `/assets/(.*)` com `immutable` e **adicionar
      `/_astro/(.*)`** com `immutable` (caminho novo do Astro).
- [ ] Revisar a regra `/(ds|css)/(.*)` — se o Astro passar a hashear esses
      arquivos, ela fica obsoleta.
- [ ] `.vercelignore` revisado para os caminhos novos.
- [ ] `/relatorio`: aplicar a decisão (fora do deploy ou Deployment Protection).
- [ ] Deploy de preview antes de qualquer coisa em produção.

---

## Fase 8 — Cloudflare

- [ ] Confirmar que **não** existe regra "Cache Everything" para HTML. Se existir:
      ou remover, ou adicionar purge no deploy (o hash do Astro não cobre HTML).
- [ ] Conferir que `/_astro/*` chega com `immutable` passando pelo Cloudflare.
- [ ] Purge único no cutover, para limpar o CSS e JS de um ano de `max-age`
      servido sob os nomes antigos.

---

## Fase 9 — Verificação antes do cutover

- [ ] `npm run build` e `npm run check` passam.
- [ ] Diff de **texto renderizado** antes e depois, página por página. É o maior
      risco da migração: 6.817 linhas com texto comercial, números de patrocínio
      e bios revisadas. Revisão visual não pega troca silenciosa.
- [ ] Conferir os números de 2026 na home e no kit 2027 contra
      `docs/RELATORIO-PATROCINADORES-2026.md`: 233 inscritos, 176 check-ins,
      16 palestras e minicursos, 19 pessoas no palco, 4 caravanas,
      6 patrocinadores.
- [ ] Conferir a escada de cotas do kit 2027 contra
      `docs/ESTRATEGIA-PATROCINIO-2027.md`.
- [ ] Inventário de URLs: toda rota que existe hoje responde 200 no preview, sem
      barra no fim. Comparar com o `sitemap.xml` antigo mais os 9 `noindex` mais
      os 5 decks.
- [ ] GA4 no preview, com o DebugView aberto:
      - [ ] `waitlist_click` nos 3 tipos
      - [ ] `sponsor_impression` ao rolar até o mural
      - [ ] `sponsor_click` no logo de um patrocinador
- [ ] PageSpeed na home e em `/2026`, comparando com o número de hoje. O ganho do
      `@import` colapsado em um request não pode ter sido perdido.
- [ ] `?print-pdf` gerando 1920×1080 por slide nos 3 kits.
- [ ] Clone limpo: `git clone` + `docker compose up` sobe o site sem nenhum
      pré-requisito além do Docker.

---

## Fase 10 — Cutover e limpeza

- [ ] Merge de `feat/monorepo-astro` em `main`. Deploy de produção.
- [ ] Monitorar 404 no painel da Vercel por 48h — é onde URL perdida aparece.
- [ ] Apagar as branches mortas:
      ```bash
      git push origin --delete plano-2027 feat/blog feat/patrocinadores
      ```
      (`plano-2027` tem diff vazio contra `main`; `feat/blog` já foi aproveitada.)
- [ ] Apagar da raiz os arquivos que viraram `site/public/` ou `site/src/`.
- [ ] `scripts/` da raiz: ficou algo que não é do site? Se não, a pasta sai.
- [ ] Atualizar `docs/MIGRACAO-ASTRO.md`: resolver as Decisões em aberto e
      registrar no Histórico.
- [ ] Anotar em `README.md` o que uma edição nova (2028) exige agora: era
      `cp -r midia-kit/2027 midia-kit/2028`, agora depende de quanto virou
      collection.

---

## Fora deste checklist

Decidido não migrar, por não ter dívida e ser de uso único:

- os 4 decks reveal.js e o `relatorio/2026` — passthrough em `public/`
- as 9 páginas internas `noindex`
- `cerimonial/build-html.py`
- `scripts/listas-de-espera.gs` (Google Apps Script, roda fora do repositório)

Blog da `feat/blog`: decisão em aberto em `MIGRACAO-ASTRO.md`. Migrar a estrutura
e publicar são coisas separadas.

`api/`: entra no `docker-compose.yml` quando existir, não antes.
