# Checklist de execução — migração para Astro

Decisões, diagnóstico e riscos em [`MIGRACAO-ASTRO.md`](MIGRACAO-ASTRO.md).
Este arquivo é só a execução, em ordem de dependência. Marque conforme avança e
versione junto.

Regra: **nenhuma fase começa antes da anterior fechar.** A Fase 0 é bug em
produção e não espera migração — mas **não bloqueia** as fases seguintes: é um
`href` em 11 lugares, trocado em um `sed` quando o destino existir.

---

## Fase 0 — Corrigir produção (não depende da migração)

**Estado:** aberta, esperando o formulário próprio. Google Forms foi abandonado
em 2026-11-03 (ver Fase 2 de [`PLANO-2027.md`](PLANO-2027.md)), então não existe
URL para colocar nos marcadores. Os 11 botões da home continuam sem destino.

Feito:

- [x] Decisão registrada na Fase 2 de `docs/PLANO-2027.md`, com o conteúdo dos
      3 forms preservado como especificação do formulário próprio.
- [x] Comentário de marcadores em `index.html` reescrito: diz que os botões não
      funcionam e por quê, em vez de mandar colar um `viewform`.
- [x] `scripts/listas-de-espera.gs` marcado como morto no plano (apagar junto
      com o formulário próprio; está no histórico do git).

Esperando o formulário próprio:

- [ ] Formulário próprio das 3 listas de espera, pelo conteúdo da Fase 2 de
      `docs/PLANO-2027.md` (perguntas, obrigatoriedade e bloco de LGPD).
      Em aberto lá: onde a resposta é gravada e se exige `api/`.
- [ ] Trocar os 11 marcadores em `index.html`:
      ```bash
      sed -i 's|href="FORM_PARTICIPANTE"|href="<url-participante>"|g; \
              s|href="FORM_PALESTRANTE"|href="<url-palestrante>"|g; \
              s|href="FORM_PATROCINADOR"|href="<url-patrocinador>"|g' index.html
      ```
      Se a migração já tiver passado da Fase 4.3, o arquivo é a home Astro,
      não `index.html`.
- [ ] Verificar que não sobrou nenhum: `grep -c 'href="FORM_' index.html` → `0`
- [ ] Apagar de novo o comentário de marcadores: depois da troca ele não tem
      mais razão de existir.
- [ ] Commit + deploy. Conferir os 11 botões na home em produção.
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
- [ ] `relatorio/2026` conforme a decisão em aberto (fora do deploy ou protegido).
      Segue só na raiz; o hub `/apresentacoes` ainda linka `/relatorio/2026` e o
      `verify` ignora esse destino até a decisão.
- [x] 9 páginas internas `noindex`: `apresentacoes`, `impressos`, `links`,
      `cerimonial/*`, `mesa-redonda/*`. `cerimonial/build-html.py` continua como
      está.
- [x] `llms.txt`, `robots.txt`, `assets/`, `midia-kit/icons.svg`,
      `midia-kit/midia-kit.css`, `midia-kit/midia-kit.js`.
      `robots.txt`, `css/` e `assets/` já tinham versão própria em `site/public/`
      (sitemap-index, Disallow dos internos) e **não** foram sobrescritos.
- [x] Trocar os links relativos dos hubs (`../midia-kit/2026/index.html`) por
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
- [ ] Apagar as branches mortas. **Conferir antes de cada uma**, com a mesma
      pergunta: a branch tem commit que não está em `origin/main`?
      ```bash
      git fetch origin
      for b in plano-2027 feat/blog feat/patrocinadores; do
        echo "== $b"; git log --oneline origin/$b ^origin/main
      done
      ```
      Saída vazia = nada se perde, pode apagar. Saída com commits = **merge
      primeiro**, ou o trabalho vai junto:
      ```bash
      git push origin --delete <branch>
      ```
      Estado em 2026-11-03: `plano-2027` **não** tem diff vazio contra `main` —
      está 4 commits à frente de `origin/main` (docs e o relatório de 2026) e
      zero atrás. Os únicos commits de `origin/main` fora dela são os merges
      dos PRs #4 e #5, da própria branch. Diferença de conteúdo contra
      `origin/main` fora desses 4: só os 5 renames para `docs/`, zero linhas.
      É nela que esta migração está sendo planejada, então ela sai por último,
      depois de `feat/monorepo-astro` entrar em `main`. (`feat/blog` já foi
      aproveitada na Fase 2.)
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
- `scripts/listas-de-espera.gs` — morto desde 2026-11-03 (Google Forms fora).
  Não migra: apaga, junto com o formulário próprio.

Blog da `feat/blog`: decisão em aberto em `MIGRACAO-ASTRO.md`. Migrar a estrutura
e publicar são coisas separadas.

`api/`: entra no `docker-compose.yml` quando existir, não antes.
