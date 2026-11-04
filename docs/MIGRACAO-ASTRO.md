# Migração para Astro — monorepo docker-first

Documento vivo. Edite à vontade e versione junto com o código.

**Objetivo:** sair de HTML estático escrito à mão para Astro com saída estática
(SSG), dentro de um monorepo onde cada aplicação é um container e
`docker compose up` sobe tudo localmente. O deploy na Vercel continua estático.

**Escopo deste documento:** decisão, diagnóstico e pendências. A execução está em
[`CHECKLIST-MIGRACAO-ASTRO.md`](CHECKLIST-MIGRACAO-ASTRO.md).

---

## Decisões

1. **Astro**, não Next SSG. Motivos na seção "Por que Astro" abaixo.
2. **Saída estática.** `astro build` → `dist/`. Nada de container em produção.
3. **Monorepo.** O site vai para `site/`. A raiz passa a hospedar outros
   projetos (`api/` é o próximo previsto). Documentação em `docs/`.
4. **Docker-first para desenvolvimento.** Um `docker compose up` na raiz sobe
   todas as aplicações do repositório. Nenhuma ferramenta de desenvolvimento é
   pré-requisito na máquina além do Docker.
5. **Node 24**, imagem enxuta (`node:24-alpine`, com `node:24-slim` como
   fallback — ver "Riscos").
6. `sharp` e `opentype.js` em `devDependencies`. São usados só pelos scripts de
   geração de arte, rodados localmente, nunca no build de produção.
7. `scripts/cache-bust.sh` **descartado**. Existia para compensar a ausência de
   bundler; o Astro hasheia os próprios assets em `/_astro/`.

### Os dois caminhos do mesmo código

Essa é a parte que mais confunde e a que já deu errado uma vez (ver "Prior art"):

| | Local | Vercel |
|---|---|---|
Como roda | `docker compose up` → `astro dev` no container | `astro build` → arquivos estáticos no CDN |
O que define | `docker-compose.yml` + `site/Dockerfile` | Root Directory `site/` + preset Astro |
Dockerfile participa? | sim | **não** |

O Dockerfile é ferramenta de desenvolvimento. A Vercel não deve nem olhar para
ele. Se um dia aparecer no `vercel.json` como `runtime: container`, o site
estático virou compute pago — regressão, não evolução.

---

## Por que Astro e não Next SSG

| Critério | Astro | Next SSG |
|---|---|---|
Custo de porte do HTML atual | `.astro` aceita HTML cru quase literal | JSX: `class`→`className`, auto-fechamento, `style=` vira objeto. São **337 atributos `style=`**, **242 SVG inline** e **508 linhas de `<style>`** para converter à mão |
JS enviado ao navegador | 0 por padrão | baseline React (~90 kB) num site que hoje manda 34 linhas de JS |
Coleções de conteúdo | nativo e tipado (`content.config.ts`) | precisa de `contentlayer` ou solução própria |
Sitemap | `@astrojs/sitemap` | à mão ou dependência extra |
Decks reveal.js com `?print-pdf` | passthrough em `public/` | idem, sem ganho nenhum |
Prior art no repositório | 9 commits prontos | zero |

Next só compensaria com React, SSR, ISR, rotas de API ou autenticação. O negócio
não tem nada disso: é conteúdo estático, Google Forms e GA4. Quando `api/`
existir, ele é um serviço separado no monorepo — não é motivo para trocar o
framework do site.

---

## Estado atual (base para a migração)

17 páginas HTML, 6.817 linhas. 98 commits em 4 meses.

| Métrica | Valor |
|---|---|
CSS | 1.977 linhas (`css/site.css` 995, `ds/styles.css` 274 gerado de 8 tokens, `midia-kit/midia-kit.css` 432) |
JS em arquivo | 34 linhas (`midia-kit/midia-kit.js`) |
JS inline em `<script>` | ~1.278 linhas |
CSS inline em `<style>` | ~508 linhas |
`style="…"` inline | 337 ocorrências (95 só no kit 2027) |
SVG inline | 242 ícones, 55 paths únicos |
Build steps ad-hoc | 3 (`build-ds.sh`, `cache-bust.sh`, `cerimonial/build-html.py`) |
`package.json` na raiz | nenhum |
Páginas `noindex` internas | 9 |
Decks reveal.js (CDN 5.1.0) | 4 |

### O que de fato dói

Não é tamanho. É duplicação sem fonte única:

| Duplicado | Onde |
|---|---|
Snippet GA4 (`G-62RC94ZH1Z`) | 6 páginas |
Trio Google Fonts (preload + `media=print` swap + noscript) | 10 páginas |
`<header>` + JS do `navToggle` | 5 páginas |
Telemetria de patrocinador (~60 linhas) | 3 páginas |
`<footer>` (~41 linhas) | 5 páginas |
`<head>` boilerplate | 69 a 498 linhas **por página** |

`2026/index.html` tem `<head>` de 498 linhas — o JSON-LD do evento inteiro
escrito à mão. Toda troca de palestrante exige editar dois lugares (schema e
markup) e já houve troca de slots entre duas pessoas em commit único
(`b5b1a42`).

Dados que são coleção e hoje são markup:

- 19 palestrantes (`speaker card` ×19, 4 tamanhos de WebP cada)
- 16 linhas de agenda (`agenda-row` ×16)
- 6 a 8 patrocinadores por cota
- galeria de fotos de 2026 (12 momentos × 3 larguras)

Outros pontos:

- `node_modules` sem manifest. `scripts/*.mjs` precisam de `sharp` e
  `opentype.js` e nada declara isso. Clone novo não gera arte OG.
- `sitemap.xml` à mão com 2 URLs. Faltam `/2026/palestrantes`,
  `/2026/patrocinio`, `/2026/caravanas`, `/midia-kit/2027`,
  `/midia-kit/caravanas-2027`. Buraco de SEO num projeto que trata SEO como ativo.
- Sprite `icons.svg` (32 símbolos) usado só nos 4 decks. As páginas do site
  repetem SVG inline 242 vezes.

Diagnóstico: o projeto não está grande demais, está **sem camada de
composição**. A dor cresce linear com o número de páginas e já passou do ponto
em que layout mais coleção de dados se pagam.

---

## Regras de negócio que a estrutura tem que preservar

Negócio é evento anual com arquivo por edição. Isso dita o roteamento:

- **Versionamento por ano é a regra central.** `/` é a edição corrente (2027),
  `/2026/*` é arquivo congelado, mais `/midia-kit/<ano>`, `/relatorio/<ano>`,
  `/after/<ano>`. Edição nova nasce de `cp -r` da anterior. Os redirects sem ano
  (`/palestrantes` → `/2026/palestrantes`) apontam para a edição corrente e são
  `permanent: false` de propósito.
- **Três funis de captação**: participante, palestrante e patrocinador, via
  Google Forms, com evento GA4 `waitlist_click` lido do `data-waitlist`.
- **Patrocínio é o produto que paga.** Escada de cotas (Master R$ 15.000,
  Robótica e Negócios R$ 10.000 cada, Sênior+ R$ 7.500, Ouro R$ 5.000, Prata
  R$ 2.500, Bronze R$ 1.000), mural de logos com telemetria própria
  (`sponsor_impression` e `sponsor_click`, a impressão servindo de denominador
  via `IntersectionObserver`) e relatório pós-evento prometido em 30 dias. Nome
  e cota saem do `alt` da imagem e do `aria-labelledby` do tier, então
  patrocinador novo passa a ser medido sem tocar em JS. **Convenção a preservar
  na migração.**
- **Caravanas** é canal B2B com instituição de ensino: 20 a 50 pessoas, R$ 20
  por pessoa contra R$ 40 do ingresso individual.
- **Material interno versus público**: `/relatorio` fora do deploy via
  `.vercelignore`; `/apresentacoes` e `/impressos` são hubs `noindex` que linkam
  decks e impressos.
- **SEO e LLM são tratados como ativo**: `llms.txt` curado, JSON-LD por página,
  artes `og-*.jpg` geradas por script.

---

## Prior art: a migração já existe, e está desatualizada

`origin/feat/blog` tem uma migração Astro completa sob `site/`:

```
63adeb0 refactor: migra o site estático para Astro sem mudar as páginas atuais
fb2bef5 feat: blog e páginas-âncora de SEO local
aa36e7d feat: 1ª edição, autoria e publicação escalonada
… 9 commits, 282 arquivos, +13.819 / −7.234
```

Já pronto lá:

- `astro.config.mjs` com `trailingSlash: 'never'` e `build.format: 'directory'`
  — exatamente o casamento com `cleanUrls: true` / `trailingSlash: false` do
  Vercel, com o porquê comentado no arquivo
- `layouts/BaseLayout.astro` e `ArticleLayout.astro`
- 11 componentes: `PageHead`, `SiteHeader`, `SiteFooter`, `Icon`, `CtaBand`,
  `Faq`, `Toc`, `PostCard`, `PostMeta`, `RelatedPosts`, `NextLinks`
- `lib/schema.ts` (208 linhas) — JSON-LD gerado, mata o `<head>` de 498 linhas
- `content.config.ts` e 8 posts em content collection
- `data/evento-2026.json`, `data/edicoes.ts`, `data/edicao-2025.ts` — dados já
  extraídos do markup
- `@astrojs/sitemap` com `filter` e `serialize` por rota
- `@astrojs/rss` em `blog/feed.xml.ts`
- `scripts/verify-build.sh`

**Problema:** divergiu em `3b4c390` e está 32 commits atrás. O diff dela apaga
`PLANO-2027.md`, `/midia-kit/2027`, `/after`, `/relatorio` e as fotos de 2026 —
tudo isso nasceu depois. A branch é da era "2026 ainda vai acontecer, 2025 é o
arquivo".

**Consequência: não dá merge.** A branch entra como esqueleto, não como
conteúdo. Traz-se `site/` por `git checkout origin/feat/blog -- site/` e
reaplica-se o conteúdo atual de `main` por cima.

**O que descartar dela:** o `vercel.json` da raiz usa `services` +
`runtime: "container"` + `Dockerfile.vercel` + nginx. Isso é deploy em
container, não é SSG — paga compute, perde CDN estático e adiciona nginx para
manter. É justamente o erro que a decisão 2 deste documento evita. O
`Dockerfile` dela pode ser aproveitado como base do container **de
desenvolvimento**; `Dockerfile.vercel` e `docker/nginx.conf.template` vão fora.

Com a prior art, o risco da migração cai de médio para baixo: a parte difícil
(decidir estrutura, casar roteamento com Vercel, escrever o gerador de schema)
está feita e comentada.

---

## Estrutura alvo

```
/
  docker-compose.yml          # sobe todas as aplicações do monorepo
  README.md
  docs/                       # este documento e os planos de negócio
  site/                       # Astro (Root Directory na Vercel)
    Dockerfile                # desenvolvimento, nunca produção
    astro.config.mjs
    package.json
    src/
      layouts/  components/  content/  data/  lib/  pages/
    public/                   # passthrough: decks, impressos, llms.txt, assets
    scripts/                  # build-ds.sh, og-card.mjs, …
  api/                        # futuro, serviço próprio no compose
```

---

## Complexidade por área

| Área | Dificuldade | Nota |
|---|---|---|
`<head>` / meta / OG / JSON-LD | baixa | `PageHead.astro` e `lib/schema.ts` já existem |
Header / footer / nav | baixa | componentes já existem; o JS do nav vira um `<script>` no layout |
`/` (home 2027, 500 linhas) | média | página mais nova, não existe na branch. Porte manual |
`/2026/*` (4 páginas, 3.253 linhas) | média | arquivo congelado, porte 1:1 sem redesenho. `evento-2026.json` já cobre parte |
19 palestrantes → collection | média | ganho alto: 971 linhas viram collection e um template |
16 linhas de agenda → collection | baixa | dados simples |
Mural e telemetria de patrocinador | baixa | um componente e um script; a convenção `alt` / `aria-labelledby` se mantém |
`ds/tokens/*` e `build-ds.sh` | baixa | o Astro faz o bundle; `build-ds.sh` pode sair ou ficar, é um arquivo |
`cache-bust.sh` | sai | decisão 7 |
4 decks reveal.js (1.721 linhas) | **não migrar** | ficam em `public/` intactos, preservando URL e `?print-pdf` |
9 páginas internas `noindex` | **não migrar** | `public/`. `cerimonial/build-html.py` continua como está |
`llms.txt`, `robots.txt` | trivial | `public/` |
`sitemap.xml` | sai | a integração gera |

**Linha de corte:** migrar `/` e `/2026/*`. Decks, impressos e cerimonial ficam
como arquivos estáticos em `public/` — não têm dívida, são de uso único e já
funcionam.

Estimativa: 3 a 5 dias focados, sendo cerca de 1 dia só para o rebase conceitual
da branch contra `main`. Sem a prior art seriam 8 a 12.

---

## Pendências para o deployment na Vercel

### Configuração de build

- **Root Directory `site/` é setting do dashboard da Vercel, não vai no
  `vercel.json`.** Pegadinha clássica do monorepo: o build passa local e falha
  no deploy. Com o Root Directory certo, o preset Astro é detectado e o
  `outputDirectory` (`dist`) vem junto.
- `package-lock.json` commitado e em sincronia, senão `npm ci` quebra no deploy.
- Node 24 fixado (`engines.node` no `package.json` e a versão de Node do projeto
  na Vercel).
- `sharp` em `devDependencies` (decisão 6): sem isso compila binário nativo em
  todo build de produção, sem necessidade nenhuma.
- Remover a chave `allowScripts` do `package.json` da branch — não é npm padrão,
  é resquício de lavamoat/pnpm, e confunde instalação.
- Garantir que a Vercel ignore `Dockerfile` e `docker-compose.yml`. O preset
  Astro já faz isso; o que não pode acontecer é um `vercel.json` com `services`
  ou `runtime: container`.

### Roteamento e URLs

- Manter os 4 `redirects` e as 2 regras de `headers` do `vercel.json` atual.
  `/midia-kit` → `/midia-kit/2027` tem que continuar, e é lá que se troca quando
  2028 nascer.
- `trailingSlash` e `build.format` do Astro têm que casar com `cleanUrls: true`
  e `trailingSlash: false`, senão dá loop de redirect ou 404. Já resolvido no
  `astro.config.mjs` da branch — copiar junto com o comentário.
- As URLs dos decks são **apresentadas ao vivo e mandadas por WhatsApp**.
  `/midia-kit/2027?print-pdf`, `/after/2026` e `/relatorio/2026` não podem mudar
  nem ganhar barra no fim.
- Os hubs internos linkam com `../midia-kit/2026/index.html`. Com `cleanUrls`
  isso custa um redirect extra. Trocar por caminho absoluto sem `.html`.

### Cache e Cloudflare

- Cloudflare está na frente da Vercel servindo CSS e JS com `max-age` de um ano.
  Precisa de header `immutable` para `/_astro/(.*)` (nome novo). A regra de
  `/assets/(.*)` continua valendo para o passthrough de `public/`.
- Confirmar que **não** existe regra "Cache Everything" para HTML no Cloudflare.
  Se existir, precisa de purge a cada deploy — e aí o hash do Astro não cobre o
  HTML.
- **Arquivos em `public/` não são processados pelo Astro.**
  `midia-kit/midia-kit.css` e `.js` perdem o `?v=` que o `cache-bust.sh` dava.
  Duas saídas: trazer esses dois para `src/` (o Astro hasheia) ou renomear o
  arquivo quando mudar. Se os decks ficarem em `public/`, é a segunda.

### Conteúdo e exposição

- `.vercelignore` precisa acompanhar os caminhos novos. Já atualizado para
  `/docs` nesta rodada; revisar de novo quando o site descer para `site/`.
- Decidir o destino de `/relatorio`: segue fora do deploy ou entra atrás do
  Deployment Protection da Vercel. É material de patrocinador.
- O `filter` do sitemap tem que excluir **todas** as páginas `noindex`, não só
  `/links`: `/relatorio`, `/apresentacoes`, `/impressos`, `/cerimonial/*`,
  `/mesa-redonda/*`, `/after/*`. Hoje o sitemap de 2 URLs esconde o problema; a
  integração vai expor tudo que achar.
- GA4 `G-62RC94ZH1Z` em um componente só. Depois do deploy, verificar que
  `waitlist_click`, `sponsor_impression` e `sponsor_click` ainda disparam — a
  telemetria de patrocinador é entregável contratual do relatório pós-evento.

### Git

- Não fazer `merge` de `feat/blog` em `main`. Branch nova a partir de `main`,
  `site/` trazido por `git checkout origin/feat/blog -- site/`, conteúdo de
  `main` reaplicado por cima.
- `plano-2027` está idêntica a `main` (diff vazio). Limpar as branches remotas
  antes de abrir frente nova.

---

## Bug em produção, anterior à migração

**`origin/main` tem 11 CTAs mortos na home.** Os marcadores de formulário nunca
foram trocados pelas URLs reais:

```
index.html:127  href="FORM_PARTICIPANTE"
index.html:217  href="FORM_PARTICIPANTE"
index.html:223  href="FORM_PALESTRANTE"
index.html:229  href="FORM_PATROCINADOR"
…  11 no total
```

O navegador resolve como caminho relativo:
`https://osertaotech.com.br/FORM_PARTICIPANTE` → 404. A home é página de
captação de lista de espera e **todo** botão de captação está quebrado.
`scripts/listas-de-espera.gs` existe e cria os forms, mas as URLs nunca voltaram
para o HTML. A Fase 2 do `PLANO-2027.md` está marcada como concluída e não está.

Corrigir **antes** de migrar. Migrar com os marcadores dentro só carrega o bug
para a stack nova.

---

## Riscos

- **O maior risco não é técnico, é de conteúdo.** São 6.817 linhas de HTML com
  texto comercial, números de patrocínio e bios revisadas. Porte manual perde ou
  troca coisa silenciosamente. Mitigar com diff do texto renderizado antes e
  depois, não com revisão visual.
- **Alpine e `sharp`.** `node:24-alpine` é a imagem enxuta pedida, mas o `sharp`
  depende de binário nativo musl. Se der problema no container de
  desenvolvimento, o fallback é `node:24-slim` (Debian). Knob a calibrar na
  primeira subida, não no papel.
- **File watching no WSL2.** `astro dev` dentro de container com bind mount em
  WSL2 costuma não receber eventos de arquivo. Pode precisar de polling no
  `server.watch` do Vite. Também knob de calibração.
- **`node_modules` no bind mount.** Montar o fonte sem isolar `node_modules` faz
  o host sobrescrever o que foi instalado no container. Volume anônimo para
  `node_modules`, obrigatório.
- A branch `feat/blog` traz um blog de 8 posts que ninguém pediu neste escopo.
  Migrar a estrutura e lançar o blog são decisões separadas: portar sem publicar.
- Se o `vercel.json` de container vier junto sem revisão, troca-se um site
  estático de custo zero por compute. Ponto de atenção explícito, já errado uma
  vez.

---

## Decisões em aberto

- [ ] `/relatorio` fica fora do deploy ou entra com Deployment Protection?
- [ ] `build-ds.sh` sai (tokens importados pelo Astro) ou fica como está?
- [ ] `midia-kit.css` / `.js` vão para `src/` (hash automático) ou ficam em
      `public/` com rename manual?
- [x] ~~Blog da `feat/blog`~~ — **fora desta migração** (2026-11-03). Os 8 posts,
      as rotas `/blog`, o feed RSS, a content collection e os componentes só de
      post saíram na Fase 2. O que pesou: com os posts fora, 7 links internos
      ficavam quebrados e o `/blog` ia ao ar como página vazia; manter o blog
      significava publicar conteúdo da era "2025 é o arquivo" sem revisão.
      Tudo está em `648438f` se o blog voltar.
- [ ] `api/` entra no compose já agora como placeholder, ou só quando existir?

## Histórico

- 2026-11-03 — Fases 1 e 2 do checklist: raiz do monorepo (README índice,
  `.gitignore`) e esqueleto Astro em `site/`, trazido de `origin/feat/blog` sem
  merge. Blog decidido para fora da migração. Deploy em container descartado na
  prática (`Dockerfile.vercel`, `docker/` e os estágios `build`/`prod` do
  `Dockerfile`). `npm run verify` verde com 6 páginas.
- 2026-11-03 — Primeira versão. Decisão por Astro estático, monorepo
  docker-first com o site em `site/`, Node 24 enxuto, `sharp` em
  `devDependencies`, `cache-bust.sh` e o deploy em container descartados.
  Documentação movida para `docs/`.
