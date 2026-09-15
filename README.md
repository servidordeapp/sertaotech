# sertaotech

Site do Sertão Tech — evento de tecnologia em Parnaíba - PI. Site estático
gerado com [Astro](https://astro.build) e publicado na Vercel.

## Rodando

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # gera dist/
npm run preview      # serve dist/ localmente
npm run verify       # build + todas as verificações (ver abaixo)
```

## Estrutura

```
public/              copiado byte a byte pro dist/, sem nenhum processamento
  ds/styles.css      design system (GERADO — ver abaixo)
  ds/tokens/*.css    fonte do design system
  css/site.css       layout do site
  css/article.css    tipografia de texto longo (blog e páginas de conteúdo)
  assets/            imagens, logos, cards de Open Graph
  robots.txt
  cerimonial/        documentos de impressão gerados por build-html.py
  mesa-redonda/      idem
  links/             stub de redirecionamento (noindex)
src/
  layouts/           BaseLayout (o <head> e o shell) e ArticleLayout (posts)
  components/        header, footer, cabeçalho de página, cards, ícones
  lib/site.ts        constantes de identidade (domínio, GA4, contatos)
  lib/schema.ts      construtores de JSON-LD
  lib/blog.ts        listagem e relacionados dos posts
  data/              dados da edição do evento e histórico de edições
  content/blog/*.md  os posts
  content.config.ts  schema (zod) do frontmatter dos posts
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

## Blog

Cada post é um `.md` em `src/content/blog/`, com frontmatter validado por zod
em `src/content.config.ts` — descrição fora de 80–165 caracteres, título longo
demais ou imagem sem `alt` **quebram o build** de propósito.

O nome do arquivo é a URL: `meu-post.md` → `/blog/meu-post`.

Card de Open Graph de cada post:

```bash
npm run og:post -- --all      # gera todos + o card do /blog
npm run og:post -- meu-post   # um só
npm run og:post -- --check    # falha se faltar card
```

O script quebra o título em até 3 linhas e reduz o corpo até caber. Se não
couber nem no menor corpo, ele falha com erro — card com texto cortado é pior
que build quebrado. Nesse caso, encurte o título ou defina um `titleSeo`.

## SEO

A estrutura de URL e o grafo de JSON-LD estão documentados em
`src/lib/schema.ts`. Duas convenções que é fácil quebrar sem perceber:

- **A home é sempre a edição vigente.** Cada edição passada ganha URL
  permanente em `/edicoes/<ano>`. O `@id` `#event` significa sempre a edição
  corrente e mora na home.
- **`/eventos-de-tecnologia-parnaiba` é a página-âncora.** Não fala de edição
  nenhuma, então sobrevive à troca de ano e acumula link e idade. Todo post do
  blog linka pra ela do corpo do texto — o `npm run verify` verifica isso.

O que fazer fora do repositório (Search Console, Google Business Profile,
citações locais, backlinks e o calendário de manutenção) está em
[`docs/seo-local.md`](docs/seo-local.md).

## Deploy

Vercel, a partir do `vercel.json`: `npm run build` → `dist/`, com `cleanUrls`
e `trailingSlash: false` (ou seja, `/patrocinio`, sem barra no fim). O sitemap
é gerado pelo `@astrojs/sitemap` como `sitemap-index.xml`; existe um rewrite de
`/sitemap.xml` pra ele, porque é `/sitemap.xml` que está enviado no Search
Console.
