# sertaotech

Site do Sertão Tech — evento de tecnologia em Parnaíba - PI. Site estático
gerado com [Astro](https://astro.build) e publicado na Vercel. Mora em `site/`
dentro do repositório; a raiz é só a stack (ver [README da raiz](../README.md)).

## Rodando

Direto no host, de dentro de `site/`:

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # gera dist/
npm run preview      # serve dist/ localmente
npm run verify       # build + todas as verificações (ver abaixo)
```

### Com Docker

O `Dockerfile` tem o estágio `dev` (`astro dev` em `0.0.0.0:4321`), mas o
`docker-compose.yml` da raiz que o usa só chega na Fase 3 da migração — ver
[`docs/CHECKLIST-MIGRACAO-ASTRO.md`](../docs/CHECKLIST-MIGRACAO-ASTRO.md).
Até lá, rode no host.

Não existe estágio de produção: na Vercel o site é estático, servido do CDN, e
o Dockerfile é ferramenta de desenvolvimento — a Vercel não olha pra ele.

## Estrutura

```
Dockerfile           imagem de desenvolvimento (estágios base, deps e dev)
vercel.json          configuração do deploy estático (Root Directory = site/)
public/              copiado byte a byte pro dist/, sem nenhum processamento
  ds/styles.css      design system (GERADO — ver abaixo)
  ds/tokens/*.css    fonte do design system
  css/site.css       layout do site
  css/article.css    tipografia de texto longo (páginas de conteúdo)
  assets/            imagens, logos, cards de Open Graph
  robots.txt
  cerimonial/        documentos de impressão gerados por build-html.py
  mesa-redonda/      idem
  links/             stub de redirecionamento (noindex)
src/
  layouts/           BaseLayout — o <head> e o shell de toda página
  components/        header, footer, cabeçalho de página, ícones
  lib/site.ts        constantes de identidade (domínio, GA4, contatos)
  lib/schema.ts      construtores de JSON-LD
  data/              dados da edição do evento
  pages/             uma página por rota
scripts/             build do design system e geradores de arte
docs/seo-local.md    o que fazer fora do código (Search Console, GBP, links)
```

## Design system: `public/ds/styles.css` é gerado

É a concatenação de `public/ds/tokens/*.css`. Antes usava `@import` em cada
arquivo de token, mas o navegador só descobre um `@import` depois de baixar e
interpretar o arquivo que importa — o que enfileirava uma ida e volta extra
antes do primeiro paint, por token (8 requisições a mais, apontadas num audit
de PageSpeed). Concatenar reduz isso a uma requisição.

**Depois de editar qualquer arquivo em `public/ds/tokens/`, regere:**

```bash
npm run ds
```

Faça commit do token que você mudou **e** do `public/ds/styles.css` regerado.
Não edite `styles.css` na mão — o próximo build sobrescreve.

`public/ds/tokens/fonts.css` fica de fora do build: não tem regra CSS, só um
comentário explicando por que as fontes do Google entram com `<link>` direto no
`<head>` (com preload + troca de `media="print"`, pra não bloquear o
render) em vez de `@import`.

## Cuidados que não devem regredir

Todos saíram de um audit de PageSpeed. São silenciosos quando quebram, e é por
isso que o `npm run verify` checa cada um:

- **Nada de `<style>` em `src/`.** O Astro empacotaria num terceiro CSS
  bloqueante em toda página. Ajuste local se faz com `style=""` usando as
  variáveis do design system, nunca hex cru.
- **Todo `<script>` leva `is:inline`.** Sem isso o Astro transforma em módulo
  ES, o que tira `gtag()` do escopo global e mata a analytics de patrocinador
  em `/patrocinio` sem erro nenhum.
- **Todo `<img>` leva `width` e `height` reais** (dimensão do arquivo), pra
  reservar espaço e não causar layout shift.
- **`fetchpriority="high"` só na imagem do topo da home.**
- **Nada de `astro:assets` nas imagens de `public/assets/`.** O hash no nome
  quebraria o `Cache-Control: immutable` e a estabilidade das URLs que
  WhatsApp, LinkedIn e Facebook guardam em cache.

## SEO

A estrutura de URL e o grafo de JSON-LD estão documentados em
`src/lib/schema.ts`. Duas convenções que é fácil quebrar sem perceber:

- **A home é sempre a edição vigente.** Cada edição passada ganha URL
  permanente por ano (hoje `/2026` no site estático da raiz, que ainda não foi
  portado). O `@id` `#event` significa sempre a edição corrente e mora na home.
- **`/eventos-de-tecnologia-parnaiba` é a página-âncora.** Não fala de edição
  nenhuma, então sobrevive à troca de ano e acumula link e idade. É pra ela que
  as outras páginas apontam.

O que fazer fora do repositório (Search Console, Google Business Profile,
citações locais, backlinks e o calendário de manutenção) está em
[`docs/seo-local.md`](docs/seo-local.md) — escrito quando o blog fazia parte do
escopo, então a parte de conteúdo editorial está em suspenso (ver a decisão do
blog em [`../docs/MIGRACAO-ASTRO.md`](../docs/MIGRACAO-ASTRO.md)).

## Deploy

Vercel, a partir do `vercel.json`: `npm run build` → `dist/`, com `cleanUrls`
e `trailingSlash: false` (ou seja, `/patrocinio`, sem barra no fim). O sitemap
é gerado pelo `@astrojs/sitemap` como `sitemap-index.xml`; existe um rewrite de
`/sitemap.xml` pra ele, porque é `/sitemap.xml` que está enviado no Search
Console.
