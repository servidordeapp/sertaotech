# Checklist de execução — migração para Astro

Decisões, diagnóstico e riscos em [`MIGRACAO-ASTRO.md`](MIGRACAO-ASTRO.md).
Este arquivo é só a execução, em ordem de dependência. Marque conforme avança e
versione junto.

Regra: **nenhuma fase começa antes da anterior fechar.** A Fase 0 é bug em
produção e não espera migração — mas **não bloqueia** as fases seguintes: é um
`href` em 11 lugares, trocado em um `sed` quando o destino existir.

**Estado em 2026-11-04: migração concluída.** O Astro está em produção, a raiz
do repositório não serve mais HTML, e o que sobrou aberto está marcado fase por
fase: itens adiados de propósito (`Icon.astro`, palestrantes de 2026 como
collection) e a parte da Fase 9 em suspenso.

---

## Fase 0 — Corrigir produção (não depende da migração)

**Fechada em 2026-11-04.** O formulário próprio entrou no lugar dos 3 Google
Forms e os marcadores morreram com o `index.html` da raiz.

- [x] Decisão registrada na Fase 2 de `docs/PLANO-2027.md`, com o conteúdo dos
      3 forms preservado como especificação do formulário próprio.
- [x] Formulário próprio das 3 listas de espera: `/lista-de-espera/<tipo>` no
      site (`site/src/pages/lista-de-espera/[tipo].astro`) gravando pela
      `POST /api/lista-de-espera/{tipo}` do Laravel, com confirmação por e-mail
      para quem se inscreve e um aviso por admin, os dois na fila.
- [x] Os 11 marcadores `FORM_*`: a home Astro nasceu com
      `href="/lista-de-espera/<tipo>"` e `data-waitlist`, e o `index.html` da
      raiz (o único arquivo que ainda tinha `FORM_`) saiu na limpeza da Fase 10.
      `grep -rc 'FORM_' .` → `0` fora do histórico do git.
- [x] Comentário de marcadores: saiu junto com o arquivo.
- [x] `scripts/listas-de-espera.gs` apagado (Google Forms fora; está no
      histórico do git).
- [x] Deploy em produção: os 3 botões levam ao formulário e o e-mail de
      confirmação chega (cron do `queue:work` na hospedagem, conferido à mão).
- [ ] Fechar a Fase 2 e o item 8 da Fase 3 de `docs/PLANO-2027.md`, e registrar
      no Histórico dela.

---

## Fase 1 — Raiz do monorepo

- [x] Criar `docs/` e mover os planos de negócio para lá
      (`PLANO-2027`, `ESTRATEGIA-PATROCINIO-2027`, `ROTEIRO-NEGOCIOS-2027`,
      `MIDIA-KIT-CARAVANAS-2027`, `RELATORIO-PATROCINADORES-2026`).
- [x] Atualizar `.vercelignore` para `/docs`.
- [x] Atualizar as 3 referências por nome nos comentários de HTML
      (`index.html`, `midia-kit/caravanas-2027/index.html`,
      `relatorio/2026/index.html`).
- [x] Branch nova: `feat/monorepo-astro`. Nasceu de `plano-2027` porque os 3
      itens acima desta fase (a pasta `docs/`, o `.vercelignore` e os
      comentários de HTML) só existiam lá. No mesmo dia a `plano-2027` entrou na
      `main` pelo PR #6, com a mesma árvore, e a branch foi rebaseada em
      `origin/main` — está onde o checklist mandava.
- [x] `README.md` da raiz reescrito como índice do monorepo: mapa das pastas,
      como subir (`docker compose up`, a partir da Fase 3) e índice de `docs/`.
      As duas seções de detalhe (build do design system e mídia kit) ficaram no
      fim do arquivo, marcadas para virar `site/README.md` na Fase 2 — sair
      delas agora perderia a instrução até a pasta existir.
- [x] `.gitignore` da raiz: `node_modules/`, `dist/`, `.astro/`, `.vercel/`,
      mantendo `/originais/`. `node_modules/` e `dist/` sem barra inicial, para
      pegar também `site/` e `api/`.

---

## Fase 2 — Esqueleto Astro em `site/`

- [x] Trazer o esqueleto da branch antiga sem merge:
      ```bash
      git checkout origin/feat/blog -- site/
      ```
      Veio de `648438f` ("wip feat blog"), 200 arquivos.
- [x] Apagar o que é deploy em container (decisão 2 e 7 do documento):
      `site/Dockerfile.vercel`, `site/docker/` e `site/.dockerignore`.
      Os estágios `build` e `prod` do `site/Dockerfile` saíram junto: o `prod`
      era o nginx e copiava o `docker/nginx.conf.template` que acabou de ser
      apagado — o arquivo não construiria. Sobraram `base`, `deps` e `dev`, que
      é o que a Fase 3 quer.
- [x] `vercel.json` da raiz conferido: sem `services`, sem `runtime: container`
      (o checkout não tocou nele). `site/vercel.json` **ficou** — é SSG
      (`framework: astro`, `outputDirectory: dist`) e é o arquivo que vale
      quando o Root Directory da Vercel virar `site/`.
- [x] `site/package.json`:
      - [x] chave `allowScripts` removida. O `npm install` passa a avisar que o
            `postinstall` do `esbuild` não rodou; `build`, `check` e `verify`
            passam mesmo assim.
      - [x] `sharp` movido para `devDependencies`
      - [x] `"engines": { "node": "24.x" }`
      - [x] scripts revisados: `dev`, `build`, `preview`, `check`, `verify`,
            `ds`, `og`. O `og:post` saiu com o blog.
      - [x] `npm audit fix` (só bumps compatíveis): de 9 vulnerabilidades
            (6 altas, em `vite` e `zod`) para 0.
- [x] **Decisão do blog: fora desta migração** (2026-11-03, registrada em
      `MIGRACAO-ASTRO.md`). Saíram os 8 posts, as 8 artes `og-blog-*.jpg`,
      `src/pages/blog/`, `content.config.ts`, `lib/blog.ts`, `ArticleLayout`,
      `Toc`, `PostCard`, `PostMeta`, `RelatedPosts`, `scripts/og-post.mjs`,
      `blog()`/`blogPosting()` do `schema.ts`, o `<link rel=alternate>` do feed
      e a dependência `@astrojs/rss`.
      - [x] 7 links para posts arrancados (6 em
            `eventos-de-tecnologia-parnaiba.astro`, 1 no `SiteFooter`), mais o
            item "Blog" do menu. O card "comunidades da região" virou dois
            parágrafos — o conteúdo era o nome das comunidades, não o link.
      - [x] O pipeline de markdown (`markdown:` do `astro.config.mjs`,
            `rehype-table-wrap.mjs` e as 4 dependências `rehype-*` /
            `@astrojs/markdown-remark`) saiu junto: sem `.md` no `src/`, era
            código morto. **Se voltar conteúdo em markdown** (o blog, ou o
            `cerimonial/` e o `mesa-redonda/` da raiz), restaurar de `648438f`.
      - [x] Bloco "regras editoriais dos posts" do `scripts/verify-build.sh`
            removido.
- [x] Apagados `site/src/pages/edicoes/2025.astro`, `edicoes/index.astro`,
      `src/data/edicao-2025.ts` e `src/data/edicoes.ts` — da era em que 2025 era
      o arquivo. Os 3 links para `/edicoes` (rodapé, `sobre`, página-âncora) e
      as 2 entradas de `/edicoes` no `serialize` do sitemap saíram com eles.
- [x] `site/astro.config.mjs` confere: `trailingSlash: 'never'` +
      `build.format: 'directory'`, com o comentário do casamento com `cleanUrls`
      intacto.
- [x] `npm install` dentro de `site/`, `package-lock.json` commitado.
- [x] `npm run build` passa: 6 páginas (`/`, `/palestrantes`, `/caravanas`,
      `/patrocinio`, `/sobre`, `/eventos-de-tecnologia-parnaiba`).
- [x] `npm run check`: 0 erros, 0 avisos (1 dica pré-existente no `BaseLayout`).
- [x] `npm run verify`: tudo verde — performance, analytics, JSON-LD (9 `@id`,
      20 referências, 0 órfãs), canonical, sitemap, links externos e internos.

Herança da `feat/blog` que ficou de fora do escopo desta fase:

- `site/docs/seo-local.md` (254 linhas) foi escrito com o blog no escopo. A
  parte de Search Console, Google Business Profile e citações locais continua
  válida; a de calendário editorial está em suspenso.
- `site/README.md` foi atualizado para o que existe (sem blog, sem estágio de
  produção em nginx, sem `/edicoes`).
- `/site` e `/api` entraram no `.vercelignore`. O deploy de hoje ainda tem a
  raiz como Root Directory e serve arquivo por arquivo, então sem isso o fonte
  do Astro e do Laravel subiria como arquivo estático. Revisar na Fase 10,
  quando o Root Directory virar `site/`.

---

## Fase 3 — Docker-first (desenvolvimento)

Objetivo: `docker compose up` na raiz, nada mais instalado na máquina além do
Docker.

- [x] `site/Dockerfile`, alvo `dev`: instala dependência do lockfile numa camada
      própria (`deps`) e roda `astro dev --host 0.0.0.0 --port 4321`.
      **Base `node:24-bookworm-slim`, não `node:24-alpine`** — o fallback que a
      decisão 5 do documento previa. Motivo, que já estava comentado no
      Dockerfile da `feat/blog` e foi confirmado aqui: o `package-lock.json` foi
      gerado em glibc e só traz os binários `@img/sharp-linux-*`; num Alpine o
      `npm ci` não instalaria o `@img/sharp-linuxmusl-x64`.
      - [x] `python3` instalado na imagem: 4 das 7 verificações do
            `scripts/verify-build.sh` são Python. Sem ele o `npm run verify`
            dentro do container morre em `python3: command not found` e a
            verificação passaria a exigir Python no host.
- [x] `docker-compose.yml` na raiz, serviço `site`:
      - [x] `build: { context: ./site, target: dev }`
      - [x] porta `4321:4321`
      - [x] bind mount `./site:/app`
      - [x] volume anônimo em `/app/node_modules`
- [x] `docker compose up -d` → `http://localhost:4321` responde `200` com
      `<title>Sertão Tech 2026 — …</title>`. O `dist/` que o build escreve no
      bind mount sai como o usuário do host (uid 1000 = `node` na imagem), não
      como root.
- [x] Hot reload testado editando `src/pages/index.astro`: o container viu a
      edição (conteúdo e `mtime` novos dentro de `/app`) e passou a servir o
      título novo sem restart.
      **Polling não foi necessário.** Nenhuma mensagem de HMR chegou no
      websocket `vite-hmr` na edição de um `.astro` — mas o `astro dev` rodando
      direto no host se comportou igual, então isso é comportamento do Astro 7
      para página, não bind mount engolindo inotify. O knob ficou no
      `astro.config.mjs` (`VITE_POLLING=1`), desligado, com a linha comentada no
      `docker-compose.yml` para ligar se algum dia o navegador parar de
      recarregar.
- [x] `sharp` dentro do container: `0.35.5`, libvips `8.18.7`, e
      `docker compose exec site npm run og -- caravanas` gerou
      `og-caravanas.jpg` 1200x630, 83 kB — byte a byte igual ao versionado.
      Não precisou trocar a base.
- [x] `README.md` da raiz documenta subir, parar, reconstruir depois de mexer no
      `package.json`, rodar comando pontual (`verify`, `check`, `og`, `ds`) e os
      dois pontos medidos (imagem glibc, watcher sem polling).
- [x] Nada no fluxo de desenvolvimento exige Node no host:
      `docker compose exec site npm run verify` passa inteiro dentro do
      container — build de 6 páginas e as 7 verificações verdes.
- [x] `api/` **fora** do compose da raiz (decisão em aberto do documento,
      resolvida): a stack dele é o Laravel Sail em `api/compose.yaml`, com
      `build.context: ./vendor/laravel/sail/runtimes/8.5`. Sem `composer
      install` não existe `api/vendor/`, e um `include:` faria o
      `docker compose up` do site falhar junto. Reavaliar quando o `api/` tiver
      vendor e rodar.

---

## Fase 4 — Porte de conteúdo

Método: as páginas **em produção** são a fonte da verdade, não as da
`feat/blog` (que pararam na véspera do evento). Cada página virou
`BaseLayout` + o `<main>` congelado, e o resultado foi conferido com um diff
normalizado contra o HTML de produção — as 5 páginas saem **idênticas**
(só `<path/>` vira `<path></path>` na serialização do Astro).

### 4.1 — Layout e componentes compartilhados

- [x] `BaseLayout.astro` com o `<head>`, header, footer e o `<script>` do
      `navToggle` (que estava duplicado em 5 páginas). Já vinha da `feat/blog`.
- [x] `PageHead.astro` com meta, canonical, OG e Twitter por props.
- [x] GA4 `G-62RC94ZH1Z` num lugar só, em `lib/site.ts`, usado pelo layout.
- [x] Trio Google Fonts (preload + `media="print"` swap + `noscript`) no layout.
      O `npm run verify` cobre isso: "3 tags por página".
- [x] Header e rodapé passaram a aceitar menu, CTA e colunas por prop/slot —
      o site tem duas edições no ar (a vigente na home e o arquivo em `/2026`),
      com menus diferentes. As listas ficam em `data/nav.ts` e as colunas de
      rodapé em `FooterCols2026` / `FooterCols2027`.
- [ ] `Icon.astro` consumindo o sprite, no lugar dos 242 SVG inline.
      **Não feito, de propósito:** o porte é 1:1 e trocar SVG inline por
      componente mudaria o HTML de produção no mesmo passo em que ele está
      sendo migrado — some o diff que prova que a migração não mexeu em nada.
      Fica para depois do cutover, com o diff normalizado como rede.

### 4.2 — `/2026/*` (arquivo congelado)

- [x] `2026/index.html` → `src/pages/2026/index.astro`. O `<head>` de 498 linhas
      saiu do `lib/schema.ts`.
- [x] Agenda: `data/evento-2026.json` regenerado do JSON-LD da página congelada
      (o da `feat/blog` ainda tinha a grade antiga — 16 subeventos com horário,
      ordem e palestrante diferentes, e `availability: InStock` em vez de
      `SoldOut`).
- [x] `2026/palestrantes/index.html` → página Astro, com os 2 modais no slot
      `after-footer` e o script da página (prazo da chamada + modal de perfil)
      no slot `scripts`, sem a parte do `navToggle`, que agora é do layout.
- [ ] 19 palestrantes como collection + 1 template. **Não feito:** é conteúdo
      congelado, que não vai ser editado nunca mais — a collection só pagaria
      custo. Se a 3ª edição precisar de página de palestrantes, ela nasce como
      collection, com esta página de molde.
- [x] `2026/patrocinio/index.html` → página Astro.
- [x] `2026/caravanas/index.html` → página Astro. O `data/caravanas-schema.json`
      também estava velho e foi regenerado do FAQ congelado; o CTA do menu não
      é mais o Sympla com UTM, é a lista de espera de 2027, como em produção.
- [x] Mural de patrocinadores como componente (`LogoWall.astro` +
      `data/patrocinadores-2026.ts`): eram 76 linhas repetidas em 3 páginas,
      com um comentário pedindo pra trocar logo em dois lugares. A convenção de
      telemetria foi preservada — nome do `alt` da imagem, cota do
      `aria-labelledby` do tier — e o `utm_content` por página virou prop
      (`home`, `patrocinio`, `home2027`).
- [x] Telemetria de patrocinador num script só (`SponsorTelemetry.astro`).
      O `sponsor_page` sai do caminho da URL, com os mesmos 3 valores de hoje.

### 4.3 — `/` (home 2027)

- [x] Porte manual de `index.html`. Saída idêntica à de produção.
- [x] Fase 0 ainda aberta, então os 3 marcadores `FORM_*` vieram junto **com o
      comentário que explica o porquê**, agora no topo do `<main>` da página e
      referenciado no `FooterCols2027`. A migração não inventou destino.
- [x] Galeria e fotos do After como dado (`data/fotos-2026.ts`): 11 `<img>` com
      `src`, `srcset` e `sizes` escritos à mão viraram 2 arrays e um `.map()`.
- [x] `waitlist_click` lendo `data-waitlist`, igual hoje.
- [x] Fotos, logos de apoio e `og-2027-data.jpg` copiados para
      `site/public/assets/` (30 arquivos que só existiam na raiz).

### Resultado da fase

- 7 páginas: `/`, `/2026`, `/2026/palestrantes`, `/2026/patrocinio`,
  `/2026/caravanas`, `/sobre`, `/eventos-de-tecnologia-parnaiba`.
- `npm run check`: 0 erro, 0 aviso. `npm run verify`: tudo verde, 11 `@id` e
  23 referências de JSON-LD sem órfã.
- `webpage()` passou a aceitar o `@id` do Event por parâmetro: a edição vigente
  é `/#event-2027` e o arquivo é `/2026#event`. Antes tudo apontava para
  `/#event`, que deixou de existir quando a home virou 2027.
- Redirects `/palestrantes`, `/patrocinio` e `/caravanas` → `/2026/*` entraram
  no `site/vercel.json`, iguais aos do `vercel.json` da raiz.
- As 2 páginas-âncora de SEO que vieram da `feat/blog` (`/sobre` e
  `/eventos-de-tecnologia-parnaiba`) **ainda falam de 2026 como evento futuro**.
  Os links quebrados foram corrigidos, mas o texto precisa de uma revisão na
  Fase 6.

---

## Fase 5 — Passthrough em `site/public/`

Nada aqui é migrado. São arquivos que já funcionam e cujas URLs são apresentadas
ao vivo e mandadas por WhatsApp.

- [x] 4 decks reveal.js para `site/public/`, byte a byte:
      `midia-kit/2026`, `midia-kit/2027`, `midia-kit/caravanas-2027`, `after/2026`.
- [x] `relatorio/2026` **dentro do deploy, fora do Google** (decisão de
      2026-11-04): está em `site/public/relatorio/2026`, com
      `noindex, nofollow` no HTML, `Disallow: /relatorio/` no `robots.txt`,
      fora do sitemap e sem link em página pública — só no hub interno
      `/apresentacoes`, que também é `noindex`. O link vai por WhatsApp a quem
      patrocinou. O `verify` deixou de ignorar `/relatorio` (o destino existe) e
      passou a tratar o deck como passthrough, igual aos outros.
- [x] 9 páginas internas `noindex`: `apresentacoes`, `impressos`, `links`,
      `cerimonial/*`, `mesa-redonda/*`. `cerimonial/build-html.py` continua como
      está.
- [x] `llms.txt`, `robots.txt`, `assets/`, `midia-kit/icons.svg`,
      `midia-kit/midia-kit.css`, `midia-kit/midia-kit.js`.
      `robots.txt`, `css/` e `assets/` já tinham versão própria em `site/public/`
      (sitemap-index, Disallow dos internos) e **não** foram sobrescritos.
- [x] Trocar os links relativos dos hubs (`../midia-kit/2026/index.html`) por
      caminho absoluto sem `.html`, para não pagar redirect extra com `cleanUrls`.
- [x] Verificar as URLs sensíveis uma a uma, sem barra no fim e com a query:
      - [x] `/midia-kit/2027` e `/midia-kit/2027?print-pdf`
      - [x] `/midia-kit/caravanas-2027` e `?print-pdf`
      - [x] `/midia-kit/2026`
      - [x] `/after/2026`
      - [x] `/relatorio/2026` (entrou no deploy em 2026-11-04)
- [x] `midia-kit.css` / `.js`: **hash no nome** (decisão de 2026-11-04). A fonte
      foi para `site/src/midia-kit/` e o `scripts/hash-midia-kit.sh` publica
      `public/midia-kit/midia-kit.<hash>.css|js`, reescrevendo a referência nos
      5 HTML que os usam (4 decks + relatório). Roda dentro do `npm run build`,
      é idempotente, e destrava a regra `immutable` do `vercel.json` para os
      dois arquivos — que antes caíam no `max-age` curto do `/(ds|css)/`.

---

## Fase 6 — SEO e analytics

- [x] JSON-LD saindo de `lib/schema.ts` em todas as páginas públicas:
      `Organization`, `Event` 2027 e `Event` 2026.
- [x] `sitemap.xml` à mão **apagado**. `@astrojs/sitemap` assume.
      `site/` nunca teve o arquivo (`/sitemap.xml` reescreve para o index) e o
      da raiz saiu na limpeza da Fase 10.
- [x] `filter` do sitemap excluindo **todas** as `noindex`: `/links`,
      `/relatorio`, `/apresentacoes`, `/impressos`, `/cerimonial/*`,
      `/mesa-redonda/*`, `/after/*`.
      Não precisou de `filter`: nenhuma é página Astro, e os decks públicos entram
      por `customPages`.
- [x] Conferir que o sitemap gerado tem as páginas que hoje faltam:
      `/2026/palestrantes`, `/2026/patrocinio`, `/2026/caravanas`,
      `/midia-kit/2027`, `/midia-kit/caravanas-2027`.
- [x] `llms.txt` revisado contra o conteúdo final.
- [x] Artes OG: `npm run og` dentro do container, conferindo que `sharp` e
      `opentype.js` rodam como devDependencies.

---

Feito junto: `/sobre` e `/eventos-de-tecnologia-parnaiba` passaram a tratar 2027
como edição vigente e 2026 como encerrada (horário 21h30 → 21h10, como no
JSON-LD); âncora morta `/#inscricao` → `/#lista-de-espera`; 4º redirect
`/midia-kit` → `/midia-kit/2027` entrou no `site/vercel.json` (Fase 7).

---

## Fase 7 — Vercel

- [x] **Root Directory = `site/`** no dashboard do projeto. Não existe no
      `vercel.json`. É a falha clássica: build passa local e quebra no deploy.
- [x] Confirmar o preset Astro detectado e `outputDirectory` = `dist`.
- [x] Node 24 na configuração do projeto, casando com `engines.node`.
- [x] `package-lock.json` commitado e em sincronia (`npm ci` tem que passar).
- [x] `vercel.json` sem `buildCommand` de `cache-bust.sh` (já removido) e sem
      `services` / `runtime: container`.
- [x] Manter os 4 `redirects`: `/palestrantes`, `/patrocinio`, `/caravanas`
      → `/2026/*`, e `/midia-kit` → `/midia-kit/2027`, todos `permanent: false`.
- [x] Manter `cleanUrls: true` e `trailingSlash: false`.
- [x] Headers: manter `/assets/(.*)` com `immutable` e **adicionar
      `/_astro/(.*)`** com `immutable` (caminho novo do Astro). Em 2026-11-04
      entrou `/midia-kit/midia-kit.(.*)`, também `immutable`, que só casa com os
      dois arquivos de tema hasheados — não com o `index.html` dos decks.
- [x] Revisar a regra `/(ds|css)/(.*)` — se o Astro passar a hashear esses
      arquivos, ela fica obsoleta.
      **Continua valendo:** `ds/` e `css/` estão em `public/`, que o Astro não
      hasheia. Fica com `max-age=86400, must-revalidate`.
- [x] `.vercelignore` revisado para os caminhos novos.
      **Errado na 1ª versão:** a Vercel lê o `.vercelignore` da raiz mesmo com
      Root Directory `site/`, e o `/site` nele apagou o projeto do clone
      (`ENOENT site/package.json`, build de 2026-11-04). Linha removida. O
      arquivo continua na raiz até a Fase 10, só com `/relatorio`, `/docs`, `/api`.
- [x] `/relatorio`: aplicar a decisão (fora do deploy ou Deployment Protection).
      Fora do deploy por construção: não está em `site/public/`. Se um dia
      precisar ser acessível, aí sim vira Deployment Protection.
- [x] Deploy de preview antes de qualquer coisa em produção. Os PRs #9 a #21
      foram deploys de preview antes de cada merge.

---

**Fase 7 fechada em 2026-11-04**: o dashboard está com Root Directory `site/`,
preset Astro, `dist` e Node 24, e a produção serve o Astro.

---

## Fase 8 — Cloudflare

- [x] Confirmar que **não** existe regra "Cache Everything" para HTML.
      Confirmado pelo dono da conta no painel (2026-11-04) e pela resposta do
      ar: o HTML volta com
      `cache-control: public, max-age=0, must-revalidate` e
      `cf-cache-status: DYNAMIC`.
- [x] Conferir que `/_astro/*` chega com `immutable` passando pelo Cloudflare:
      `/_astro/page.<hash>.js` volta `max-age=31536000, immutable` com
      `cf-cache-status: HIT`.
- [x] Purge único no cutover. Não foi preciso purgar à mão: todo arquivo que
      mudou de conteúdo mudou de nome (`/_astro/*`, e desde 2026-11-04 também
      `midia-kit.<hash>.css|js`). `ds/styles.css` e `css/site.css` seguem com
      `max-age=86400, must-revalidate`, que expira sozinho.

---

## Fase 9 — Verificação antes do cutover

Feito o que dava para medir pelo repositório e pelo ar; o resto ficou **em
suspenso por decisão de 2026-11-04** (o cutover já tinha acontecido, página por
página, nos PRs #9 a #21).

- [x] `npm run build` e `npm run check` passam. `npm run verify` também, com as
      7 verificações verdes — e duas delas foram consertadas em 2026-11-04: a de
      `<script type=module>` acusava o bundle do `@sentry/astro` desde que o
      Sentry entrou (agora libera só `/_astro/page.*` e barra o resto), e o
      `paginas()` tinha um `-not -path dist/midia-kit/*` dentro de `$( )`, cujo
      glob o shell expandia antes do `find` ver (virou filtro por `grep -vE`).
- [x] Diff de **texto renderizado** antes e depois, página por página. Foi o que
      pegou a única perda real da migração: as 4 páginas de `/2026` tinham
      `<div class="edition-banner">` ("Edição 2026 encerrada…") no topo do
      `<body>` e o porte não trouxe. Virou `EditionBanner.astro` no slot novo
      `pre-header` do `BaseLayout`; depois disso o texto de `/2026`,
      `/2026/palestrantes`, `/2026/patrocinio`, `/2026/caravanas` e `/` saiu
      **idêntico** ao HTML da raiz.
- [x] Inventário de URLs: as 9 rotas internas e os 5 decks respondem 200 em
      produção, sem barra no fim, com e sem `?print-pdf`.
- [ ] Conferir os números de 2026 na home e no kit 2027 contra
      `docs/RELATORIO-PATROCINADORES-2026.md`. **Em suspenso.**
- [ ] Conferir a escada de cotas do kit 2027 contra
      `docs/ESTRATEGIA-PATROCINIO-2027.md`. **Em suspenso.**
- [ ] GA4 no DebugView (`waitlist_click` nos 3 tipos, `sponsor_impression`,
      `sponsor_click`). **Em suspenso** — o código dos 3 eventos veio do porte
      1:1 e está no ar.
- [ ] PageSpeed na home e em `/2026` comparando com o número de hoje.
      **Em suspenso.**
- [ ] `?print-pdf` gerando 1920×1080 por slide nos 3 kits (as URLs respondem
      200; o render em si não foi conferido). **Em suspenso.**
- [ ] Clone limpo: `git clone` + `docker compose up`. **Em suspenso.**

---

## Fase 10 — Cutover e limpeza

- [x] Merge de `feat/monorepo-astro` em `main` e deploy de produção. Não foi um
      merge só: os PRs #9 a #21 levaram a migração para `main` em fatias, e a
      produção serve o Astro desde então (Root Directory `site/`).
- [ ] Monitorar 404 no painel da Vercel por 48h — é onde URL perdida aparece.
      Vale a partir do deploy da limpeza (2026-11-04).
- [x] Apagar as branches mortas, conferindo cada uma com
      `git log --oneline origin/<branch> ^origin/main`:
      `plano-2027` e `feat/patrocinadores` saíram com saída vazia (nada se
      perde). `feat/blog` **fica**: tem 9 commits fora da `main` (o blog, que
      está fora desta migração — `648438f` é a referência para restaurar o
      pipeline de markdown).
- [x] Apagar da raiz os arquivos que viraram `site/public/` ou `site/src/`:
      `index.html`, `2026/`, `after/`, `apresentacoes/`, `assets/`,
      `cerimonial/`, `css/`, `ds/`, `impressos/`, `links/`, `mesa-redonda/`,
      `midia-kit/`, `relatorio/`, `llms.txt`, `robots.txt`, `sitemap.xml`,
      `vercel.json` e `scripts/`. A raiz ficou com `site/`, `api/`, `docs/`,
      `docker/`, `docker-compose.yml`, `package.json` (só husky), `README.md`,
      `.github/`, `.husky/`, `.gitignore` e `.vercelignore`.
      **Antes de apagar, cada arquivo foi comparado com a contraparte em
      `site/`**, e a comparação achou coisa que estava só na raiz:
      - 9 fotos (`paula-barros-*`, `thiago-monteiro-*`) que nunca foram
        copiadas para `site/public/assets/palestrantes/` — davam 404 em
        produção, nas 2 páginas de 2026 e no `image` do JSON-LD.
      - O roteiro do cerimonial e o guia da mesa redonda: a cópia em `site/`
        veio da `feat/blog` (grade antiga, 14h30 → 21h30), e a da raiz tinha a
        revisão do dia do evento (14h25 → 21h10, pronúncias corrigidas). Ficou a
        da raiz, com o `noindex, nofollow` que a cópia do site já tinha, e o
        HTML foi regerado pelo `build-html.py` (sai igual ao da raiz).
      - A faixa `edition-banner` das 4 páginas de `/2026` (ver Fase 9).
      - Ficaram de fora de propósito, por serem versão superada: `og-2027.jpg`
        (substituído por `og-2027-data.jpg`, nome novo por causa do
        `immutable`), `phppi-vertical.svg` e `phppi-vertical-branco.svg`
        (variantes que nenhuma página usa; as em uso são `phppi.svg` e
        `phppi-branco.svg`). Estão no histórico do git. O `cajutec.webp` da
        raiz também é o antigo — o de `site/public` é mais novo.
- [x] `scripts/` da raiz: ficou algo que não é do site? Não — `site/scripts/`
      já tinha os 4 (`build-ds.sh`, `og-card.mjs`, `linkedin-cover.mjs`,
      `logo-fundo-chapado.mjs`), e o 5º (`listas-de-espera.gs`) estava morto.
      A pasta saiu inteira.
- [x] Atualizar `docs/MIGRACAO-ASTRO.md`: decisões em aberto resolvidas e
      Histórico registrado.
- [x] Anotar em `README.md` o que uma edição nova (2028) exige agora: seção
      "Edição nova" na raiz, com o detalhe em `site/README.md`.

---

## Fora deste checklist

Decidido não migrar, por não ter dívida e ser de uso único:

- os 4 decks reveal.js e o `relatorio/2026` — passthrough em `public/`
- as 9 páginas internas `noindex`
- `cerimonial/build-html.py`
- `scripts/listas-de-espera.gs` — morto desde 2026-11-03 (Google Forms fora).
  Apagado em 2026-11-04, junto com o resto de `scripts/` na Fase 10. Está no
  histórico do git.

Blog da `feat/blog`: decisão em aberto em `MIGRACAO-ASTRO.md`. Migrar a estrutura
e publicar são coisas separadas.

`api/`: entra no `docker-compose.yml` quando existir, não antes.
